// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

// Chainlink
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error AnimalCultistNFT__AlreadyInitialized();
error AnimalCultistNFT__NeedMoreETHSent(uint256 sent, uint256 required);
error AnimalCultistNFT__RangeOutOfBounds();
error AnimalCultistNFT__TransferFailed();

contract AnimalCultistNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // Types
    enum AnimalCultist {
        LAMB,
        HORSE,
        DEER
    }

    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;

    // Chainlink VRF Constants
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT variables
    uint256 private immutable i_mintFee;
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_animalCultistTokenUris;
    bool private s_initialized;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(AnimalCultist breed, address minter);

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint256 mintFee,
        uint32 callbackGasLimit,
        string[3] memory animalCultistTokenUris
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Animal Culstist", "AC") Ownable() {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_mintFee = mintFee;
        i_callbackGasLimit = callbackGasLimit;
        s_animalCultistTokenUris = animalCultistTokenUris;
        _initializeContract(animalCultistTokenUris);
    }

    // users have to pay to mint an NFT
    // the owner of the contract can withdraw the NFT
    function requestNFT() public payable returns (uint256 requestId) {
        // Assumes the subscription is funded sufficiently.
        // Will revert if subscription is not set and funded.
        if (msg.value < i_mintFee) {
            revert AnimalCultistNFT__NeedMoreETHSent({sent: msg.value, required: i_mintFee});
        }

        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address animalCultistOwner = s_requestIdToSender[requestId];
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;

        AnimalCultist animalCultist = getCultistFromModdedRng(moddedRng);
        _safeMint(animalCultistOwner, newTokenId);
        _setTokenURI(newTokenId, s_animalCultistTokenUris[uint256(animalCultist)]);
        emit NftMinted(animalCultist, animalCultistOwner);
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function _initializeContract(string[3] memory animalCultistTokenUris) private {
        if (s_initialized) {
            revert AnimalCultistNFT__AlreadyInitialized();
        }
        s_animalCultistTokenUris = animalCultistTokenUris;
        s_initialized = true;
    }

    function getCultistFromModdedRng(uint256 moddedRng) public pure returns (AnimalCultist) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            // Lamb = 0 - 9  (10%)
            // Horse = 10 - 39  (30%)
            // Deer = 40 = 99 (60%)s
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return AnimalCultist(i);
            }
            cumulativeSum = chanceArray[i];
        }
        revert AnimalCultistNFT__RangeOutOfBounds();
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert AnimalCultistNFT__TransferFailed();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getAnimalCultistTokenUri(uint256 index) public view returns (string memory) {
        return s_animalCultistTokenUris[index];
    }

    function getInitialized() public view returns (bool) {
        return s_initialized;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
