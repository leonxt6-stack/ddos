import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
from pathlib import Path

class DDoSDetector:
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = Path(__file__).parent / 'models'
        self.model_path.mkdir(exist_ok=True)
        
    def train(self, normal_traffic_features):
        """Train the model on normal traffic patterns"""
        X = np.array(normal_traffic_features)
        X_scaled = self.scaler.fit_transform(X)
        self.isolation_forest.fit(X_scaled)
        self.is_trained = True
        
    def predict(self, traffic_features):
        """
        Predict if traffic is anomalous
        Returns: (is_ddos: bool, confidence: float, label: str)
        """
        if not self.is_trained:
            return False, 0.0, "Unknown"
            
        X = np.array([traffic_features])
        X_scaled = self.scaler.transform(X)
        
        prediction = self.isolation_forest.predict(X_scaled)[0]
        score = self.isolation_forest.score_samples(X_scaled)[0]
        
        confidence = abs(score)
        
        if prediction == -1:
            if confidence > 0.5:
                label = "Confirmed DDoS"
                is_ddos = True
            else:
                label = "Suspicious"
                is_ddos = True
        else:
            label = "Normal"
            is_ddos = False
            
        return is_ddos, float(confidence), label
    
    def save_model(self):
        """Save trained model"""
        if self.is_trained:
            joblib.dump(self.isolation_forest, self.model_path / 'isolation_forest.pkl')
            joblib.dump(self.scaler, self.model_path / 'scaler.pkl')
            
    def load_model(self):
        """Load trained model"""
        try:
            self.isolation_forest = joblib.load(self.model_path / 'isolation_forest.pkl')
            self.scaler = joblib.load(self.model_path / 'scaler.pkl')
            self.is_trained = True
            return True
        except:
            return False

def generate_training_data(n_samples=1000):
    """Generate synthetic normal traffic for training"""
    normal_traffic = []
    
    for _ in range(n_samples):
        features = [
            np.random.normal(50, 10),
            np.random.normal(0.3, 0.1),
            np.random.normal(0.4, 0.1),
            np.random.uniform(1, 10),
            np.random.normal(0.5, 0.1),
            np.random.normal(100, 20)
        ]
        normal_traffic.append(features)
    
    return normal_traffic
