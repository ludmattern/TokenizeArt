// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title MATTERN42NFT
 * @dev ERC721 NFT with on-chain metadata and image storage (NFT Inscriptions)
 * @dev Includes minting, URI management, and fully on-chain storage
 * @author lmattern (MATTERN42 Team)
 */
contract MATTERN42NFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    uint256 public constant MAX_SUPPLY = 4242;
    string private _baseTokenURI;

    struct OnChainMetadata {
        string name;
        string description;
        string imageData;
        string attributes;
        bool isOnChain;
    }

    mapping(uint256 => string) private _tokenArtists;
    mapping(uint256 => OnChainMetadata) private _onChainMetadata;
    mapping(uint256 => string) private _externalTokenURIs;

    string private _defaultImageData;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        string artist
    );
    event DefaultImageDataUpdated(string newImageData);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
        _defaultImageData = "data:image/svg+xml;base64,";
    }

    /**
     * @dev Mint a new NFT with on-chain metadata and image
     * @param to Address to mint the NFT to
     * @param name Name of the NFT
     * @param description Description of the NFT
     * @param artist Name of the artist (should be login for 42 project)
     * @param imageData Base64 encoded image data (optional, uses default if empty)
     * @param attributes JSON encoded attributes (optional)
     */
    function mintOnChain(
        address to,
        string memory name,
        string memory description,
        string memory artist,
        string memory imageData,
        string memory attributes
    ) external onlyOwner {
        uint256 tokenId = _nextTokenId;
        require(tokenId <= MAX_SUPPLY, "Maximum supply exceeded");

        _safeMint(to, tokenId);

        string memory finalImageData = bytes(imageData).length > 0
            ? imageData
            : _defaultImageData;

        _onChainMetadata[tokenId] = OnChainMetadata({
            name: name,
            description: description,
            imageData: finalImageData,
            attributes: attributes,
            isOnChain: true
        });

        _tokenArtists[tokenId] = artist;
        _nextTokenId++;

        string memory onChainURI = _generateOnChainURI(tokenId);
        emit NFTMinted(to, tokenId, onChainURI, artist);
    }

    /**
     * @dev Mint a new NFT to the specified address (traditional way with external URI)
     * @param to Address to mint the NFT to
     * @param metadataURI URI pointing to the NFT metadata
     * @param artist Name of the artist (should be login for 42 project)
     */
    function mint(
        address to,
        string memory metadataURI,
        string memory artist
    ) external onlyOwner {
        uint256 tokenId = _nextTokenId;
        require(tokenId <= MAX_SUPPLY, "Maximum supply exceeded");

        _safeMint(to, tokenId);

        _externalTokenURIs[tokenId] = metadataURI;
        _tokenArtists[tokenId] = artist;

        _onChainMetadata[tokenId].isOnChain = false;

        _nextTokenId++;

        emit NFTMinted(to, tokenId, metadataURI, artist);
    }

    /**
     * @dev Set the default image data for new tokens
     * @param imageData Base64 encoded image data
     */
    function setDefaultImageData(string memory imageData) external onlyOwner {
        _defaultImageData = imageData;
        emit DefaultImageDataUpdated(imageData);
    }

    /**
     * @dev Get the total number of tokens minted
     * @return The total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Get the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        // Check if this token has an external URI stored in our custom mapping
        if (bytes(_externalTokenURIs[tokenId]).length > 0) {
            return _externalTokenURIs[tokenId];
        }

        // If token uses on-chain storage, generate URI dynamically
        if (_onChainMetadata[tokenId].isOnChain) {
            return _generateOnChainURI(tokenId);
        }

        // Otherwise, use traditional URI storage (fallback, shouldn't happen)
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Generate on-chain URI for a token with data: scheme
     * @param tokenId The token ID
     * @return The generated URI with embedded JSON metadata
     */
    function _generateOnChainURI(
        uint256 tokenId
    ) internal view returns (string memory) {
        OnChainMetadata memory metadata = _onChainMetadata[tokenId];

        // Build JSON metadata
        string memory json = string(
            abi.encodePacked(
                '{"name":"',
                metadata.name,
                '","description":"',
                metadata.description,
                '","image":"',
                metadata.imageData,
                '","artist":"',
                _tokenArtists[tokenId],
                '","tokenId":',
                Strings.toString(tokenId)
            )
        );

        // Add attributes if present
        if (bytes(metadata.attributes).length > 0) {
            json = string(
                abi.encodePacked(json, ',"attributes":', metadata.attributes)
            );
        }

        json = string(abi.encodePacked(json, "}"));

        // Encode JSON as base64 and return data URI
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
