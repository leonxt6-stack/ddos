const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

const web3 = new Web3('http://127.0.0.1:8545');

async function main() {
  console.log('Deploying DDoSDefenseRegistry...');
  
  const artifactPath = path.join(__dirname, '../../artifacts/blockchain/contracts/DDoSDefenseRegistry.sol/DDoSDefenseRegistry.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  const accounts = await web3.eth.getAccounts();
  const deployer = accounts[0];
  
  console.log('Deploying from account:', deployer);
  
  const contract = new web3.eth.Contract(artifact.abi);
  
  const deployTx = contract.deploy({
    data: artifact.bytecode,
  });
  
  const gas = await deployTx.estimateGas({ from: deployer });
  
  const deployed = await deployTx.send({
    from: deployer,
    gas: gas.toString(),
  });
  
  console.log('DDoSDefenseRegistry deployed to:', deployed.options.address);
  
  const contractInfo = {
    address: deployed.options.address,
    abi: artifact.abi,
    network: 'localhost',
    chainId: 31337,
  };
  
  const outputPath = path.join(__dirname, '../../contract-info.json');
  fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));
  
  console.log('Contract info saved to:', outputPath);
  console.log('\n--- Contract Details ---');
  console.log('Address:', deployed.options.address);
  console.log('Network: Hardhat Local');
  console.log('Chain ID: 31337');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
