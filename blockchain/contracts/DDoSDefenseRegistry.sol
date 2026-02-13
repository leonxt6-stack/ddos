// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DDoSDefenseRegistry {
    struct AttackRecord {
        bytes32 ipHash;
        string attackType;
        uint8 severity;
        uint256 timestamp;
        address reporter;
    }
    
    AttackRecord[] public attacks;
    mapping(bytes32 => bool) public knownThreats;
    mapping(bytes32 => uint256) public threatCount;
    
    event AttackLogged(
        uint256 indexed attackId,
        bytes32 indexed ipHash,
        string attackType,
        uint8 severity,
        uint256 timestamp,
        address indexed reporter
    );
    
    event DefenseActivated(
        uint256 indexed attackId,
        address indexed node,
        uint256 timestamp
    );
    
    function logAttack(
        bytes32 _ipHash,
        string memory _attackType,
        uint8 _severity,
        uint256 _timestamp
    ) public returns (uint256) {
        require(_severity >= 1 && _severity <= 10, "Severity must be 1-10");
        require(_timestamp > 0, "Invalid timestamp");
        
        uint256 attackId = attacks.length;
        
        AttackRecord memory newAttack = AttackRecord({
            ipHash: _ipHash,
            attackType: _attackType,
            severity: _severity,
            timestamp: _timestamp,
            reporter: msg.sender
        });
        
        attacks.push(newAttack);
        knownThreats[_ipHash] = true;
        threatCount[_ipHash] += 1;
        
        emit AttackLogged(
            attackId,
            _ipHash,
            _attackType,
            _severity,
            _timestamp,
            msg.sender
        );
        
        return attackId;
    }
    
    function activateDefense(uint256 _attackId) public {
        require(_attackId < attacks.length, "Invalid attack ID");
        
        emit DefenseActivated(_attackId, msg.sender, block.timestamp);
    }
    
    function getAttackCount() public view returns (uint256) {
        return attacks.length;
    }
    
    function getAttack(uint256 _attackId) public view returns (
        bytes32 ipHash,
        string memory attackType,
        uint8 severity,
        uint256 timestamp,
        address reporter
    ) {
        require(_attackId < attacks.length, "Invalid attack ID");
        AttackRecord memory attack = attacks[_attackId];
        return (
            attack.ipHash,
            attack.attackType,
            attack.severity,
            attack.timestamp,
            attack.reporter
        );
    }
    
    function isThreatKnown(bytes32 _ipHash) public view returns (bool) {
        return knownThreats[_ipHash];
    }
    
    function getThreatCount(bytes32 _ipHash) public view returns (uint256) {
        return threatCount[_ipHash];
    }
}
