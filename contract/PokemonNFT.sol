// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PokemonNFT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    IERC20 public immutable paymentToken;

    // ----- MARKETPLACE -----
    struct Listing {
        uint256 price;      // 0 = not for sale
        address seller;
    }
    mapping(uint256 => Listing) public listings;   // tokenId => Listing

    // ----- PURCHASE PRICE (for mint) -----
    mapping(uint256 => uint256) public purchasePrice;

    // ----- EVENTS -----
    event Listed(uint256 indexed tokenId, uint256 price, address seller);
    event ListingCancelled(uint256 indexed tokenId);
    event Bought(uint256 indexed tokenId, address buyer, uint256 price);

    constructor(address _paymentToken)
        ERC721("PokemonNFT", "PNFT")
        Ownable(msg.sender)
    {
        require(_paymentToken != address(0), "Invalid token");
        paymentToken = IERC20(_paymentToken);
    }

    /* ========== MINT WITH TOKEN (initial purchase) ========== */
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
    function mint(address to, uint256 pokeId, string memory pokeName)
        external
        onlyOwner
        returns (uint256)
    {
        require(pokeId > 0, "Invalid pokeId");
        require(!_exists(pokeId), "Already minted");
        _safeMint(to, pokeId);
        return pokeId;
    }

    /* ========== LIST FOR SALE ========== */
    function listForSale(uint256 tokenId, uint256 price) external {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price > 0");
        require(listings[tokenId].price == 0, "Already listed");

        listings[tokenId] = Listing({price: price, seller: msg.sender});
        emit Listed(tokenId, price, msg.sender);
    }

    /* ========== CANCEL LISTING ========== */
    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not seller");
        listings[tokenId] = Listing({price: 0, seller: address(0)});
        emit ListingCancelled(tokenId);
    }

    /* ========== BUY LISTED POKÉMON ========== */
    function buyListed(uint256 tokenId) external {
        Listing memory l = listings[tokenId];
        require(l.price > 0, "Not for sale");
        require(paymentToken.transferFrom(msg.sender, l.seller, l.price), "Pay failed");

        // transfer NFT
        _safeTransfer(l.seller, msg.sender, tokenId, "");

        // clear listing
        listings[tokenId] = Listing({price: 0, seller: address(0)});
        emit Bought(tokenId, msg.sender, l.price);
    }

    /* ========== OPTIONAL: burn-and-refund (old behaviour) ========== */
    function sellAndRefund(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Not owner");
        uint256 original = purchasePrice[tokenId];
        uint256 refund = original / 2;

        _burn(tokenId);
        delete purchasePrice[tokenId];
        delete listings[tokenId];

        if (refund > 0) {
            require(paymentToken.transfer(msg.sender, refund), "Refund failed");
        }
    }

    /* ========== METADATA (official artwork) ========== */
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
                tokenId.toString(),
                ".png"
            )
        );
    }

    /* ---------- INTERNAL HELPERS ---------- */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /* ---------- ERC721Enumerable overrides ---------- */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        if (to == address(0)) {
            delete purchasePrice[tokenId];
            delete listings[tokenId];
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