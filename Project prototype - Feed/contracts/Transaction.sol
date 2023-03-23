// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
contract Transaction {
    address[16] public buyers;

    // buying a hat
    function buy(uint hatId) public returns (uint) {
    require(hatId >= 0 && hatId <= 15);

    buyers[hatId] = msg.sender;

    return hatId;
    }

    // Retrieving the buyers
    function getbuyers() public view returns (address[16] memory) {
    return buyers;
    }
}