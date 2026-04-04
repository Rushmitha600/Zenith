import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression

# Fraud Detection Model
print("Creating Fraud Detection Model...")
X_fraud = np.random.rand(1000, 12)
y_fraud = np.random.randint(0, 2, 1000)

fraud_model = RandomForestClassifier(n_estimators=50, random_state=42)
fraud_model.fit(X_fraud, y_fraud)

with open("fraud_detection_model.pkl", "wb") as f:
    pickle.dump({
        "model": fraud_model,
        "version": "1.0",
        "features": 12
    }, f)

print("✓ Fraud detection model created")

# Premium Prediction Model
print("Creating Premium Prediction Model...")
X_premium = np.random.rand(1000, 8)
y_premium = 199 + np.random.rand(1000) * 300

premium_model = LinearRegression()
premium_model.fit(X_premium, y_premium)

with open("premium_prediction_model.pkl", "wb") as f:
    pickle.dump({
        "model": premium_model,
        "version": "1.0",
        "features": 8,
        "base_premium": 199
    }, f)

print("✓ Premium prediction model created")
print("✅ Models created successfully!")