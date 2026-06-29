# AI-Based Hiring Prediction System

> 🤖 An end-to-end Machine Learning pipeline for intelligent resume screening — **96% Accuracy · 99.7% ROC-AUC**

🌐 **[Live Website →](https://tmboss007.github.io/AI-Hiring-Prediction-System/)**

---

## Project Objective
Predict whether a candidate will be **Hired (1)** or **Rejected (0)** based on their resume profile using a production-ready sklearn Pipeline with custom feature engineering.

## Key Results
| Metric | Holdout | CV Mean |
|--------|---------|---------|
| Accuracy | 96.0% | 96.4% ± 1.24% |
| Precision | 99.6% | 99.6% ± 0.51% |
| Recall | 95.9% | 95.9% ± 1.14% |
| F1 Score | 97.7% | 97.7% ± 0.79% |
| ROC-AUC | 99.7% | 99.7% ± 0.22% |

## Directory Structure
```
├── data/           # Resume dataset (1,000 candidates)
├── notebooks/      # Jupyter Notebook with full EDA & modeling
├── src/            # Python script for terminal execution
├── reports/        # Project report & measured metrics JSON
└── docs/           # GitHub Pages website
```

## How to Run
1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Run the Pipeline**
   ```bash
   python src/ai_hiring_prediction_system.py --data "data/AI-Based Hiring Prediction System (1) (1).csv"
   ```
3. **With Leakage Check** (includes AI Score)
   ```bash
   python src/ai_hiring_prediction_system.py --data "data/AI-Based Hiring Prediction System (1) (1).csv" --include-ai-score
   ```
4. **Explore Notebook**
   Open `notebooks/AI_Hiring_Prediction_System.ipynb` in Jupyter or VS Code.

## Model Details
- **Algorithm**: Logistic Regression (`saga` solver, `class_weight='balanced'`)
- **Feature Engineering**: Custom `SkillMultiHotEncoder` for comma-separated skills
- **Preprocessing**: OneHotEncoding (categoricals), StandardScaler (numerics), Median/Mode imputation
- **Leakage Check**: AI Score deliberately excluded — including it produces perfect 100% scores (data leakage)

## Tech Stack
Python · scikit-learn · pandas · NumPy · SciPy · joblib · Jupyter
