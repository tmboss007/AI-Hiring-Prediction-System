# AI-Based Hiring Prediction System

## Project Objective
This project is an end-to-end Machine Learning pipeline designed to simulate a real-world HR analytics and resume screening system. The goal is to predict whether a candidate will be **Hired (1)** or **Rejected (0)** based on their resume profile.

## Directory Structure
- `data/` : Contains the resume dataset used for training.
- `notebooks/` : Contains the Jupyter Notebook (`AI_Hiring_Prediction_System.ipynb`) which includes the full end-to-end workflow (Data Synthesis, EDA, Feature Engineering, Modeling, Evaluation).
- `src/` : Contains the main Python script (`ai_hiring_prediction_system.py`) to run the modeling pipeline from the terminal.
- `reports/` : Contains project reports and measured metrics.

## How to Run
1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Run the Python Script**
   ```bash
   python src/ai_hiring_prediction_system.py --data "data/AI-Based Hiring Prediction System (1) (1).csv"
   ```
3. **Explore the Notebook**
   Open `notebooks/AI_Hiring_Prediction_System.ipynb` in Jupyter or VS Code and run the cells to see exploratory data analysis and model evaluation.
