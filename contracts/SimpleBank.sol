// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "hardhat/console.sol";

error SimpleBank__ContractFailed();
error SimpleBank__NotAClient();
error SimpleBank__NoBalanceAvailable();
error SimpleBank__AlreadyEnrolled();
error SimpleBank__NoEnoughFundsAvailable();
error SimpleBank__InternalError();

contract SimpleBank {
    /* State Variables */
    mapping(address => uint256) private s_clientBalance;
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
        return s_clientBalance[msg.sender];
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

        uint256 currentBalance = s_clientBalance[msg.sender];
        uint256 newBalance = currentBalance + msg.value;
        s_clientBalance[msg.sender] = newBalance;
        emit LogDepositMade(msg.sender, msg.value);
        return newBalance;
    }

    function withdraw(uint256 withdrawAmount) public returns (uint256) {
        if (!enrolled[msg.sender]) {
            revert SimpleBank__NotAClient();
        }

        if (withdrawAmount > s_clientBalance[msg.sender]) {
            revert SimpleBank__NoEnoughFundsAvailable();
        }

        console.log(msg.sender);

        address payable client = payable(msg.sender);
        (bool success, ) = client.call{value: withdrawAmount}("");
        if (!success) {
            revert SimpleBank__InternalError();
        }
        uint256 newBalance = s_clientBalance[msg.sender] - withdrawAmount;
        s_clientBalance[msg.sender] = newBalance;
        emit LogWithdrawal(msg.sender, withdrawAmount, s_clientBalance[msg.sender]);
        return newBalance;
    }
}
