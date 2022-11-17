// packages
import { ethers } from "hardhat";

// utils
import {
    developmentChains,
    networkConfig,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../helper-hardhat-config";
import verify from "../utils/verify";

// types
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { storeImages, storeTokeUriMetadata } from "../utils/uploadToPinata";

const imagesLocation = "./images/animalCultist/";
const FUND_AMOUNT = "1000000000000000000000";
let tokenUris: string[] = [
    'ipfs://QmQnUkKtphgFVRFyoSvP6o6Q8Aivq1c9eLmETYq6XmNR1t',
    'ipfs://QmYT7DBxTCLdAajTb3jeLb2f5qZwwV89cCAQstDVNW2KN5',
    'ipfs://QmWAVXrpYmWPoCMmNujXvqjSy15Erb951XU4CyxHqAzDyh'
];

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
};

const deployAnimalCultistNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId!;

    // Get the IPFS hashes of images
    // 1. With our own IPFS node. https://docs.ipfs.io/
    // 2. Pinata. https://pinata.cloud/
    // 3. NFT storage https://nft.storage/

    if (Boolean(process.env.UPLOAD_TO_PINATA)) {
        tokenUris = await handleTokenUris();
    }

    await storeImages(imagesLocation);
    let vrfCoordinatorV2Address;
    let subscriptionId;
    let vrfCoordinatorV2Mock;

    if (chainId === 31337) {
        log("development chain running");
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        subscriptionId = transactionReceipt.events[0].args.subId;
        // Fund the subscription
        // Our mock makes it so we don't actually have to worry about sending fund
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS;

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane!,
        networkConfig[chainId].mintFee!,
        networkConfig[chainId].callbackGasLimit!,
        tokenUris,
    ];
    log(
        "--------------------------------------------------------------------------------------------------------"
    );

    log('args:', args);

    log("Deploying AnimalCultistNFT....");

    const animalCultistNFT = await deploy("AnimalCultistNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations || 1,
    });

    if (chainId === 31337 && vrfCoordinatorV2Mock) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, animalCultistNFT.address);
    }

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(animalCultistNFT.address, args);
    }
    log(
        "--------------------------------------------------------------------------------------------------------"
    );
};

async function handleTokenUris() {
    tokenUris = [];

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation);
    for (const imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate };
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeTokeUriMetadata(tokenUriMetadata);
        tokenUris.push(`ipfs://${metadataUploadResponse!.IpfsHash}`);
    }
    console.log("Token URIs uploaded:");
    console.log(tokenUris);
    return tokenUris;
}

export default deployAnimalCultistNFT;
deployAnimalCultistNFT.tags = ["all", "cultistnft", "main"];