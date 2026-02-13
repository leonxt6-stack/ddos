from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import asyncio
import json
import hashlib

from ml_model import DDoSDetector, generate_training_data
from traffic_simulator import TrafficSimulator
from blockchain_client import BlockchainClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Blockchain DDoS Protection System")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

ml_detector = DDoSDetector()
traffic_sim = TrafficSimulator()
blockchain_client = BlockchainClient()

active_websockets: List[WebSocket] = []
cloud_nodes = {}
attack_stats = {
    "total_detected": 0,
    "total_blocked": 0,
    "active_attacks": 0
}

class AttackRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ip_hash: str
    attack_type: str
    severity: int
    confidence: float
    timestamp: datetime
    blockchain_tx: Optional[str] = None
    
class NodeStatus(BaseModel):
    node_id: str
    status: str
    blocked_threats: int
    last_update: datetime

class TrafficStats(BaseModel):
    packet_rate: float
    attack_probability: float
    status: str

@api_router.get("/")
async def root():
    return {"message": "Blockchain DDoS Protection System Online"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "ml_model_trained": ml_detector.is_trained,
        "blockchain_connected": blockchain_client.is_connected(),
        "active_connections": len(active_websockets),
        "cloud_nodes": len(cloud_nodes)
    }

@api_router.post("/init")
async def initialize_system():
    """Initialize ML model and blockchain connection"""
    try:
        if not ml_detector.is_trained:
            training_data = generate_training_data(1000)
            ml_detector.train(training_data)
            ml_detector.save_model()
            logger.info("ML model trained successfully")
        
        contract_info_path = ROOT_DIR.parent / 'contract-info.json'
        if contract_info_path.exists():
            with open(contract_info_path, 'r') as f:
                contract_info = json.load(f)
                blockchain_client.load_contract(
                    contract_info['address'],
                    str(contract_info_path)
                )
                logger.info(f"Blockchain contract loaded at {contract_info['address']}")
        
        return {
            "status": "initialized",
            "ml_trained": ml_detector.is_trained,
            "blockchain_connected": blockchain_client.is_connected()
        }
    except Exception as e:
        logger.error(f"Initialization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/attack/start")
async def start_attack_simulation(intensity: float = 0.5):
    """Start DDoS attack simulation"""
    traffic_sim.start_attack(intensity)
    attack_stats["active_attacks"] = 1
    return {"status": "attack_started", "intensity": intensity}

@api_router.post("/attack/stop")
async def stop_attack_simulation():
    """Stop DDoS attack simulation"""
    traffic_sim.stop_attack()
    attack_stats["active_attacks"] = 0
    return {"status": "attack_stopped"}

@api_router.post("/attack/escalate")
async def escalate_attack():
    """Escalate attack intensity"""
    traffic_sim.escalate_attack()
    return {"status": "attack_escalated", "intensity": traffic_sim.attack_intensity}

@api_router.get("/attacks/recent")
async def get_recent_attacks():
    """Get recent attacks from MongoDB"""
    attacks = await db.attacks.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
    for attack in attacks:
        if isinstance(attack.get('timestamp'), str):
            attack['timestamp'] = datetime.fromisoformat(attack['timestamp'])
    return attacks

@api_router.get("/blockchain/attacks")
async def get_blockchain_attacks():
    """Get attacks from blockchain"""
    if not blockchain_client.is_connected():
        return {"attacks": [], "count": 0}
    
    attacks = blockchain_client.get_recent_attacks(20)
    return {"attacks": attacks, "count": len(attacks)}

@api_router.get("/nodes/status")
async def get_nodes_status():
    """Get status of all cloud nodes"""
    return {
        "nodes": list(cloud_nodes.values()),
        "total_nodes": len(cloud_nodes)
    }

@api_router.get("/stats")
async def get_stats():
    """Get system statistics"""
    blockchain_attack_count = blockchain_client.get_attack_count() if blockchain_client.is_connected() else 0
    
    return {
        "total_detected": attack_stats["total_detected"],
        "total_blocked": attack_stats["total_blocked"],
        "active_attacks": attack_stats["active_attacks"],
        "blockchain_attacks": blockchain_attack_count,
        "active_nodes": len(cloud_nodes)
    }

@api_router.websocket("/traffic/stream")
async def traffic_stream_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time traffic streaming"""
    await websocket.accept()
    active_websockets.append(websocket)
    
    try:
        while True:
            traffic_data = traffic_sim.get_traffic_sample()
            
            features = [
                traffic_data["packet_rate"],
                traffic_data["ip_entropy"],
                traffic_data["syn_ratio"],
                traffic_data["unique_ips"],
                traffic_data["protocol_ratio"],
                traffic_data["avg_packet_size"]
            ]
            
            is_ddos, confidence, label = ml_detector.predict(features)
            
            result = {
                "traffic": traffic_data,
                "detection": {
                    "is_ddos": is_ddos,
                    "confidence": confidence,
                    "label": label
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if is_ddos and label == "Confirmed DDoS":
                attack_stats["total_detected"] += 1
                
                ip_hash = TrafficSimulator.create_fingerprint(
                    traffic_data["source_ip"],
                    "DDoS",
                    traffic_data["timestamp"]
                )
                
                severity = min(10, int(confidence * 10) + 5)
                timestamp_unix = int(datetime.utcnow().timestamp())
                
                tx_hash = None
                if blockchain_client.is_connected():
                    tx_hash = blockchain_client.log_attack(
                        ip_hash,
                        "DDoS",
                        severity,
                        timestamp_unix
                    )
                
                attack_record = {
                    "id": str(uuid.uuid4()),
                    "ip_hash": ip_hash,
                    "attack_type": "DDoS",
                    "severity": severity,
                    "confidence": confidence,
                    "timestamp": datetime.utcnow().isoformat(),
                    "blockchain_tx": tx_hash
                }
                
                await db.attacks.insert_one(attack_record)
                
                result["attack_logged"] = {
                    "tx_hash": tx_hash,
                    "severity": severity,
                    "ip_hash": ip_hash
                }
                
                for node_id, node in cloud_nodes.items():
                    node["blocked_threats"] += 1
                    node["last_update"] = datetime.utcnow()
                
                attack_stats["total_blocked"] += len(cloud_nodes)
            
            await websocket.send_json(result)
            await asyncio.sleep(0.5)
            
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in active_websockets:
            active_websockets.remove(websocket)

@api_router.post("/nodes/register")
async def register_node(node_id: str):
    """Register a new cloud node"""
    cloud_nodes[node_id] = {
        "node_id": node_id,
        "status": "active",
        "blocked_threats": 0,
        "last_update": datetime.utcnow().isoformat()
    }
    return {"status": "registered", "node_id": node_id}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup"""
    logger.info("Starting Blockchain DDoS Protection System")
    
    if not ml_detector.load_model():
        logger.info("Training ML model...")
        training_data = generate_training_data(1000)
        ml_detector.train(training_data)
        ml_detector.save_model()
    
    for i in range(5):
        node_id = f"node-{i+1}"
        cloud_nodes[node_id] = {
            "node_id": node_id,
            "status": "active",
            "blocked_threats": 0,
            "last_update": datetime.utcnow().isoformat()
        }
    
    logger.info(f"System initialized with {len(cloud_nodes)} cloud nodes")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
