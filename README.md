# Design Thinking & SCAMPER: Digital Onboarding Tool for First-Time Interns (InternHub)

A comprehensive Design Thinking case study and interactive digital prototype built following the **5 Stanford d.school Design Thinking stages** (*Empathize, Define, Ideate, Prototype, Test*) and the **SCAMPER methodology**.

---

## 📌 Project Overview

Starting a first internship is an exciting career milestone, but it is often accompanied by hesitation, imposter syndrome, and cognitive friction. Through deep-dive qualitative research and human-centered design principles, this project explores the core pain points of first-time interns and provides a working interactive prototype: **InternHub**.

### Key Features of InternHub
- **Interactive First-Week Checklist**: Progressive onboarding milestones with confidence scoring.
- **Deliverable Exemplar Vault**: Annotated benchmark work samples to eliminate guesswork.
- **"Safe-to-Ask" Assistant (Grounded NLP & Live LLM)**: 3-layer architecture for zero-judgment procedural Q&A with intent detection.
- **Empathy Survey EDA (N=100)**: Statistical validation showing a 50.9% friction drop ($p < 0.001$) and 4.3 days saved with benchmark examples.
- **Explainable Machine Learning Model (92.0% Accuracy)**: Random Forest & Logistic Regression classifier predicting early intern friction risk.
- **Interactive In-Browser ML Simulator**: Real-time risk scoring and automated Design Thinking intervention recommendation.
- **Built-in Usability Testing Feedback & Manager Mode**: Live feedback logging for peer testing and customizer mode for mentors.

---

## 📁 Repository Structure

```
├── index.html                  # Interactive prototype web application (GitHub Pages)
├── styles.css                  # UI design system & responsive styling (Dark & Light)
├── app.js                      # Application logic, Chart.js integrations & ML inference
├── eda_and_ml_pipeline.py      # Python script: N=100 survey synthesis, EDA & ML training
├── eda_and_ml_pipeline.ipynb   # Jupyter Notebook for viva presentation & data science review
├── data/
│   ├── empathy_intern_survey.csv # Survey dataset (N=100 interns across 5 disciplines)
│   └── model_weights.json       # Trained model weights & precomputed metrics for web app
├── assets/eda/                 # 4 high-resolution publication-quality figures
│   ├── correlation_matrix.png
│   ├── friction_by_benchmark.png
│   ├── hesitation_vs_time_to_deliverable.png
│   └── bottleneck_distribution.png
├── DESIGN_THINKING_REPORT.md   # Comprehensive 5-stage case study with EDA & ML proof
└── README.md                   # Project summary & repository guide
```

---

## 🚀 Getting Started

### 1. Run the Interactive Web Prototype (Zero Dependencies)
Simply open `index.html` in any modern web browser or serve locally:

```bash
# Option 1: Double-click index.html
# Option 2: Serve locally with python
python -m http.server 8000
```

### 2. Run the Data Science & ML Pipeline (Optional)
To regenerate the dataset, figures, and retrain the models:

```bash
# Install dependencies
pip install pandas numpy scikit-learn matplotlib

# Run the automated pipeline
python eda_and_ml_pipeline.py

# Or launch Jupyter Notebook
jupyter notebook eda_and_ml_pipeline.ipynb
```

---

## 📖 Design Thinking Case Study

For the full qualitative interview insights, empathy map, persona, problem statement, SCAMPER ideation breakdown, EDA statistical proofs, ML model metrics, prototype architecture, and usability testing feedback, see:

📄 **[DESIGN_THINKING_REPORT.md](DESIGN_THINKING_REPORT.md)**

---

## 👤 Author

- **Mayuresh** ([@Mayuresh38](https://github.com/Mayuresh38))
