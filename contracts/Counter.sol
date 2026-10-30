// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Counter {
    uint256 public count;
    event CountUpdated(uint256 newCount);
    function increment() external {
        count += 1;
        emit CountUpdated(count);
    }
    function decrement() external {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit CountUpdated(count);
    }
    function setCount(uint256 _count) external {
        count = _count;
        emit CountUpdated(count);
    }
}