"""
train.py
--------
Trains the Interview Readiness Estimate model (Random Forest classifier).

Pipeline: load dataset -> validate columns -> clean -> encode categoricals
-> train/test split -> train -> evaluate -> save model artifact.

Run from backend/:
    python ml/train.py

Dataset location: ml/data/interview_performance.csv (SYNTHETIC/DEMO by
default - see generate_demo_dataset.py and docs/ML.md).

Output: ml/models/readiness_model.joblib
"""
import os
import sys
import json
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix,
)

HERE = os.path.dirname(__file__)
DATA_PATH = os.path.join(HERE, "data", "interview_performance.csv")
MODEL_PATH = os.path.join(HERE, "models", "readiness_model.joblib")

REQUIRED_COLUMNS = [
    "technical_score", "communication_score", "problem_solving_score",
    "confidence_score", "answer_quality", "questions_answered", "overall_score",
    "difficulty", "experience_level", "interview_type", "readiness_label",
]

NUMERIC_FEATURES = [
    "technical_score", "communication_score", "problem_solving_score",
    "confidence_score", "answer_quality", "questions_answered", "overall_score",
]
CATEGORICAL_FEATURES = ["difficulty", "experience_level", "interview_type"]


def load_dataset(path: str) -> pd.DataFrame:
    if not os.path.exists(path):
        print(f"Dataset not found at {path}. Run `python ml/generate_demo_dataset.py` first.")
        sys.exit(1)
    df = pd.read_csv(path, comment="#")
    return df


def validate_columns(df: pd.DataFrame):
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required column(s): {missing}")


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=REQUIRED_COLUMNS).copy()
    for col in NUMERIC_FEATURES:
        df[col] = df[col].clip(lower=0, upper=100 if col != "questions_answered" else df[col].max())
    return df


def encode(df: pd.DataFrame):
    encoders = {}
    df_encoded = df.copy()
    for col in CATEGORICAL_FEATURES:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col])
        encoders[col] = le
    label_encoder = LabelEncoder()
    df_encoded["readiness_label_encoded"] = label_encoder.fit_transform(df_encoded["readiness_label"])
    encoders["readiness_label"] = label_encoder
    return df_encoded, encoders


def main():
    print("Loading dataset...")
    df = load_dataset(DATA_PATH)
    validate_columns(df)
    df = clean(df)
    print(f"Loaded {len(df)} rows after cleaning.")

    df_encoded, encoders = encode(df)
    feature_cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    X = df_encoded[feature_cols]
    y = df_encoded["readiness_label_encoded"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=200, max_depth=8, random_state=42, class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision_weighted": round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "recall_weighted": round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "f1_weighted": round(f1_score(y_test, y_pred, average="weighted", zero_division=0), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classes": list(encoders["readiness_label"].classes_),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "dataset_note": "Trained on SYNTHETIC/DEMO data (ml/data/interview_performance.csv).",
    }

    print(json.dumps(metrics, indent=2))

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump({
        "model": model,
        "encoders": encoders,
        "feature_cols": feature_cols,
        "metrics": metrics,
    }, MODEL_PATH)
    print(f"Saved trained model to {MODEL_PATH}")


if __name__ == "__main__":
    main()
