// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract PokemonBadge is ERC1155 {
    uint256 public constant VICTORY = 1;

    constructor() ERC1155("https://my-ipfs-gateway/badge/{id}.json") {}

    function mint(address to, uint256 id, uint256 amount, bytes memory data) external {
        _mint(to, id, amount, data);
    }
}