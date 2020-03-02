pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract TutorialToken is ERC20 {
	using SafeMath for uint256;
	string public name = "TutorialToken";
	string public symbol = "TT";
	uint8 public decimals = 2;
	uint256 public INITAL_SUPPLY = 100;

	// ERC20 public token;
	address public owner;

	uint256 public rate;
	uint256 public weiRaised;

	constructor() public {
		rate = 10;
		owner = msg.sender;
	}

	function stabilizeRate() public {
		rate = rate * totalSupply();
	}

	function _transfer(address from, address to, uint256 value) internal {
		_transfer(from, to, value);
	}

	function buyExampleToken() public payable {
		require(msg.value != 0);

		uint256 numTokens = msg.value.mul(rate);
		uint256 nextBalance = address(this).balance.add(msg.value);

		// Security check
		require(nextBalance > address(this).balance); 

		_mint(msg.sender, numTokens); // mints new coin to sender

		// Removed the call to transfer function 

		/*
			Might implement a withdraw function where we call owner.transfer
		*/ 

		stabilizeRate();
	}
}