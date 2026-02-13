from web3 import Web3
import json
import os
from pathlib import Path
import asyncio
from typing import Optional, Dict, List

class BlockchainClient:
    def __init__(self, rpc_url="http://127.0.0.1:8545"):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.contract = None
        self.contract_address = None
        self.account = None
        self.contract_abi = None
        
    def is_connected(self):
        """Check if connected to blockchain"""
        return self.w3.is_connected()
    
    def load_contract(self, contract_address: str, abi_path: str):
        """Load deployed contract"""
        self.contract_address = Web3.to_checksum_address(contract_address)
        
        with open(abi_path, 'r') as f:
            contract_data = json.load(f)
            self.contract_abi = contract_data['abi']
        
        self.contract = self.w3.eth.contract(
            address=self.contract_address,
            abi=self.contract_abi
        )
        
        if len(self.w3.eth.accounts) > 0:
            self.account = self.w3.eth.accounts[0]
        
        return True
    
    def log_attack(self, ip_hash: str, attack_type: str, severity: int, timestamp: int) -> Optional[str]:
        """Log attack to blockchain"""
        if not self.contract or not self.account:
            return None
        
        try:
            ip_hash_bytes = bytes.fromhex(ip_hash) if isinstance(ip_hash, str) else ip_hash
            
            tx_hash = self.contract.functions.logAttack(
                ip_hash_bytes,
                attack_type,
                severity,
                timestamp
            ).transact({'from': self.account})
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return receipt.transactionHash.hex()
        except Exception as e:
            print(f"Error logging attack: {e}")
            return None
    
    def get_attack_count(self) -> int:
        """Get total attack count from blockchain"""
        if not self.contract:
            return 0
        return self.contract.functions.getAttackCount().call()
    
    def get_attack(self, attack_id: int) -> Optional[Dict]:
        """Get attack details from blockchain"""
        if not self.contract:
            return None
        
        try:
            result = self.contract.functions.getAttack(attack_id).call()
            return {
                "ip_hash": result[0].hex(),
                "attack_type": result[1],
                "severity": result[2],
                "timestamp": result[3],
                "reporter": result[4]
            }
        except:
            return None
    
    def is_threat_known(self, ip_hash: str) -> bool:
        """Check if threat is known in blockchain"""
        if not self.contract:
            return False
        
        ip_hash_bytes = bytes.fromhex(ip_hash) if isinstance(ip_hash, str) else ip_hash
        return self.contract.functions.isThreatKnown(ip_hash_bytes).call()
    
    async def listen_for_attacks(self, callback):
        """Listen for AttackLogged events"""
        if not self.contract:
            return
        
        event_filter = self.contract.events.AttackLogged.create_filter(fromBlock='latest')
        
        while True:
            try:
                for event in event_filter.get_new_entries():
                    await callback(event)
                await asyncio.sleep(2)
            except Exception as e:
                print(f"Error listening for events: {e}")
                await asyncio.sleep(5)
    
    def get_recent_attacks(self, count: int = 10) -> List[Dict]:
        """Get recent attacks from blockchain"""
        total = self.get_attack_count()
        attacks = []
        
        start = max(0, total - count)
        for i in range(start, total):
            attack = self.get_attack(i)
            if attack:
                attacks.append(attack)
        
        return attacks
