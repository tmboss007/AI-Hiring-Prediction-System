#!/usr/bin/env python3
"""
AI-Based Hiring Prediction System
End-to-end machine learning project for resume screening.

Usage:
    python ai_hiring_prediction_system.py --data path/to/resumes.csv
    python ai_hiring_prediction_system.py --data path/to/resumes.csv --include-ai-score
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from scipy import sparse
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


class SkillMultiHotEncoder(BaseEstimator, TransformerMixin):
    """Convert comma-separated skill strings into a binary multi-hot matrix."""

    def __init__(self, delimiter: str = ","):
        self.delimiter = delimiter

    def fit(self, X, y=None):
        series = pd.Series(X.squeeze() if hasattr(X, "squeeze") else X)
        tokens = []
        for value in series.fillna(""):
            tokens.extend([token.strip() for token in str(value).split(self.delimiter) if token.strip()])

        self.classes_ = sorted(set(tokens))
        self.class_to_idx_ = {label: idx for idx, label in enumerate(self.classes_)}
        return self

    def transform(self, X):
        series = pd.Series(X.squeeze() if hasattr(X, "squeeze") else X)
        matrix = np.zeros((len(series), len(self.classes_)), dtype=int)

        for row_idx, value in enumerate(series.fillna("")):
            for token in [token.strip() for token in str(value).split(self.delimiter) if token.strip()]:
                col_idx = self.class_to_idx_.get(token)
                if col_idx is not None:
                    matrix[row_idx, col_idx] = 1
        return matrix

    def get_feature_names_out(self, input_features=None):
        return np.array([f"skill_{label}" for label in self.classes_], dtype=object)


def build_pipeline(include_ai_score: bool = False) -> tuple[Pipeline, list[str], list[str], list[str]]:
    """Create the preprocessing + model pipeline."""
    cat_cols = ["Education", "Certifications", "Job Role"]
    num_cols = ["Experience (Years)", "Salary Expectation ($)", "Projects Count"]
    if include_ai_score:
        num_cols.append("AI Score (0-100)")

    preprocessor = ColumnTransformer(
        transformers=[
            ("skills", SkillMultiHotEncoder(), "Skills"),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                cat_cols,
            ),
            (
                "num",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                num_cols,
            ),
        ],
        remainder="drop",
        sparse_threshold=0.3,
    )

    model = LogisticRegression(
        max_iter=5000,
        solver="saga",
        class_weight="balanced",
        random_state=42,
    )

    pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
    return pipeline, cat_cols, num_cols, ["Skills"]


def load_data(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    expected = {
        "Resume_ID",
        "Name",
        "Skills",
        "Experience (Years)",
        "Education",
        "Certifications",
        "Job Role",
        "Recruiter Decision",
        "Salary Expectation ($)",
        "Projects Count",
        "AI Score (0-100)",
    }
    missing = expected - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in dataset: {sorted(missing)}")
    return df


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True, help="Path to the CSV dataset")
    parser.add_argument("--include-ai-score", action="store_true", help="Include AI Score in the model")
    parser.add_argument("--output-dir", type=Path, default=Path("artifacts"), help="Where to save model files")
    args = parser.parse_args()

    df = load_data(args.data)

    # Target mapping
    y = df["Recruiter Decision"].map({"Reject": 0, "Hire": 1}).astype(int)

    # Drop identifiers and the target column
    drop_cols = ["Resume_ID", "Name", "Recruiter Decision"]
    X = df.drop(columns=drop_cols)

    if not args.include_ai_score:
        # Exclude AI Score in the default model to avoid any possible label leakage.
        X = X.drop(columns=["AI Score (0-100)"])

    pipeline, _, _, _ = build_pipeline(include_ai_score=args.include_ai_score)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred)),
        "recall": float(recall_score(y_test, y_pred)),
        "f1": float(f1_score(y_test, y_pred)),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
        "include_ai_score": bool(args.include_ai_score),
    }

    # Cross-validation for a more stable estimate
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_validate(
        pipeline,
        X,
        y,
        cv=cv,
        scoring=["accuracy", "precision", "recall", "f1", "roc_auc"],
        return_train_score=False,
    )
    metrics["cross_validation"] = {
        metric: {
            "mean": float(np.mean(values)),
            "std": float(np.std(values)),
        }
        for metric, values in cv_scores.items()
        if metric.startswith("test_")
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    model_path = args.output_dir / "hiring_prediction_model.joblib"
    metrics_path = args.output_dir / "metrics.json"

    joblib.dump(pipeline, model_path)
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print("\n=== Holdout Evaluation ===")
    print(f"Accuracy : {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall   : {metrics['recall']:.4f}")
    print(f"F1 Score : {metrics['f1']:.4f}")
    print(f"ROC-AUC  : {metrics['roc_auc']:.4f}")
    print("\nConfusion Matrix:")
    print(np.array(metrics["confusion_matrix"]))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print(f"\nSaved model to: {model_path}")
    print(f"Saved metrics to: {metrics_path}")

    # Example prediction
    sample = pd.DataFrame(
        [
            {
                "Skills": "Python, Machine Learning, SQL, TensorFlow",
                "Experience (Years)": 4,
                "Education": "B.Tech",
                "Certifications": "Google ML",
                "Job Role": "Data Scientist",
                "Salary Expectation ($)": 72000,
                "Projects Count": 5,
                **({"AI Score (0-100)": 88} if args.include_ai_score else {}),
            }
        ]
    )
    sample_proba = pipeline.predict_proba(sample)[:, 1][0]
    sample_pred = int(sample_proba >= 0.5)
    print("\nSample candidate prediction:")
    print(f"Predicted class: {'Hired' if sample_pred == 1 else 'Rejected'}")
    print(f"Predicted hire probability: {sample_proba:.4f}")


if __name__ == "__main__":
    main()
