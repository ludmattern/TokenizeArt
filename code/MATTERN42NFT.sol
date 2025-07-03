// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title MATTERN42NFT
 * @dev ERC721 NFT with on-chain metadata and image storage (NFT Inscriptions)
 * @dev Includes minting, pausing, URI management, and fully on-chain storage
 * @author lmattern (MATTERN42 Team)
 */
contract MATTERN42NFT is ERC721, ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Maximum supply of NFTs
    uint256 public constant MAX_SUPPLY = 4242; // 42*100 + 42

    // Base URI for metadata (fallback)
    string private _baseTokenURI;

    // On-chain storage structures
    struct OnChainMetadata {
        string name;
        string description;
        string imageData; // Base64 encoded image data
        string attributes; // JSON encoded attributes
        bool isOnChain; // Flag to indicate if metadata is stored on-chain
    }

    // Mapping from token ID to artist name
    mapping(uint256 => string) private _tokenArtists;

    // Mapping from token ID to on-chain metadata
    mapping(uint256 => OnChainMetadata) private _onChainMetadata;

    // Default image data (base64 encoded BADGER42.svg)
    string private _defaultImageData;

    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string tokenURI,
        string artist
    );
    event BaseURIUpdated(string newBaseURI);
    event TokenURIUpdated(uint256 indexed tokenId, string newTokenURI);
    event OnChainMetadataUpdated(
        uint256 indexed tokenId,
        string name,
        string description
    );
    event DefaultImageDataUpdated(string newImageData);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        // Start token IDs at 1
        _tokenIdCounter.increment();

        // Set default BADGER42 image data (will be updated with actual data)
        _defaultImageData = "data:image/svg+xml;base64,"; // Placeholder
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
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= MAX_SUPPLY, "Maximum supply exceeded");

        _safeMint(to, tokenId);

        // Use default image if none provided
        string memory finalImageData = bytes(imageData).length > 0
            ? imageData
            : _defaultImageData;

        // Store on-chain metadata
        _onChainMetadata[tokenId] = OnChainMetadata({
            name: name,
            description: description,
            imageData: finalImageData,
            attributes: attributes,
            isOnChain: true
        });

        _tokenArtists[tokenId] = artist;
        _tokenIdCounter.increment();

        // Generate on-chain URI
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
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= MAX_SUPPLY, "Maximum supply exceeded");

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _tokenArtists[tokenId] = artist;

        // Mark as external URI (not on-chain)
        _onChainMetadata[tokenId].isOnChain = false;

        _tokenIdCounter.increment();

        emit NFTMinted(to, tokenId, metadataURI, artist);
    }

    /**
     * @dev Batch mint multiple NFTs with on-chain metadata
     * @param to Address to mint the NFTs to
     * @param names Array of NFT names
     * @param descriptions Array of NFT descriptions
     * @param artist Name of the artist
     * @param imageData Base64 encoded image data (same for all, optional)
     * @param attributes Array of JSON encoded attributes
     */
    function batchMintOnChain(
        address to,
        string[] memory names,
        string[] memory descriptions,
        string memory artist,
        string memory imageData,
        string[] memory attributes
    ) external onlyOwner {
        require(names.length > 0, "No names provided");
        require(
            names.length == descriptions.length,
            "Names and descriptions length mismatch"
        );
        require(
            attributes.length == 0 || attributes.length == names.length,
            "Invalid attributes length"
        );
        require(
            _tokenIdCounter.current() + names.length - 1 <= MAX_SUPPLY,
            "Would exceed maximum supply"
        );

        string memory finalImageData = bytes(imageData).length > 0
            ? imageData
            : _defaultImageData;

        for (uint256 i = 0; i < names.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();

            _safeMint(to, tokenId);

            string memory tokenAttributes = attributes.length > 0
                ? attributes[i]
                : "";

            _onChainMetadata[tokenId] = OnChainMetadata({
                name: names[i],
                description: descriptions[i],
                imageData: finalImageData,
                attributes: tokenAttributes,
                isOnChain: true
            });

            _tokenArtists[tokenId] = artist;
            _tokenIdCounter.increment();

            string memory onChainURI = _generateOnChainURI(tokenId);
            emit NFTMinted(to, tokenId, onChainURI, artist);
        }
    }

    /**
     * @dev Batch mint multiple NFTs (traditional way with external URIs)
     * @param to Address to mint the NFTs to
     * @param metadataURIs Array of URIs pointing to the NFT metadata
     * @param artist Name of the artist
     */
    function batchMint(
        address to,
        string[] memory metadataURIs,
        string memory artist
    ) external onlyOwner {
        require(metadataURIs.length > 0, "No URIs provided");
        require(
            _tokenIdCounter.current() + metadataURIs.length - 1 <= MAX_SUPPLY,
            "Would exceed maximum supply"
        );

        for (uint256 i = 0; i < metadataURIs.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();

            _safeMint(to, tokenId);
            _setTokenURI(tokenId, metadataURIs[i]);
            _tokenArtists[tokenId] = artist;

            // Mark as external URI (not on-chain)
            _onChainMetadata[tokenId].isOnChain = false;

            _tokenIdCounter.increment();

            emit NFTMinted(to, tokenId, metadataURIs[i], artist);
        }
    }

    /**
     * @dev Get the artist name for a token
     * @param tokenId The token ID
     * @return The artist name
     */
    function getArtist(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenArtists[tokenId];
    }

    /**
     * @dev Get on-chain metadata for a token
     * @param tokenId The token ID
     * @return metadata The on-chain metadata struct
     */
    function getOnChainMetadata(
        uint256 tokenId
    ) external view returns (OnChainMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return _onChainMetadata[tokenId];
    }

    /**
     * @dev Check if a token uses on-chain storage
     * @param tokenId The token ID
     * @return True if the token uses on-chain storage
     */
    function isOnChainToken(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _onChainMetadata[tokenId].isOnChain;
    }

    /**
     * @dev Update on-chain metadata for a token
     * @param tokenId Token ID to update
     * @param name New name
     * @param description New description
     * @param imageData New image data (base64 encoded)
     * @param attributes New attributes (JSON encoded)
     */
    function updateOnChainMetadata(
        uint256 tokenId,
        string memory name,
        string memory description,
        string memory imageData,
        string memory attributes
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(
            _onChainMetadata[tokenId].isOnChain,
            "Token does not use on-chain storage"
        );

        _onChainMetadata[tokenId].name = name;
        _onChainMetadata[tokenId].description = description;
        _onChainMetadata[tokenId].imageData = bytes(imageData).length > 0
            ? imageData
            : _onChainMetadata[tokenId].imageData;
        _onChainMetadata[tokenId].attributes = attributes;

        emit OnChainMetadataUpdated(tokenId, name, description);
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
     * @dev Get the default image data
     * @return The default image data
     */
    function getDefaultImageData() external view returns (string memory) {
        return _defaultImageData;
    }

    /**
     * @dev Get the current token ID counter
     * @return The next token ID to be minted
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get the total number of tokens minted
     * @return The total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    /**
     * @dev Set the base URI for token metadata
     * @param baseTokenURI New base URI
     */
    function setBaseURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
        emit BaseURIUpdated(baseTokenURI);
    }

    /**
     * @dev Update the URI for a specific token
     * @param tokenId Token ID to update
     * @param newMetadataURI New URI for the token
     */
    function setTokenURI(
        uint256 tokenId,
        string memory newMetadataURI
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newMetadataURI);
        emit TokenURIUpdated(tokenId, newMetadataURI);
    }

    /**
     * @dev Pause all token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get the base URI for token metadata
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete _tokenArtists[tokenId];
        delete _onChainMetadata[tokenId];
    }

    /**
     * @dev Override required by Solidity for ERC721URIStorage
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        // If token uses on-chain storage, generate URI dynamically
        if (_onChainMetadata[tokenId].isOnChain) {
            return _generateOnChainURI(tokenId);
        }

        // Otherwise, use traditional URI storage
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
                    _base64Encode(bytes(json))
                )
            );
    }

    /**
     * @dev Simple base64 encoding function
     * @param data The bytes to encode
     * @return The base64 encoded string
     */
    function _base64Encode(
        bytes memory data
    ) internal pure returns (string memory) {
        if (data.length == 0) return "";

        string
            memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);

        assembly {
            let tablePtr := add(table, 1)
            let dataPtr := add(data, 0x20)
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 0x20)

            for {

            } lt(dataPtr, endPtr) {

            } {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)

                mstore8(
                    resultPtr,
                    mload(add(tablePtr, and(shr(18, input), 0x3F)))
                )
                resultPtr := add(resultPtr, 1)
                mstore8(
                    resultPtr,
                    mload(add(tablePtr, and(shr(12, input), 0x3F)))
                )
                resultPtr := add(resultPtr, 1)
                mstore8(
                    resultPtr,
                    mload(add(tablePtr, and(shr(6, input), 0x3F)))
                )
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return result;
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
