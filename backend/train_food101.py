# backend/train_food101.py
import os
import json
import random
from pathlib import Path
from typing import Tuple, Optional

import kagglehub
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms

# ----------------- CONFIG -----------------
BATCH_SIZE = 32
NUM_EPOCHS = 1             # one quick pass
LEARNING_RATE = 1e-3
VAL_SPLIT = 0.1
RANDOM_SEED = 42
MAX_TRAIN_BATCHES = 50     # ⬅️ smaller so it finishes quickly

BASE_DIR = Path(__file__).resolve().parent
MODEL_SAVE_PATH = BASE_DIR / "model" / "food101_resnet50.pth"
IDX_TO_CLASS_PATH = BASE_DIR / "data" / "idx_to_class.json"

torch.manual_seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", DEVICE)


def build_model(num_classes: int) -> nn.Module:
    """Use MobileNetV2 instead of ResNet50 for fast CPU training."""
    model = models.mobilenet_v2(
        weights=models.MobileNet_V2_Weights.IMAGENET1K_V2
    )
    in_feats = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_feats, num_classes)
    return model


def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: optim.Optimizer,
    criterion: nn.Module,
    max_batches: Optional[int] = None
) -> float:
    model.train()
    total_loss = 0.0
    seen = 0

    for batch_idx, (imgs, labels) in enumerate(loader):
        imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
        optimizer.zero_grad()
        out = model(imgs)
        loss = criterion(out, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
        seen += 1

        # ⬅️ more frequent progress
        if (batch_idx + 1) % 10 == 0:
            print(f"  [batch {batch_idx+1}/{len(loader)}] loss={loss.item():.4f}")

        if max_batches is not None and seen >= max_batches:
            print(f"  Reached max_batches={max_batches}, stopping early.")
            break

    return total_loss / seen if seen > 0 else 0.0


def main():
    # ---------- Download dataset ----------
    print("Downloading Food-101 via kagglehub...")
    kaggle_path = kagglehub.dataset_download("dansbecker/food-101")
    print("Kaggle dataset path:", kaggle_path)

    # Find "images" folder
    data_root = None
    for root, dirs, files in os.walk(kaggle_path):
        if "__MACOSX" in root:
            continue
        if os.path.basename(root) == "images":
            data_root = root
            break

    if data_root is None:
        raise RuntimeError("Could not find images folder")

    print("Using image root:", data_root)

    def is_valid_image(path: str) -> bool:
        base = os.path.basename(path)
        if base.startswith("._") or base.startswith("."):
            return False
        return True

    train_tf = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(0.2, 0.2, 0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    val_tf = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    full_dataset = datasets.ImageFolder(
        data_root,
        transform=train_tf,
        is_valid_file=is_valid_image
    )
    classes = full_dataset.classes
    num_classes = len(classes)
    print(f"Found {num_classes} classes")

    # ---------- Split ----------
    total = len(full_dataset)
    val_size = int(VAL_SPLIT * total)
    train_size = total - val_size
    print(f"Total images: {total} | train: {train_size} | val: {val_size}")

    train_set, val_set = random_split(
        full_dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(RANDOM_SEED),
    )

    val_set.dataset = datasets.ImageFolder(
        data_root,
        transform=val_tf,
        is_valid_file=is_valid_image
    )

    train_loader = DataLoader(
        train_set, batch_size=BATCH_SIZE, shuffle=True, num_workers=0
    )
    val_loader = DataLoader(
        val_set, batch_size=BATCH_SIZE, num_workers=0
    )

    print("DataLoaders built. Starting training...")

    # ---------- Build model ----------
    model = build_model(num_classes).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
    IDX_TO_CLASS_PATH.parent.mkdir(parents=True, exist_ok=True)

    # ---------- Quick Training ----------
    for epoch in range(1, 2):  # do 1 quick epoch
        print(f"Starting quick training (epoch {epoch})...")
        train_loss = train_epoch(
            model, train_loader, optimizer, criterion,
            max_batches=MAX_TRAIN_BATCHES
        )
        print(f"Finished quick training | train_loss={train_loss:.4f}")

        print(f"Saving model to {MODEL_SAVE_PATH} ...")
        torch.save(model.state_dict(), MODEL_SAVE_PATH)

    # ---------- Save label map ----------
    idx_to_class = {i: c for i, c in enumerate(classes)}
    with IDX_TO_CLASS_PATH.open("w") as f:
        json.dump(idx_to_class, f, indent=2)

    print("Done.")
    print("Model saved to:", MODEL_SAVE_PATH)
    print("Class map saved to:", IDX_TO_CLASS_PATH)


if __name__ == "__main__":
    main()
