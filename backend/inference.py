# backend/inference.py
import json
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List, Optional

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image, UnidentifiedImageError

# ----------------- PATHS & DEVICE -----------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "food101_resnet50.pth"
IDX_TO_CLASS_PATH = BASE_DIR / "data" / "idx_to_class.json"
ALLERGENS_PATH = BASE_DIR / "data" / "dish_allergens.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ----------------- LOAD LABEL MAP & ALLERGEN DB -----------------
with IDX_TO_CLASS_PATH.open("r") as f:
    # JSON keys are strings; convert to int
    raw_idx_to_class: Dict[str, str] = json.load(f)
    IDX_TO_CLASS: Dict[int, str] = {int(k): v for k, v in raw_idx_to_class.items()}

if ALLERGENS_PATH.exists():
    with ALLERGENS_PATH.open("r") as f:
        ALLERGEN_DB: Dict[str, Any] = json.load(f)
else:
    # fall back to empty db if file missing
    ALLERGEN_DB = {}


# ----------------- MODEL BUILD / LOAD -----------------
def build_model(num_classes: int) -> nn.Module:
    """Create a ResNet-50 with a custom classification head."""
    model = models.resnet50(weights=None)
    in_feats = model.fc.in_features
    model.fc = nn.Linear(in_feats, num_classes)
    return model


NUM_CLASSES = len(IDX_TO_CLASS)

MODEL = build_model(NUM_CLASSES)
STATE_DICT = torch.load(MODEL_PATH, map_location=DEVICE)
MODEL.load_state_dict(STATE_DICT)
MODEL.to(DEVICE)
MODEL.eval()


# ----------------- TRANSFORMS -----------------
INFER_TF = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ----------------- INTERNAL PREDICTION -----------------
def _predict_class(
    image: Image.Image,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """
    Run the model on a PIL image and return:
      - top class name
      - confidence (float)
      - top-3 predictions for debugging / UI
      - is_confident flag (based on threshold)
    """
    tensor = INFER_TF(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = MODEL(tensor)
        probs = torch.softmax(logits, dim=1)[0]

    top_prob, top_idx = torch.max(probs, dim=0)
    top_prob_f = float(top_prob.cpu().item())
    top_idx_i = int(top_idx.cpu().item())
    class_name = IDX_TO_CLASS[top_idx_i]

    # top-3 for debugging / UI
    topk_probs, topk_indices = torch.topk(probs, k=3)
    top3: List[Dict[str, Any]] = []
    for p, i in zip(topk_probs, topk_indices):
        top3.append({
            "class_name": IDX_TO_CLASS[int(i.cpu().item())],
            "prob": float(p.cpu().item()),
        })

    return {
        "class_name": class_name,
        "confidence": top_prob_f,
        "top3": top3,
        "is_confident": top_prob_f >= threshold,
    }


# ----------------- PUBLIC ENTRYPOINT FOR FASTAPI -----------------
def predict_from_image_bytes(
    data: bytes,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """
    Main function FastAPI will call.
    - Takes raw image bytes
    - Returns dish info + allergen profile (if available)
    """
    try:
        image = Image.open(BytesIO(data)).convert("RGB")
    except UnidentifiedImageError:
        raise ValueError("Uploaded file is not a valid image.")

    pred = _predict_class(image, threshold=threshold)
    class_name: str = pred["class_name"]

    entry: Optional[Dict[str, Any]] = ALLERGEN_DB.get(class_name)

    if entry is None:
        # No allergen metadata for this dish class
        return {
            "dish_key": class_name,
            "dish_name": class_name,
            "cuisine": None,
            "confidence": pred["confidence"],
            "allergens": None,
            "warning": "No allergen profile found for this dish class.",
            "top3": pred["top3"],
        }

    return {
        "dish_key": class_name,
        "dish_name": entry.get("name", class_name),
        "cuisine": entry.get("cuisine"),
        "confidence": pred["confidence"],
        "allergens": entry.get("allergens"),
        "warning": None,
        "top3": pred["top3"],
    }
