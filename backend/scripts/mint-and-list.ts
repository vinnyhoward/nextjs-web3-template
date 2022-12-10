import { network, deployments, ethers } from "hardhat";
// const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
  let deployer: any;
  const nftMarketplace = await ethers.getContract("NFTMarketplace");
  const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  const animalCultistNft = await ethers.getContract(
    "AnimalCultistNFT",
    deployer
  );

  await new Promise<void>(async (resolve, reject) => {
    try {
      const fee = await animalCultistNft.getMintFee();
      const requestNftResponse = await animalCultistNft.requestNFT({
        value: fee.toString(),
      });
      const requestNftReceipt = await requestNftResponse.wait(1);
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestNftReceipt.events![1].args!.requestId,
        animalCultistNft.address
      );
    } catch (e) {
      console.log(e);
      reject(e);
    }

    animalCultistNft.once("NftMinted", async () => {
      try {
        const tokenUri = await animalCultistNft.tokenURI(0);
        const tokenCounter = await animalCultistNft.getTokenCounter();
        console.log('token minted:', tokenUri);
        console.log('token incremented:', tokenCounter);
        resolve();
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  });
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
