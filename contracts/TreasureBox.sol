// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TreasureBox
 * @notice Mystery box game on Base — players pay a fee to reveal a random token reward tier.
 * @dev Pseudo-random via keccak256(blockhash + sender + nonce). For production, use Chainlink VRF.
 */
contract TreasureBox {
    // ── Enums ──────────────────────────────────────────────────────────────
    enum Tier { Common, Rare, Legendary }

    // ── Structs ────────────────────────────────────────────────────────────
    struct OpenResult {
        Tier    tier;
        uint256 reward;
        string  tokenSymbol;
        uint256 timestamp;
    }

    // ── State ──────────────────────────────────────────────────────────────
    address public immutable owner;
    address public treasuryWallet = 0x66A635D839bd99AcA93647B53B43C4d3a16Ea541;
    uint256 public boxPrice     = 0.000042 ether;
    uint256 public jackpotPool;
    uint256 public totalBoxesOpened;
    uint256 private nonce;

    // Reward ranges (in wei)
    uint256 public constant COMMON_MIN    = 0.0000005 ether;
    uint256 public constant COMMON_MAX    = 0.000001  ether;
    uint256 public constant RARE_MIN      = 0.001     ether;
    uint256 public constant RARE_MAX      = 0.01      ether;
    uint256 public constant LEGENDARY_MIN = 0.01      ether;
    uint256 public constant LEGENDARY_MAX = 0.05      ether;

    mapping(address => OpenResult[]) private playerHistory;
    mapping(address => uint256) public claimableRewards;

    // Token symbol lists per tier (set at deployment)
    string[] private commonTokens;
    string[] private rareTokens;
    string[] private legendaryTokens;

    // ── Events ─────────────────────────────────────────────────────────────
    event BoxOpened(address indexed player, Tier tier, uint256 reward, string tokenSymbol);
    event JackpotWon(address indexed player, uint256 amount);
    event RewardsClaimed(address indexed player, uint256 amount);
    event BoxPriceUpdated(uint256 newPrice);

    // ── Modifiers ──────────────────────────────────────────────────────────
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    // ── Constructor ────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;

        // Common tokens (99.49%)
        commonTokens = ["MEME","DOGE","SHIB","FLOKI","BONE","BONK","BOME","BABYDOGE","PONKE","POOCOIN","CATS","DOBO","ELON","YOOSHI","CAT","MEW","POPCAT","BITB","BAKE","DINO"];

        // Rare tokens (0.5%)
        rareTokens = ["ARB","MATIC","SUI","CAKE","TRX","XRP","DEGEN","BRETT","APT","USDT","USDC","SUSHI","ORCA","NAKA","RVN","SUB","STAKE","PEPE","VIRTUAL","DRGN","SHIBDOGE","BGB","BIFI","OSAK","NGC"];

        // Legendary tokens (0.01%)
        legendaryTokens = ["BTC","SOL","ETH"];
    }

    // ── Core Logic ─────────────────────────────────────────────────────────

    // Tracking total rewards across all users to ensure solvency
    uint256 public totalClaimableRewards;

    /**
     * @notice Open a mystery box. Requires exactly `boxPrice` ETH.
     */
    function openBox() external payable {
        require(msg.value == boxPrice, "Incorrect ETH amount");

        uint256 rand = _random();
        Tier tier = _pickTier(rand);
        string memory symbol = _pickToken(tier, rand);
        uint256 reward = _calcReward(tier, rand);

        // Calculate 60% for treasury, 40% stays in contract for rewards
        uint256 treasuryAmount = (msg.value * 60) / 100;
        
        (bool treasuryOk,) = payable(treasuryWallet).call{value: treasuryAmount}("");
        require(treasuryOk, "Treasury transfer failed");

        // The remaining 40% stays in address(this) balance automatically

        // Handle legendary jackpot win (1% chance for legendary, total 1 in 1,000,000)
        if (tier == Tier.Legendary && rand % 100 < 1 && jackpotPool > 0) {
            reward = jackpotPool;
            jackpotPool = 0;
            emit JackpotWon(msg.sender, reward);
        }

        // Add reward to claimable pool
        claimableRewards[msg.sender] += reward;
        totalClaimableRewards += reward;

        totalBoxesOpened++;
        playerHistory[msg.sender].push(OpenResult({
            tier: tier, reward: reward, tokenSymbol: symbol, timestamp: block.timestamp
        }));

        emit BoxOpened(msg.sender, tier, reward, symbol);
    }

    /**
     * @notice Claim all accumulated rewards.
     */
    function claimRewards() external {
        uint256 amount = claimableRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        require(address(this).balance >= amount, "Insufficient contract balance");

        claimableRewards[msg.sender] = 0;
        totalClaimableRewards -= amount;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Claim transfer failed");

        emit RewardsClaimed(msg.sender, amount);
    }

    // ── Views ──────────────────────────────────────────────────────────────

    function getPlayerHistory(address player) external view returns (OpenResult[] memory) {
        return playerHistory[player];
    }

    // ── Admin ──────────────────────────────────────────────────────────────

    function setBoxPrice(uint256 newPrice) external onlyOwner {
        boxPrice = newPrice;
        emit BoxPriceUpdated(newPrice);
    }

    function setTreasuryWallet(address newWallet) external onlyOwner {
        treasuryWallet = newWallet;
    }

    function fundRewards() external payable {
        // Owner can fund the contract for reward payouts
    }

    function fundJackpot() external payable {
        jackpotPool += msg.value;
    }

    function withdrawExcess() external onlyOwner {
        // Only withdraw ETH that is NOT committed to user rewards or the jackpot
        uint256 committed = totalClaimableRewards + jackpotPool;
        if (address(this).balance > committed) {
            uint256 excess = address(this).balance - committed;
            (bool ok,) = payable(owner).call{value: excess}("");
            require(ok, "Withdraw failed");
        }
    }

    receive() external payable { jackpotPool += msg.value; }

    // ── Internal Helpers ───────────────────────────────────────────────────

    function _random() internal returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1), msg.sender, nonce, block.timestamp
        )));
    }

    function _pickTier(uint256 rand) internal pure returns (Tier) {
        uint256 roll = rand % 10000; // 0.01% precision
        if (roll < 9949) return Tier.Common;    // 99.49%
        if (roll < 9999) return Tier.Rare;      // 0.5%
        return Tier.Legendary;                  // 0.01%
    }

    function _pickToken(Tier tier, uint256 rand) internal view returns (string memory) {
        if (tier == Tier.Common)    return commonTokens[(rand >> 8) % commonTokens.length];
        if (tier == Tier.Rare)      return rareTokens[(rand >> 16) % rareTokens.length];
        return legendaryTokens[(rand >> 24) % legendaryTokens.length];
    }

    function _calcReward(Tier tier, uint256 rand) internal pure returns (uint256) {
        if (tier == Tier.Common) {
            // 99.9% chance for lowest (0.0000005), 0.1% for 0.0001
            uint256 roll = (rand >> 32) % 1000;
            if (roll < 999) return 0.0000005 ether;
            return 0.0001 ether;
        }
        if (tier == Tier.Rare) {
            uint256 rRange = RARE_MAX - RARE_MIN;
            return RARE_MIN + ((rand >> 32) % rRange);
        }
        uint256 lRange = LEGENDARY_MAX - LEGENDARY_MIN;
        return LEGENDARY_MIN + ((rand >> 32) % lRange);
    }
}
