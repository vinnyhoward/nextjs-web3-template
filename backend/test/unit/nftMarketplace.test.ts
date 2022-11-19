import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import {
  AnimalCultistNFT,
  NFTMarketplace,
  VRFCoordinatorV2Mock,
} from "../../typechain-types";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFT Marketplace Unit Tests", function () {
      let animalCultistNft: AnimalCultistNFT;
      let nftMarketplace: NFTMarketplace;
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
      let deployer: any;
      let player: any;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        await deployments.fixture(["mocks", "cultistnft", "marketplace"]);

        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        nftMarketplace = await ethers.getContract("NFTMarketplace");
        nftMarketplace = nftMarketplace.connect(deployer);
        animalCultistNft = await ethers.getContract("AnimalCultistNFT");
        animalCultistNft = animalCultistNft.connect(player);
        animalCultistNft.approve(nftMarketplace.address, TOKEN_ID);

        const fee = await animalCultistNft.getMintFee();
        await expect(
          animalCultistNft.requestNFT({ value: fee.toString() })
        ).to.emit(animalCultistNft, "NftRequested");

        await new Promise<void>(async (resolve, reject) => {
          animalCultistNft.once("NftMinted", async () => {
            try {
              const tokenUri = await animalCultistNft.tokenURI(0);
              const tokenCounter = await animalCultistNft.getTokenCounter();
              assert.equal(tokenUri.toString().includes("ipfs://"), true);
              assert.equal(tokenCounter.toString(), "1");
              resolve();
            } catch (e) {
              console.log(e);
              reject(e);
            }
          });

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
        });
      });

      describe("List Item", function () {
        it("lists NFT and can be bought from another user", async function () {
          await nftMarketplace.listItem(
            animalCultistNft.address,
            TOKEN_ID,
            PRICE
          );
          const playerConnectedNftMarketplace = nftMarketplace.connect(player);
          await playerConnectedNftMarketplace.buyItem(
            animalCultistNft.address,
            TOKEN_ID
          );
          const newOwner = await animalCultistNft.ownerOf(TOKEN_ID);
          const deployerEarnings = await nftMarketplace.getEarnings(deployer);
          
          assert(newOwner.toString() === player.address);
          assert(deployerEarnings.toString() === PRICE.toString());
        });
      });
    });
