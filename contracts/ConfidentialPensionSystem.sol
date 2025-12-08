// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Confidential Pension System
/// @notice A privacy-preserving pension management system using Fully Homomorphic Encryption
/// @dev This contract demonstrates how to build a secure retirement fund platform where:
///      - Pension contributions remain completely confidential
///      - Investment returns are calculated on encrypted data
///      - Withdrawal amounts are processed without revealing sensitive information
///      - Only account holders can decrypt their financial information
contract ConfidentialPensionSystem is ZamaEthereumConfig {

    /// @notice Represents a user's pension account with encrypted financial data
    struct PensionAccount {
        euint64 balance;              // Encrypted total balance
        euint64 contributions;        // Encrypted total contributions made
        euint64 investmentReturns;    // Encrypted accumulated investment returns
        uint256 lastContribution;     // Timestamp of last contribution
        uint256 retirementAge;        // User-specified retirement age
        bool isActive;                // Account active status
        bool isRetired;               // Retirement status flag
    }

    /// @notice Investment options with different risk-return profiles
    struct InvestmentOption {
        string name;                  // Investment option name
        uint256 riskLevel;           // Risk level (1-10, 10 being highest)
        uint64 returnRate;           // Annual return rate in basis points (e.g., 300 = 3%)
        bool isActive;               // Whether this option is currently available
    }

    /// @dev Mapping from user address to their pension account
    mapping(address => PensionAccount) public pensionAccounts;

    /// @dev Mapping from option ID to investment details
    mapping(uint256 => InvestmentOption) public investmentOptions;

    /// @dev Mapping from user address to their selected investment option ID
    mapping(address => uint256) public userInvestmentChoice;

    uint256 public totalInvestmentOptions;
    uint256 public constant MIN_RETIREMENT_AGE = 55;
    uint256 public constant MAX_RETIREMENT_AGE = 75;
    uint256 public constant SECONDS_PER_MONTH = 30 days;
    address public admin;

    /// @notice Emitted when a new pension account is created
    event AccountCreated(address indexed user, uint256 retirementAge);

    /// @notice Emitted when a user makes a contribution (amount is encrypted)
    event ContributionMade(address indexed user);

    /// @notice Emitted when a user selects an investment option
    event InvestmentOptionSelected(address indexed user, uint256 optionId);

    /// @notice Emitted when investment returns are calculated
    event ReturnsCalculated(address indexed user);

    /// @notice Emitted when a user initiates retirement
    event RetirementInitiated(address indexed user);

    /// @notice Emitted when a withdrawal is made (amount is encrypted)
    event WithdrawalMade(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier hasActiveAccount() {
        require(pensionAccounts[msg.sender].isActive, "No active pension account");
        _;
    }

    modifier notRetired() {
        require(!pensionAccounts[msg.sender].isRetired, "Account is already retired");
        _;
    }

    constructor() {
        admin = msg.sender;

        // Initialize default investment options
        investmentOptions[0] = InvestmentOption({
            name: "Conservative Bonds",
            riskLevel: 2,
            returnRate: 300,  // 3% annual return
            isActive: true
        });

        investmentOptions[1] = InvestmentOption({
            name: "Balanced Portfolio",
            riskLevel: 5,
            returnRate: 600,  // 6% annual return
            isActive: true
        });

        investmentOptions[2] = InvestmentOption({
            name: "Growth Stocks",
            riskLevel: 8,
            returnRate: 900,  // 9% annual return
            isActive: true
        });

        totalInvestmentOptions = 3;
    }

    /// @notice Creates a new pension account for the caller
    /// @param _retirementAge The age at which the user plans to retire (55-75)
    /// @dev The account is initialized with zero encrypted balances
    function createPensionAccount(uint256 _retirementAge) external {
        require(!pensionAccounts[msg.sender].isActive, "Account already exists");
        require(
            _retirementAge >= MIN_RETIREMENT_AGE && _retirementAge <= MAX_RETIREMENT_AGE,
            "Invalid retirement age"
        );

        // Initialize encrypted values to zero
        euint64 zero = FHE.fromUint(0);

        pensionAccounts[msg.sender] = PensionAccount({
            balance: zero,
            contributions: zero,
            investmentReturns: zero,
            lastContribution: block.timestamp,
            retirementAge: _retirementAge,
            isActive: true,
            isRetired: false
        });

        // Grant permissions for the encrypted zero values
        FHE.allowThis(zero);
        FHE.allow(zero, msg.sender);

        // Default to conservative investment
        userInvestmentChoice[msg.sender] = 0;

        emit AccountCreated(msg.sender, _retirementAge);
    }

    /// @notice Makes an encrypted contribution to the pension account
    /// @param inputAmount The encrypted contribution amount
    /// @param inputProof The proof for the encrypted input
    /// @dev The contribution is added to both balance and total contributions
    ///      Demonstrates key FHEVM pattern: FHE.fromExternal() to process encrypted user input
    function makeContribution(externalEuint64 inputAmount, bytes calldata inputProof)
        external
        hasActiveAccount
        notRetired
    {
        // Convert external encrypted input to internal encrypted type
        // This validates the input proof and binds the value to this contract
        euint64 encryptedAmount = FHE.fromExternal(inputAmount, inputProof);

        PensionAccount storage account = pensionAccounts[msg.sender];

        // Perform encrypted addition: balance = balance + amount
        account.balance = FHE.add(account.balance, encryptedAmount);
        account.contributions = FHE.add(account.contributions, encryptedAmount);
        account.lastContribution = block.timestamp;

        // Grant permissions for the new encrypted values
        // ✅ CRITICAL: Both allowThis() and allow() are required
        FHE.allowThis(account.balance);
        FHE.allow(account.balance, msg.sender);

        FHE.allowThis(account.contributions);
        FHE.allow(account.contributions, msg.sender);

        emit ContributionMade(msg.sender);
    }

    /// @notice Selects an investment option for the pension account
    /// @param optionId The ID of the investment option to select (0-2)
    function selectInvestmentOption(uint256 optionId)
        external
        hasActiveAccount
        notRetired
    {
        require(optionId < totalInvestmentOptions, "Invalid investment option");
        require(investmentOptions[optionId].isActive, "Investment option not active");

        userInvestmentChoice[msg.sender] = optionId;

        emit InvestmentOptionSelected(msg.sender, optionId);
    }

    /// @notice Calculates and applies investment returns to the account
    /// @dev Returns are calculated based on time elapsed and selected investment option
    ///      Demonstrates encrypted arithmetic operations on sensitive financial data
    function calculateReturns() external hasActiveAccount {
        PensionAccount storage account = pensionAccounts[msg.sender];
        uint256 investmentOption = userInvestmentChoice[msg.sender];

        // Calculate time elapsed since last contribution
        uint256 timeElapsed = block.timestamp - account.lastContribution;

        // Only calculate returns if at least one month has passed
        if (timeElapsed >= SECONDS_PER_MONTH) {
            uint64 returnRate = investmentOptions[investmentOption].returnRate;

            // Calculate monthly return: (balance * returnRate) / (10000 * 12)
            // Division by 10000 converts basis points to percentage
            // Division by 12 gives monthly return

            // First, multiply balance by return rate
            euint64 rateMultiplier = FHE.fromUint(returnRate);
            euint64 grossReturn = FHE.mul(account.balance, rateMultiplier);

            // Then divide by 120000 (10000 * 12) to get monthly return
            // Note: In FHEVM, division by constants uses FHE.div()
            euint64 monthlyReturn = FHE.div(grossReturn, 120000);

            // Add returns to both investment returns tracking and total balance
            account.investmentReturns = FHE.add(account.investmentReturns, monthlyReturn);
            account.balance = FHE.add(account.balance, monthlyReturn);

            // Update last contribution time
            account.lastContribution = block.timestamp;

            // Grant permissions for updated encrypted values
            FHE.allowThis(account.investmentReturns);
            FHE.allow(account.investmentReturns, msg.sender);

            FHE.allowThis(account.balance);
            FHE.allow(account.balance, msg.sender);

            emit ReturnsCalculated(msg.sender);
        }
    }

    /// @notice Initiates retirement for the account holder
    /// @dev Once retired, user can make withdrawals but cannot make new contributions
    function initiateRetirement() external hasActiveAccount notRetired {
        pensionAccounts[msg.sender].isRetired = true;

        emit RetirementInitiated(msg.sender);
    }

    /// @notice Withdraws an encrypted amount from the pension account
    /// @param inputAmount The encrypted withdrawal amount
    /// @param inputProof The proof for the encrypted input
    /// @dev Demonstrates encrypted comparison to ensure sufficient balance
    ///      Uses FHE.lte() to check: amount <= balance (on encrypted data!)
    function withdraw(externalEuint64 inputAmount, bytes calldata inputProof)
        external
        hasActiveAccount
    {
        require(pensionAccounts[msg.sender].isRetired, "Must be retired to withdraw");

        // Convert external encrypted input
        euint64 encryptedAmount = FHE.fromExternal(inputAmount, inputProof);

        PensionAccount storage account = pensionAccounts[msg.sender];

        // ✅ Encrypted comparison: Check if withdrawal amount <= balance
        // This is a key FHEVM feature - comparing encrypted values without decryption
        ebool hasSufficientBalance = FHE.lte(encryptedAmount, account.balance);

        // For security, we use FHE.select() to conditionally update the balance
        // If hasSufficientBalance is true, subtract amount; otherwise, keep original balance
        euint64 newBalance = FHE.sub(account.balance, encryptedAmount);
        account.balance = FHE.select(hasSufficientBalance, newBalance, account.balance);

        // Grant permissions
        FHE.allowThis(account.balance);
        FHE.allow(account.balance, msg.sender);

        emit WithdrawalMade(msg.sender);
    }

    /// @notice Returns the encrypted balance for the caller
    /// @return The encrypted balance (euint64)
    /// @dev User can decrypt this value using their private key via FHEVM SDK
    function getBalance() external view hasActiveAccount returns (euint64) {
        return pensionAccounts[msg.sender].balance;
    }

    /// @notice Returns the encrypted total contributions for the caller
    /// @return The encrypted contributions (euint64)
    function getContributions() external view hasActiveAccount returns (euint64) {
        return pensionAccounts[msg.sender].contributions;
    }

    /// @notice Returns the encrypted investment returns for the caller
    /// @return The encrypted returns (euint64)
    function getReturns() external view hasActiveAccount returns (euint64) {
        return pensionAccounts[msg.sender].investmentReturns;
    }

    /// @notice Returns non-sensitive account information
    /// @return retirementAge The user's retirement age
    /// @return lastContribution Timestamp of last contribution
    /// @return isRetired Whether the account is in retirement status
    /// @return selectedInvestment The currently selected investment option ID
    function getAccountInfo() external view hasActiveAccount returns (
        uint256 retirementAge,
        uint256 lastContribution,
        bool isRetired,
        uint256 selectedInvestment
    ) {
        PensionAccount storage account = pensionAccounts[msg.sender];
        return (
            account.retirementAge,
            account.lastContribution,
            account.isRetired,
            userInvestmentChoice[msg.sender]
        );
    }

    /// @notice Returns investment option details
    /// @param optionId The ID of the investment option
    /// @return name Investment option name
    /// @return riskLevel Risk level (1-10)
    /// @return isActive Whether the option is currently available
    function getInvestmentOption(uint256 optionId) external view returns (
        string memory name,
        uint256 riskLevel,
        bool isActive
    ) {
        require(optionId < totalInvestmentOptions, "Invalid investment option");
        InvestmentOption storage option = investmentOptions[optionId];
        return (option.name, option.riskLevel, option.isActive);
    }

    // ========== Admin Functions ==========

    /// @notice Adds a new investment option (admin only)
    /// @param name The name of the investment option
    /// @param riskLevel The risk level (1-10)
    /// @param returnRate The annual return rate in basis points
    function addInvestmentOption(
        string memory name,
        uint256 riskLevel,
        uint64 returnRate
    ) external onlyAdmin {
        investmentOptions[totalInvestmentOptions] = InvestmentOption({
            name: name,
            riskLevel: riskLevel,
            returnRate: returnRate,
            isActive: true
        });
        totalInvestmentOptions++;
    }

    /// @notice Updates the return rate for an investment option (admin only)
    /// @param optionId The ID of the option to update
    /// @param returnRate The new return rate in basis points
    function updateInvestmentReturn(uint256 optionId, uint64 returnRate) external onlyAdmin {
        require(optionId < totalInvestmentOptions, "Invalid investment option");
        investmentOptions[optionId].returnRate = returnRate;
    }

    /// @notice Toggles the active status of an investment option (admin only)
    /// @param optionId The ID of the option to toggle
    function toggleInvestmentOption(uint256 optionId) external onlyAdmin {
        require(optionId < totalInvestmentOptions, "Invalid investment option");
        investmentOptions[optionId].isActive = !investmentOptions[optionId].isActive;
    }
}
