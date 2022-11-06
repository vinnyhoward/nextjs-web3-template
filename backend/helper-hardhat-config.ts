export interface networkConfigItem {
    name?: string;
    subscriptionId?: string;
    keepersUpdateInterval?: string;
    raffleEntranceFee?: string;
    callbackGasLimit?: string;
    vrfCoordinatorV2?: string;
    gasLane?: string;
    ethUsdPriceFeed?: string;
    mintFee?: string;
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    31337: {
        name: "localhost",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        callbackGasLimit: "50000000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
        subscriptionId: "2729", // add your ID here!
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    // Default one is ETH/USD contract on Kovan
    5: {
        name: "goerli",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // TODO: Needs gas lane for network
        callbackGasLimit: "50000000", // 500,000 gas
        mintFee: "10000000000000000", // 0.01 ETH
        subscriptionId: "2729", // add your ID here!
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
};

export const DECIMALS = "18";
export const INITIAL_PRICE = "200000000000000000000";
export const developmentChains = ["hardhat", "localhost"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
