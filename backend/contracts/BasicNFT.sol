// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity 0.8.17;

// primitive type
// permissions
// variable type
contract BasicNFT is ERC721 {
    uint256 private s_tokenCounter;
    string public constant TOKEN_URI = "https://i.ibb.co/PCqn06g/tax-collector.gif";

    constructor() ERC721("Dino Knight", "DK") {
        s_tokenCounter = 0;
    }

    // @title mint - mint a new token
    // @dev mint a new token
    // @return tokenId
    function mint() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }

    // @title tokenURI - get the token URI
    // @dev get the token URI
    // @return tokenId
    function tokenURI(uint256)
        public
        pure
        override
        returns (
            string memory
        )
    {
        return TOKEN_URI;
    }

    // @title getTokenCounter - get the token counter
    // @dev get the token counter
    // @return tokenId
    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
