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
      let user: any;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        const accounts = await ethers.getSigners(); // could also do with getNamedAccounts
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["mocks", "cultistnft", "marketplace"]);
        // Initiate NFT Marketplace
        nftMarketplace = await ethers.getContract("NFTMarketplace");
        nftMarketplace = nftMarketplace.connect(deployer);

        // Initiate Animal Cultist NFT
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        animalCultistNft = await ethers.getContract(
          "AnimalCultistNFT",
          deployer
        );
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

        animalCultistNft.approve(nftMarketplace.address, TOKEN_ID);
      });

      describe("List Item", function () {
        it("User buys NFT that was just listed", async function () {
          expect(
            await nftMarketplace.listItem(
              animalCultistNft.address,
              TOKEN_ID,
              PRICE
            )
          ).to.to.emit(nftMarketplace, "ItemListed");

          const playerConnectedNftMarketplace = nftMarketplace.connect(user);
          await playerConnectedNftMarketplace.buyItem(
            animalCultistNft.address,
            TOKEN_ID,
            { value: PRICE }
          );
          const newOwner = await animalCultistNft.ownerOf(TOKEN_ID);
          const deployerEarnings = await nftMarketplace.getEarnings(
            deployer.address
          );

          assert(newOwner.toString() === user.address);
          assert(deployerEarnings.toString() === PRICE.toString());
        });
      });
    });
