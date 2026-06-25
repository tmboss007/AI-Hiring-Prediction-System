# AI-Based Hiring Prediction System

## Project Objective
Build an end-to-end machine learning system that predicts whether a candidate is **Hired (1)** or **Rejected (0)** using resume-related information.

## Dataset Summary
- Rows: 1,000
- Key columns: Resume_ID, Name, Skills, Experience (Years), Education, Certifications, Job Role, Recruiter Decision, Salary Expectation ($), Projects Count, AI Score (0-100)
- Target distribution:
  - Hire: 812
  - Reject: 188
- Missing values:
  - Certifications: 274 missing
  - All other columns: complete

## Feature Engineering
- Dropped identifier columns: `Resume_ID`, `Name`
- Converted `Recruiter Decision` into binary target:
  - Hire = 1
  - Reject = 0
- Split `Skills` into individual skill tokens and encoded them as multi-hot features
- One-hot encoded categorical columns:
  - Education
  - Certifications
  - Job Role
- Scaled numeric features:
  - Experience (Years)
  - Salary Expectation ($)
  - Projects Count

## Modeling Choice
The final model uses:
- **Logistic Regression**
- Solver: `saga`
- `class_weight='balanced'`

The default model excludes **AI Score (0-100)** because it behaves like a derived screening score and may leak the hiring outcome.  
As a leakage check, including AI Score produced perfect test performance, which is a strong sign that it should not be used for a fair resume-screening model.

## Evaluation Results
### Final model (without AI Score)
Holdout split metrics:
- Accuracy: **0.960**
- Precision: **0.996**
- Recall: **0.959**
- F1-score: **0.977**
- ROC-AUC: **0.997**

5-fold cross-validation:
- Accuracy: **0.964 ± 0.012**
- Precision: **0.996 ± 0.005**
- Recall: **0.959 ± 0.011**
- F1-score: **0.977 ± 0.008**
- ROC-AUC: **0.997 ± 0.002**

### Leakage check (with AI Score included)
- Test Accuracy: **1.000**
- Test F1-score: **1.000**
- Test ROC-AUC: **1.000**

## Key Insights
- Experience and project count were among the strongest positive signals.
- Technical skills such as Python, Machine Learning, TensorFlow, Pytorch, and Ethical Hacking contributed positively.
- Certain job roles and certificate patterns also influenced predictions.
- The dataset is highly separable, which explains the strong model performance.

## How to Run
```bash
python ai_hiring_prediction_system.py --data your_dataset.csv
```

To include AI Score:
```bash
python ai_hiring_prediction_system.py --data your_dataset.csv --include-ai-score
```

The script saves:
- `hiring_prediction_model.joblib`
- `metrics.json`

inside the `artifacts/` folder.

## Conclusion
This project demonstrates a complete AI hiring prediction pipeline: data loading, preprocessing, feature engineering, model training, evaluation, and deployment-ready model saving.
