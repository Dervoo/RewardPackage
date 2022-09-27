Security commands: <br />

Run Slither -> npm run slither <br />

Run Smartcheck -> npx smartcheck -p ./contracts <br />

Verifying on Etherscan:  <br />

-> Fill env/secret.json with private data <br />
-> Deploy contract: npx hardhat run --network <network_name> scripts/<file_name>.js <br />
-> Verify deployed contract: npx hardhat verify --network <network_name> <contract_address> <constructor_arguments> <br />

Mainnet Fork: <br />

-> Create script within scripts folder with functionalities <br />
-> Run node with fork mainnet: npx hardhat node --fork <mainnet_url> <br />
-> Run script: node scripts/<name_of_script>.js (in new terminal, DO NOT CLOSE node) <br />

Gas Reporter: <br />

-> Create tests for your contract functions that you are interested in <br />
-> Use setup for marketcap API key from hardhat.config.js and run npx hardhat test <br />
-> Get your report inside the repository called gas-report.txt <br />

Solidity Coverage: <br />

-> Create tests to cover their %% amount <br />
-> Run npm run coverage to get outputs and results <br />

Mythril:

-> pip3 install mythril <br />
-> myth analyze <solidity-file> (by default Mythril analyses for 24 hours, to make it faster add --execution-timeout <seconds>) <br />
-> if you are trying to use @openzepplin library you have to create file.json with the path, the example of that is remapping.json in home directory path and then you have to run command < myth analyze contracts/<contract_name>.sol --solc-json remapping.json --execution-timeout <seconds> > <br />
-> In the end it prints issues, if not then "No issues were detected." <br />