const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('DDoSDefenseRegistryModule', (m) => {
  const ddosDefenseRegistry = m.contract('DDoSDefenseRegistry');
  
  return { ddosDefenseRegistry };
});
