pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract TutorialToken is ERC20 {
	using SafeMath for uint256;
	string public name = "TutorialToken";
	string public symbol = "TT";
	uint8 public decimals = 2;
	uint256 public INITAL_SUPPLY = 420;
	ERC20 public token;
	address payable public wallet;
	uint256 public rate;
	uint256 public weiRaised;


	constructor() public {
		rate = 10;
		wallet = msg.sender;
	}

	function stabilizeRate() public {
		rate = rate * totalSupply();
	}

	function _transfer(address from, address to, uint256 value) internal {
		_transfer(from, to, value);
	}

	function buyExampleToken(address _beneficiary) public payable {
		require(_beneficiary != address(0));
		require(msg.value != 0);
		uint256 tokensToETC = msg.value.mul(rate);
		weiRaised = weiRaised.add(msg.value);
		_mint(_beneficiary, tokensToETC);
		token.transfer(_beneficiary, tokensToETC);
		wallet.transfer(msg.value);
		stabilizeRate();
	}
}