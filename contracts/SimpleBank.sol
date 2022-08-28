// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "hardhat/console.sol";

error SimpleBank__ContractFailed();
error SimpleBank__NotAClient();
error SimpleBank__NoBalanceAvailable();
error SimpleBank__AlreadyEnrolled();
error SimpleBank__NoEnoughFundsAvailable();

contract SimpleBank {
    /* State Variables */
    mapping(address => uint256) private balance;
    mapping(address => bool) private enrolled;
    address public owner = msg.sender;

    /* Events */
    event LogEnrolled(address accountAddress);
    event LogDepositMade(address accountAddress, uint256 amount);
    event LogWithdrawal(address accountAddress, uint256 withdrawAmount, uint256 newBalance);

    /* Functions */
    fallback() external {}

    function getBalance() public view returns (uint256) {
        if (enrolled[msg.sender] == false) {
            revert SimpleBank__NotAClient();
        }
        return balance[msg.sender];
    }

    function enroll() public returns (bool) {
        if (enrolled[msg.sender]) {
            revert SimpleBank__AlreadyEnrolled();
        }
        enrolled[msg.sender] = true;
        emit LogEnrolled(msg.sender);
        return true;
    }

    function deposit() public payable returns (uint256) {
        if (!enrolled[msg.sender]) {
            revert SimpleBank__NotAClient();
        }

        uint256 currentBalance = balance[msg.sender];
        uint256 newBalance = currentBalance + msg.value;
        balance[msg.sender] = newBalance;
        emit LogDepositMade(msg.sender, msg.value);
        return newBalance;
    }

    function withdraw(uint256 withdrawAmount) public returns (uint256) {
        if (!enrolled[msg.sender]) {
            revert SimpleBank__NotAClient();
        }

        if (withdrawAmount > balance[msg.sender]) {
            revert SimpleBank__NoEnoughFundsAvailable();
        }

        console.log(balance[msg.sender]);
        balance[msg.sender] -= withdrawAmount;
        console.log(balance[msg.sender]);
        payable(msg.sender).transfer(withdrawAmount);
        emit LogWithdrawal(msg.sender, withdrawAmount, balance[msg.sender]);
        return balance[msg.sender];
    }
}
