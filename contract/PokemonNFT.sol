// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PokemonNFT is ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) public price; // 0 = not for sale

    constructor() ERC721("PokemonNFT", "PKMN") {}

    function mint(address to, uint256 pokeId, string memory pokeName) external returns (uint256) {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _mint(to, newId);
        string memory uri = string(abi.encodePacked(
            "https://my-ipfs-gateway/pokemon/", uint2str(pokeId), ".json"
        ));
        _setTokenURI(newId, uri);
        return newId;
    }

    function setForSale(uint256 tokenId, uint256 salePrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        price[tokenId] = salePrice;
    }

    function buy(uint256 tokenId) external payable {
        uint256 p = price[tokenId];
        require(p > 0, "Not for sale");
        require(msg.value >= p, "Insufficient ETH");
        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(p);
        if (msg.value > p) payable(msg.sender).transfer(msg.value - p);
        price[tokenId] = 0;
    }

    function priceOf(uint256 tokenId) external view returns (uint256) {
        return price[tokenId];
    }

    // helper
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint j = _i; uint len;
        while (j != 0) { len++; j /= 10; }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) { bstr[--k] = bytes1(uint8(48 + _i % 10)); _i /= 10; }
        return string(bstr);
    }

    // ERC721URIStorage overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}