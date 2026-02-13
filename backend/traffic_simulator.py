import numpy as np
import random
from datetime import datetime
import hashlib

class TrafficSimulator:
    def __init__(self):
        self.attack_active = False
        self.attack_intensity = 0.0
        self.normal_ips = [f"192.168.{random.randint(1,255)}.{random.randint(1,255)}" for _ in range(100)]
        self.attack_ips = [f"10.0.{random.randint(1,255)}.{random.randint(1,255)}" for _ in range(50)]
        
    def generate_normal_traffic(self):
        """Generate normal cloud traffic features"""
        return {
            "packet_rate": np.random.normal(50, 10),
            "ip_entropy": np.random.normal(0.3, 0.1),
            "syn_ratio": np.random.normal(0.4, 0.1),
            "unique_ips": np.random.uniform(1, 10),
            "protocol_ratio": np.random.normal(0.5, 0.1),
            "avg_packet_size": np.random.normal(100, 20),
            "source_ip": random.choice(self.normal_ips),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_ddos_traffic(self):
        """Generate DDoS attack traffic features"""
        intensity = self.attack_intensity
        return {
            "packet_rate": np.random.normal(500 * intensity, 100),
            "ip_entropy": np.random.normal(0.05, 0.02),
            "syn_ratio": np.random.normal(0.9, 0.05),
            "unique_ips": np.random.uniform(1, 3),
            "protocol_ratio": np.random.normal(0.95, 0.03),
            "avg_packet_size": np.random.normal(50, 10),
            "source_ip": random.choice(self.attack_ips),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_traffic_sample(self):
        """Get a traffic sample based on attack state"""
        if self.attack_active and random.random() < 0.7:
            traffic = self.generate_ddos_traffic()
            traffic["type"] = "attack"
        else:
            traffic = self.generate_normal_traffic()
            traffic["type"] = "normal"
        
        return traffic
    
    def start_attack(self, intensity=0.5):
        """Start DDoS attack simulation"""
        self.attack_active = True
        self.attack_intensity = intensity
        
    def stop_attack(self):
        """Stop DDoS attack simulation"""
        self.attack_active = False
        self.attack_intensity = 0.0
        
    def escalate_attack(self):
        """Escalate attack intensity"""
        if self.attack_active:
            self.attack_intensity = min(1.0, self.attack_intensity + 0.2)
            
    @staticmethod
    def create_fingerprint(ip, attack_type, timestamp):
        """Create privacy-preserving attack fingerprint"""
        data = f"{ip}:{attack_type}:{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()
