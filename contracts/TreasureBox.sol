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
    uint256 public boxPrice     = 0.001 ether;
    uint256 public jackpotPool;
    uint256 public totalBoxesOpened;
    uint256 private nonce;

    // Reward ranges (in wei)
    uint256 public constant COMMON_MIN    = 0.0001 ether;
    uint256 public constant COMMON_MAX    = 0.001  ether;
    uint256 public constant RARE_MIN      = 0.001  ether;
    uint256 public constant RARE_MAX      = 0.01   ether;
    uint256 public constant LEGENDARY_MIN = 0.01   ether;
    uint256 public constant LEGENDARY_MAX = 0.05   ether;

    // Pool splits (basis points, 10000 = 100%)
    uint256 public constant REWARD_BPS  = 7000; // 70% → reward pool
    uint256 public constant JACKPOT_BPS = 2000; // 20% → jackpot pool
    uint256 public constant HOUSE_BPS   = 1000; // 10% → owner

    mapping(address => OpenResult[]) private playerHistory;

    // Token symbol lists per tier (set at deployment)
    string[] private commonTokens;
    string[] private rareTokens;
    string[] private legendaryTokens;

    // ── Events ─────────────────────────────────────────────────────────────
    event BoxOpened(address indexed player, Tier tier, uint256 reward, string tokenSymbol);
    event JackpotWon(address indexed player, uint256 amount);
    event BoxPriceUpdated(uint256 newPrice);

    // ── Modifiers ──────────────────────────────────────────────────────────
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    // ── Constructor ────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;

        // Common tokens (70%)
        commonTokens = ["MEME","DOGE","SHIB","FLOKI","BONE","BONK","BOME","BABYDOGE","PONKE","POOCOIN","CATS","DOBO","ELON","YOOSHI","CAT","MEW","POPCAT","BITB","BAKE","DINO"];

        // Rare tokens (20%)
        rareTokens = ["ETH","SOL","BTC","ARB","MATIC","SUI","CAKE","TRX","XRP","DEGEN","BRETT","APT","USDT","USDC","SUSHI","ORCA","NAKA","RVN","SUB","STAKE"];

        // Legendary tokens (10%)
        legendaryTokens = ["PEPE","VIRTUAL","DRGN","SHIBDOGE","BGB","BIFI","OSAK","NGC"];
    }

    // ── Core Logic ─────────────────────────────────────────────────────────

    /**
     * @notice Open a mystery box. Requires exactly `boxPrice` ETH.
     */
    function openBox() external payable {
        require(msg.value == boxPrice, "Incorrect ETH amount");
        require(address(this).balance >= msg.value, "Insufficient contract balance");

        uint256 rand = _random();
        Tier tier = _pickTier(rand);
        string memory symbol = _pickToken(tier, rand);
        uint256 reward = _calcReward(tier, rand);

        // Split the payment
        uint256 jackpotCut = (msg.value * JACKPOT_BPS) / 10000;
        uint256 houseCut   = (msg.value * HOUSE_BPS)   / 10000;
        jackpotPool += jackpotCut;

        // Transfer house cut
        (bool ok,) = payable(owner).call{value: houseCut}("");
        require(ok, "House transfer failed");

        // Handle legendary jackpot win (30% chance for legendary)
        bool isJackpot = false;
        if (tier == Tier.Legendary && rand % 10 < 3 && jackpotPool > 0) {
            uint256 prize = jackpotPool;
            jackpotPool = 0;
            isJackpot = true;
            (bool sent,) = payable(msg.sender).call{value: prize}("");
            require(sent, "Jackpot transfer failed");
            emit JackpotWon(msg.sender, prize);
            reward = prize;
        } else if (reward <= address(this).balance) {
            (bool sent,) = payable(msg.sender).call{value: reward}("");
            require(sent, "Reward transfer failed");
        }

        totalBoxesOpened++;
        playerHistory[msg.sender].push(OpenResult({
            tier: tier, reward: reward, tokenSymbol: symbol, timestamp: block.timestamp
        }));

        emit BoxOpened(msg.sender, tier, reward, symbol);
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

    function withdrawHouse() external onlyOwner {
        uint256 bal = address(this).balance - jackpotPool;
        require(bal > 0, "Nothing to withdraw");
        (bool ok,) = payable(owner).call{value: bal}("");
        require(ok, "Withdraw failed");
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
        uint256 roll = rand % 100;
        if (roll < 70) return Tier.Common;
        if (roll < 90) return Tier.Rare;
        return Tier.Legendary;
    }

    function _pickToken(Tier tier, uint256 rand) internal view returns (string memory) {
        if (tier == Tier.Common)    return commonTokens[(rand >> 8) % commonTokens.length];
        if (tier == Tier.Rare)      return rareTokens[(rand >> 16) % rareTokens.length];
        return legendaryTokens[(rand >> 24) % legendaryTokens.length];
    }

    function _calcReward(Tier tier, uint256 rand) internal pure returns (uint256) {
        if (tier == Tier.Common) {
            uint256 range = COMMON_MAX - COMMON_MIN;
            return COMMON_MIN + ((rand >> 32) % range);
        }
        if (tier == Tier.Rare) {
            uint256 range = RARE_MAX - RARE_MIN;
            return RARE_MIN + ((rand >> 32) % range);
        }
        uint256 range = LEGENDARY_MAX - LEGENDARY_MIN;
        return LEGENDARY_MIN + ((rand >> 32) % range);
    }
}
