// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol"; // <-- REQUIRED for .toString()

contract PokemonNFT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256; // <-- ENABLES tokenId.toString()

    IERC20 public immutable paymentToken;
    mapping(uint256 => uint256) public purchasePrice;

    constructor(address _paymentToken)
        ERC721("PokemonNFT", "PNFT")
        Ownable(msg.sender)
    {
        require(_paymentToken != address(0), "Invalid token");
        paymentToken = IERC20(_paymentToken);
    }

    /* ========== MINT WITH TOKEN ========== */
    function mintWithToken(
        address to,
        uint256 pokeId,
        string memory pokeName,
        uint256 tokenAmount
    ) external returns (uint256) {
        require(tokenAmount > 0, "Amount > 0");
        require(pokeId > 0, "Invalid pokeId");
        require(!_exists(pokeId), "Already minted");

        bool ok = paymentToken.transferFrom(msg.sender, address(this), tokenAmount);
        require(ok, "Transfer failed");

        _safeMint(to, pokeId);
        purchasePrice[pokeId] = tokenAmount;
        return pokeId;
    }

    /* ========== OWNER MINT (giveaways) ========== */
    function mint(
        address to,
        uint256 pokeId,
        string memory pokeName
    ) external onlyOwner returns (uint256) {
        require(pokeId > 0, "Invalid pokeId");
        require(!_exists(pokeId), "Already minted");
        _safeMint(to, pokeId);
        return pokeId;
    }

    /* ========== SELL (burn + 50% refund) ========== */
    function sell(uint256 pokeId) external {
        require(_exists(pokeId), "Does not exist");
        require(ownerOf(pokeId) == msg.sender, "Not owner");

        uint256 original = purchasePrice[pokeId];
        uint256 refund = original / 2;

        _burn(pokeId);
        delete purchasePrice[pokeId];

        if (refund > 0) {
            bool ok = paymentToken.transfer(msg.sender, refund);
            require(ok, "Refund failed");
        }
    }

    /* ========== METADATA (PokeAPI image) ========== */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Nonexistent token");
        return string(
            abi.encodePacked(
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/",
                tokenId.toString(), // Now works!
                ".png"
            )
        );
    }

    /* ========== INTERNAL HELPERS ========== */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /* ========== OVERRIDES (OZ 5.1.0+) ========== */

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        if (to == address(0)) {
            delete purchasePrice[tokenId];
        }
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}