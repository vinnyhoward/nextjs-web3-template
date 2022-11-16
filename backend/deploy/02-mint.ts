// import { DeployFunction } from "hardhat-deploy/types";
// import { HardhatRuntimeEnvironment } from "hardhat/types";

// const mint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
//     const { getNamedAccounts, network, ethers } = hre;
//     const { deployer } = await getNamedAccounts();
//     // const chainId = network.config.chainId;

//     // Basic NFT
//     const basicNft = await ethers.getContract("BasicNft", deployer);
//     const basicMintTx = await basicNft.mint();
//     await basicMintTx.wait(1);
//     console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`);
// };
// export default mint;
// mint.tags = ["all", "mint"];
