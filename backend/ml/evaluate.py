"""
evaluate.py
-----------
Re-evaluates a saved model artifact against a fresh train/test split of
the current dataset and prints metrics. Useful after swapping in a real
dataset to confirm accuracy/precision/recall/F1 before deploying.

Run from backend/:
    python ml/evaluate.py
"""
import os
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
)

from train import load_dataset, validate_columns, clean, encode, NUMERIC_FEATURES, CATEGORICAL_FEATURES

HERE = os.path.dirname(__file__)
DATA_PATH = os.path.join(HERE, "data", "interview_performance.csv")
MODEL_PATH = os.path.join(HERE, "models", "readiness_model.joblib")


def main():
    if not os.path.exists(MODEL_PATH):
        print(f"No trained model found at {MODEL_PATH}. Run `python ml/train.py` first.")
        return

    artifact = joblib.load(MODEL_PATH)
    model = artifact["model"]
    feature_cols = artifact["feature_cols"]
    label_encoder = artifact["encoders"]["readiness_label"]

    df = load_dataset(DATA_PATH)
    validate_columns(df)
    df = clean(df)
    df_encoded, _ = encode(df)

    X = df_encoded[feature_cols]
    y = df_encoded["readiness_label_encoded"]
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision_weighted": round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "recall_weighted": round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "f1_weighted": round(f1_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classes": list(label_encoder.classes_),
    }
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
