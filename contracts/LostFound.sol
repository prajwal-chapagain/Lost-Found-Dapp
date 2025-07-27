// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LostFound {
    struct LostItem {
        uint256 id;
        string description;
        string imageHash;
        bytes32 secretHash;
        address owner;
        bool isFound;
    }

    uint256 public itemCount = 0;
    mapping(uint256 => LostItem) public items;

    event ItemReported(uint256 id, address indexed owner);
    event ItemClaimed(uint256 id, address indexed claimer);

    function reportLostItem(
        string memory _description,
        string memory _imageHash,
        bytes32 _secretHash
    ) public {
        items[itemCount] = LostItem(
            itemCount,
            _description,
            _imageHash,
            _secretHash,
            msg.sender,
            false
        );
        emit ItemReported(itemCount, msg.sender);
        itemCount++;
    }

    function claimItem(uint256 _id, string memory _secretPhrase) public view returns (bool) {
        require(_id < itemCount, "Item not found");
        LostItem memory item = items[_id];
        return (keccak256(abi.encodePacked(_secretPhrase)) == item.secretHash);
    }

    function markAsFound(uint256 _id, string memory _secretPhrase) public {
        require(_id < itemCount, "Item not found");
        LostItem storage item = items[_id];
        require(keccak256(abi.encodePacked(_secretPhrase)) == item.secretHash, "Invalid secret");
        item.isFound = true;
        emit ItemClaimed(_id, msg.sender);
    }

    function getItem(uint256 _id) public view returns (string memory, string memory, bool) {
        LostItem memory item = items[_id];
        return (item.description, item.imageHash, item.isFound);
    }
}
