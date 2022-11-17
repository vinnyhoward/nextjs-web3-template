import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const mint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, ethers, network } = hre;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Animal Cultist NFT
  const animalCultistNFT = await ethers.getContract("AnimalCultistNFT", deployer);
  console.log("address:", animalCultistNFT.address);
  const fee = await animalCultistNFT.getMintFee();
  console.log("mint fee:", fee.toString());
  const animalCultistNFTMintTx = await animalCultistNFT.requestNFT({
    value: fee.toString(),
  });
  const animalCultistNFTMintTxReceipt = await animalCultistNFTMintTx.wait(1);

  // Need to listen for response
  await new Promise<void>(async (resolve, reject) => {
    setTimeout(resolve, 300000); // 5 minute timeout time
    // setup listener for our event
    animalCultistNFT.once("NftMinted", async () => {
      resolve();
    });

    console.log("chain id:", chainId);
    if (chainId == 31337) {
      const requestId =
      animalCultistNFTMintTxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        animalCultistNFT.address
      );
    }
  });
  console.log(
    `Animal Cultist NFT index 0 tokenURI: ${await animalCultistNFT.tokenURI(0)}`
  );
};
export default mint;
mint.tags = ["all", "mint"];
