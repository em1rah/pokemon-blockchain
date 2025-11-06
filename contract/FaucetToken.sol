// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FaucetToken is ERC20, Ownable {
    constructor() ERC20("Faucet Token", "FREE") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function faucetMint(address to) public {
        require(balanceOf(to) < 10_000 * 10 ** decimals(), "Enough already");
        _mint(to, 1_000 * 10 ** decimals());
    }

    function ownerMint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}