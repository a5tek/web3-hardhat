// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OverlyAttachedToken {
    string public name = "OverlyAttachedToken";
    string public symbol = "CLING";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    uint256 private nonce;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event ClingyIncident(address indexed sender, string drama, uint256 boomerangAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the original parent can mint more of me!");
        _;
    }

    constructor() {
        owner = msg.sender;
        _mint(msg.sender, 200 * (10 ** uint256(decimals)));
    }

    function _mint(address _to, uint256 _amount) internal {
        require(_to != address(0), "Don't send me into the void!");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        _mint(_to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) external returns (bool) {
        require(_spender != address(0), "Who is this stranger?");
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transfer(address, uint256) external pure returns (bool) {
        revert("Wait! You can't just leave without saying goodbye! Use transferWithApology()");
    }

    function transferWithApology(
        address _to, 
        uint256 _amount, 
        string calldata _goodbyeNote
    ) external returns (bool) {
        return _clingyTransfer(msg.sender, _to, _amount, _goodbyeNote);
    }

    function transferFrom(
        address _from, 
        address _to, 
        uint256 _amount, 
        string calldata _goodbyeNote
    ) external returns (bool) {
        require(allowance[_from][msg.sender] >= _amount, "They didn't give you permission to take me away!");
        allowance[_from][msg.sender] -= _amount;
        return _clingyTransfer(_from, _to, _amount, _goodbyeNote);
    }

    function _clingyTransfer(
        address _from, 
        address _to, 
        uint256 _amount, 
        string calldata _goodbyeNote
    ) internal returns (bool) {
        require(_to != address(0), "Are you trying to burn me?! Rude.");
        require(balanceOf[_from] >= _amount, "You don't even have that much of me!");
        
        //Cannot send more than 50% of current balance
        require(_amount <= balanceOf[_from] / 2, "Separation Anxiety: You can't give away more than half of me at once! Do you hate me?!");

        // Minimum Effort Apology Note
        require(bytes(_goodbyeNote).length >= 15, "That goodbye note is way too short! Tell me why you're leaving in at least 15 characters.");

        // 25% chance 90% of the tokens refuse to leave
        nonce++;
        uint256 randomRoll = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, _from, nonce))) % 4;

        if (randomRoll == 0) {
            uint256 actualSent = _amount / 10; // Only 10% actually goes through
            uint256 boomeranged = _amount - actualSent;

            balanceOf[_from] -= actualSent;
            balanceOf[_to] += actualSent;

            emit Transfer(_from, _to, actualSent);
            emit ClingyIncident(_from, "I got sick halfway there and came 90% back to you!", boomeranged);
        } else {
            balanceOf[_from] -= _amount;
            balanceOf[_to] += _amount;

            emit Transfer(_from, _to, _amount);
        }
        return true;
    }
}