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

![fork mainnet](https://user-images.githubusercontent.com/30512638/192516317-724248d3-c8ee-48dd-b882-a95a45292c1b.png)

Gas Reporter: <br />

-> Create tests for your contract functions that you are interested in <br />
-> Use setup for marketcap API key from hardhat.config.js and run npx hardhat test <br />
-> Get your report inside the repository called gas-report.txt <br />

Solidity Coverage: <br />

-> Create tests to cover their %% amount <br />
-> Run npm run coverage to get outputs and results <br />

![coverage](https://user-images.githubusercontent.com/30512638/192516240-e8965717-7500-4915-97c5-57c8e28c0e88.png)

Mythril:

-> pip3 install mythril <br />
-> myth analyze <solidity-file> (by default Mythril analyses for 24 hours, to make it faster add --execution-timeout <seconds>) <br />
-> if you are trying to use @openzepplin library you have to create file.json with the path, the example of that is remapping.json in home directory path and then you have to run command < myth analyze contracts/<contract_name>.sol --solc-json remapping.json --execution-timeout <seconds> > <br />
-> In the end it prints issues, if not then "No issues were detected." <br />

Solidity Visual Developer: <br />

-> Install Solidity Visual Developer extension <br />
-> ctrl + shift + p -> type Surya and choose option <br />

![surya](https://user-images.githubusercontent.com/30512638/192532322-7516ae41-c823-4cf7-9d41-295eedc14747.png)

Can be used via Remix IDE -> Sourcify, MythX <br />

Solhint: (you can set parameters in solhint.json and control the contract's format and behaviour) <br />

-> npx solhint 'contracts/**/*.sol' -> checks all files <br />
-> npx solhint contracts/File_Name.sol -> checks specific file <br />
<<<<<<< HEAD

Manticore: (it takes a lot of time to produce the report) <br />

-> pip install manticore <br />
-> manticore . --contract <contract_name> <br />

``` 
https://github.com/trailofbits/manticore/issues/1382
https://github.com/trailofbits/manticore/issues/705
https://github.com/trailofbits/manticore/pull/712
```

Vertigo: (few minutes) <br />

-> pip3 install --user eth-vertigo <br />
-> vertigo run --hardhat-parallel <number_of_networks_to_check> <br />
!!! IMPORTANT !!! -> before running vertigo comment nearly all of the requires in hardhat config instead of hardhat waffle and hardhat ethers !!! <br />

Octopus: <br />

-> pip3 install octopus <br />
-> WIP <br />

Example raports you can find in example_raports file <br />
=======
>>>>>>> 4f9bd6167e4cf20da917cfa2d09aa7385b5266e1
