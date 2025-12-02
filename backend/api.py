# backend/api.py
from pathlib import Path
import io
import json
from typing import Dict, Any

import torch
import torch.nn as nn
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# ----------------- PATHS -----------------
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "food101_resnet50.pth"
IDX_TO_CLASS_PATH = BASE_DIR / "data" / "idx_to_class.json"
DISH_ALLERGENS_PATH = BASE_DIR / "data" / "dish_allergens.json"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ----------------- LOAD LABEL MAPS -----------------
with IDX_TO_CLASS_PATH.open("r") as f:
  IDX_TO_CLASS: Dict[str, str] = json.load(f)

with DISH_ALLERGENS_PATH.open("r") as f:
  DISH_ALLERGENS: Dict[str, Dict[str, Any]] = json.load(f)


# ----------------- BUILD & LOAD MODEL -----------------
def build_model(num_classes: int) -> nn.Module:
  # Must match training: MobileNetV2 backbone
  model = models.mobilenet_v2(
      weights=models.MobileNet_V2_Weights.IMAGENET1K_V2
  )
  in_feats = model.classifier[-1].in_features
  model.classifier[-1] = nn.Linear(in_feats, num_classes)
  return model


NUM_CLASSES = len(IDX_TO_CLASS)  # 101 for Food-101

model = build_model(NUM_CLASSES)
state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(state_dict)
model.to(DEVICE)
model.eval()

# same transform as validation
IMG_TRANSFORM = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


# ----------------- FASTAPI APP -----------------
app = FastAPI(title="Allergy Scanner API")

# Allow calls from your Next.js dev server
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
  if file.content_type is None or not file.content_type.startswith("image/"):
    raise HTTPException(status_code=400, detail="File must be an image")

  contents = await file.read()

  try:
    image = Image.open(io.BytesIO(contents)).convert("RGB")
  except Exception:
    raise HTTPException(status_code=400, detail="Could not read image file")

  tensor = IMG_TRANSFORM(image).unsqueeze(0).to(DEVICE)

  with torch.no_grad():
    outputs = model(tensor)
    probs = torch.softmax(outputs, dim=1)
    conf, pred_idx = torch.max(probs, dim=1)

  idx = str(pred_idx.item())
  dish_name = IDX_TO_CLASS.get(idx, "unknown")

  allergen_info = DISH_ALLERGENS.get(dish_name, {})
  allergens = []
  for allergen_name, risk in allergen_info.items():
    if risk and risk != "none":
      allergens.append({
          "name": allergen_name,
          "risk": risk,
      })

  return {
      "dish_name": dish_name,
      "confidence": float(conf.item()),
      "allergens": allergens,
  }
