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
  : describe("Go through NFT Marketplace life cycle (mint, list, update, buy and withdraw earnings", function () {
      let animalCultistNft: AnimalCultistNFT;
      let nftMarketplace: NFTMarketplace;
      let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;
      let deployer;
      let player;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;

      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        await deployments.fixture(["mocks", "cultistnft", "marketplace"]);

        nftMarketplace = await ethers.getContract("NFTMarketplace");
        nftMarketplace = await nftMarketplace.connect(player);
        animalCultistNft = await ethers.getContract("AnimalCultistNFT");
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
      });

      describe("Load test wallet with Cultist NFTs", function () {
        describe("constructor", function () {
          it("sets starting values correctly", async function () {
            const cultistTokenUriZero =
              await animalCultistNft.getAnimalCultistTokenUri(0);
            const isInitialized = await animalCultistNft.getInitialized();
            assert(cultistTokenUriZero.includes("ipfs://"));
            assert.equal(isInitialized, true);
          });
        });

        describe("requestNFT", function () {
          it("fails if payment isn't sent with the request", async function () {
            await expect(
              animalCultistNft.requestNFT()
            ).to.be.revertedWithCustomError(
              animalCultistNft,
              "AnimalCultistNFT__NeedMoreETHSent"
            );
          });

          it("emits and event and kicks off a random word request", async function () {
            const fee = await animalCultistNft.getMintFee();
            await expect(
              animalCultistNft.requestNFT({ value: fee.toString() })
            ).to.emit(animalCultistNft, "NftRequested");
          });
        });

        describe("mints from cultist contract and lists item for sale in NFT marketplace", function () {
          it("mints NFT after random number returned", async function () {
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

            console.log(
              "do i exist",
              (await animalCultistNft.getTokenCounter()).toString()
            );

            await expect(
              nftMarketplace.listItem(animalCultistNft.address, 0, 100)
            ).to.emit(nftMarketplace, "ItemListed");
          });
        });
      });
    });
