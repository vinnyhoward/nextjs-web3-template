// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

pragma solidity 0.8.17;

error NFTMarketplace__PriceMustBeAboveZero();
error NFTMarketplace__NotApprovedForMarketplace();
error NFTMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__NotOwner(address nftAddress, uint256 tokenId);

//"listItem" - lists the NFTs on the marketplace
// "buyItem" - buys the NFTs on the marketplace
// "cancelSale" - cancels the sale of the NFTs on the marketplace
// "updateListing" - updates the listing of the NFTs on the marketplace
// "withdraw" - withdraws the funds from the marketplace to the owner's wallet
contract NFTMarketplace {
    struct Listing {
        uint256 price;
        address seller;
    }
    event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price);
    mapping(address => mapping(uint256 => Listing)) public s_listings;

    modifier notListed(address nftAddress, uint256 tokenId, address owner) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NFTMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(address nftAddress, uint256 tokenId, address spender) {
        IERC721 nft = IERC721(nftAddress);
        if (nft.ownerOf(tokenId) != spender) {
            revert NFTMarketplace__NotOwner(nftAddress, tokenId);
        }
        _;
    }

    /*
    * @dev - lists the NFTs on the marketplace
    * @param - nftAddress - address of the NFT contract
    * @param - tokenId - id of the NFT
    * @param - price - price of the NFT
    */
    function listItem(address nftAddress, uint256 tokenId, uint256 price)
     external 
    // Adding "notListed" and "isOwner" modifiers to the "listItem" function
     notListed(nftAddress, tokenId, msg.sender) 
     isOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NFTMarketplace__PriceMustBeAboveZero();
        }
        // Two ways to transfer NFT from user to martketplace
        // 1. Send the NFT to the contract. Transfer -> Contract "hold" the NFT
        // 2. Ownercs can still hold their NFt and give the marketplace approval 
        // to sell the NFT for them
        // Grab the owner address from the tokenId. Match it with the address of the user
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarketplace__NotApprovedForMarketplace();
        }
        // Using the NFT Address as key to find the right tokenID 
        // associated with it which will have the "price" and "seller"
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        // Make sure to emit events when updating a mapping
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId) external payable {
        Listing memory listing = s_listings[nftAddress][tokenId];
        require(listing.price > 0, "NFTMarketplace: NFT is not listed");
        require(msg.value == listing.price, "NFTMarketplace: Incorrect price");
        // Transfer the funds to the seller
        payable(listing.seller).transfer(msg.value);
        // Transfer the NFT to the buyer
        IERC721 nft = IERC721(nftAddress);
        nft.transferFrom(listing.seller, msg.sender, tokenId);
        // Remove the listing
        delete s_listings[nftAddress][tokenId];
    }
}
