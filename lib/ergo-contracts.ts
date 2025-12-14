import { ergoWallet } from "./ergo-wallet"

export interface Oracle {
  address: string
  reputation: number
  stake: string
  registered: boolean
}

export interface OracleStats {
  reputation: number
  totalSubmissions: number
  rewardsEarned: string
  accuracy: number
}

export interface PriceData {
  oracle: string
  price: number
  timestamp: number
  signature?: string
}

export interface AggregatedPrice {
  value: number
  timestamp: number
  confidence: number
  sources: number
}

export interface PriceSubmission {
  oracle: string
  price: number
  weight: number
  status: "included" | "outlier"
}

// Contract addresses (replace with deployed contract addresses)
const ORACLE_REGISTRY_CONTRACT = "YOUR_ORACLE_REGISTRY_CONTRACT_ADDRESS"
const PRICE_AGGREGATION_CONTRACT = "YOUR_PRICE_AGGREGATION_CONTRACT_ADDRESS"
const DISPUTE_CONTRACT = "YOUR_DISPUTE_CONTRACT_ADDRESS"

interface LocalOracleState {
  registered: { [address: string]: boolean }
  stats: { [address: string]: OracleStats }
  submissions: { [address: string]: Array<{ pair: string; price: number; timestamp: number }> }
  aggregations: { [pair: string]: AggregatedPrice }
  addressToShortMap: { [shortAddress: string]: string } // Map short addresses to full addresses
}

const STORAGE_KEY = "keen_oracle_state"

function loadState(): LocalOracleState {
  if (typeof window === "undefined") {
    return {
      registered: {},
      stats: {},
      submissions: {},
      aggregations: {},
      addressToShortMap: {},
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("[v0] Error loading state from localStorage:", error)
  }

  return {
    registered: {},
    stats: {},
    submissions: {},
    aggregations: {},
    addressToShortMap: {},
  }
}

function saveState(state: LocalOracleState): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("[v0] Error saving state to localStorage:", error)
  }
}

const localState: LocalOracleState = loadState()

export class KeenOracleContract {
  async registerOracle(stake: number): Promise<string> {
    const address = await ergoWallet.getAddress()
    if (!address) {
      throw new Error("Wallet not connected")
    }

    console.log("[v0] Registering oracle with stake:", stake, "ERG")

    try {
      // Initialize local state for this oracle
      localState.registered[address] = true
      localState.stats[address] = {
        reputation: 100,
        totalSubmissions: 0,
        rewardsEarned: "0",
        accuracy: 100,
      }
      localState.submissions[address] = []
      
      // Create short address mapping
      const shortAddr = address.substring(0, 6) + "..." + address.substring(address.length - 4)
      localState.addressToShortMap[shortAddr] = address

      // Save to localStorage
      saveState(localState)

      // In production, this would sign and submit the transaction
      const mockTxId = `mock_registration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log("[v0] Oracle registered successfully (mock):", mockTxId)
      return mockTxId
    } catch (error) {
      console.error("[v0] Registration error:", error)
      throw error
    }
  }

  async submitPrice(pair: string, price: number): Promise<string> {
    const address = await ergoWallet.getAddress()
    if (!address) {
      throw new Error("Wallet not connected")
    }

    console.log("[v0] Submitting price:", pair, price)

    try {
      // Ensure stats exist (in case registration was done elsewhere)
      if (!localState.stats[address]) {
        localState.stats[address] = {
          reputation: 100,
          totalSubmissions: 0,
          rewardsEarned: "0",
          accuracy: 100,
        }
      }

      // Update local state
      if (!localState.submissions[address]) {
        localState.submissions[address] = []
      }

      localState.submissions[address].push({
        pair,
        price,
        timestamp: Date.now(),
      })

      // Update stats - small reputation boost for participation
      if (localState.stats[address]) {
        localState.stats[address].totalSubmissions += 1
        // Small boost for submitting (main boost comes from aggregation accuracy)
        localState.stats[address].reputation += 2
      }

      // Create short address mapping if not exists
      const shortAddr = address.substring(0, 6) + "..." + address.substring(address.length - 4)
      if (!localState.addressToShortMap[shortAddr]) {
        localState.addressToShortMap[shortAddr] = address
      }

      // Store in aggregations for display
      if (!localState.aggregations[pair]) {
        localState.aggregations[pair] = {
          value: price,
          timestamp: Date.now(),
          confidence: 95,
          sources: 1,
        }
      } else {
        // Update running average
        const current = localState.aggregations[pair]
        current.value = (current.value + price) / 2
        current.timestamp = Date.now()
        current.sources += 1
      }

      // Save to localStorage
      saveState(localState)

      const mockTxId = `mock_submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("[v0] Price submitted successfully (mock):", mockTxId)

      await this.updateOracleStatsAfterSubmission(address)
      return mockTxId
    } catch (error) {
      console.error("[v0] Price submission error:", error)
      throw error
    }
  }

  async updateOracleStatsAfterSubmission(address: string): Promise<void> {
    console.log("[v0] Stats updated after submission for:", address)
    // Stats are already updated in submitPrice, this is just for logging
    // Save state to ensure persistence
    saveState(localState)
  }

  async getOracleInfo(address: string): Promise<Oracle | null> {
    console.log("[v0] Checking registration for:", address)

    // Reload state from localStorage to ensure we have latest data
    const currentState = loadState()
    Object.assign(localState, currentState)

    // Check local state first
    if (localState.registered[address]) {
      return {
        address,
        reputation: localState.stats[address]?.reputation || 100,
        stake: "100",
        registered: true,
      }
    }

    // Return unregistered state
    return {
      address,
      reputation: 0,
      stake: "0",
      registered: false,
    }
  }

  async getOracleStats(address: string): Promise<OracleStats> {
    console.log("[v0] Fetching oracle stats for:", address)

    // Reload state from localStorage to ensure we have latest data
    const currentState = loadState()
    Object.assign(localState, currentState)

    if (localState.stats[address]) {
      return { ...localState.stats[address] }
    }

    // Return default stats if not found
    return {
      reputation: 0,
      totalSubmissions: 0,
      rewardsEarned: "0",
      accuracy: 0,
    }
  }

  private async getSubmissionCount(address: string): Promise<number> {
    return localState.submissions[address]?.length || 0
  }

  private async getRewardsBalance(address: string): Promise<string> {
    return localState.stats[address]?.rewardsEarned || "0"
  }

  private async getReputationScore(address: string): Promise<number> {
    return localState.stats[address]?.reputation || 0
  }

  async withdrawRewards(): Promise<string> {
    const address = await ergoWallet.getAddress()
    if (!address) {
      throw new Error("Wallet not connected")
    }

    console.log("[v0] Withdrawing rewards for:", address)

    try {
      // Ensure stats exist
      if (!localState.stats[address]) {
        localState.stats[address] = {
          reputation: 0,
          totalSubmissions: 0,
          rewardsEarned: "0",
          accuracy: 0,
        }
      }

      const rewards = localState.stats[address].rewardsEarned || "0"

      if (Number.parseFloat(rewards) === 0) {
        throw new Error("No rewards available to withdraw")
      }

      // Reset rewards in local state
      localState.stats[address].rewardsEarned = "0"

      // Save state
      saveState(localState)

      const mockTxId = `mock_withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("[v0] Rewards withdrawn successfully (mock):", mockTxId)

      return mockTxId
    } catch (error) {
      console.error("[v0] Withdrawal error:", error)
      throw error
    }
  }

  async getAggregatedPrice(pair: string): Promise<AggregatedPrice | null> {
    console.log("[v0] Fetching aggregated price for:", pair)
    return localState.aggregations[pair] || null
  }

  async getCurrentSubmissions(): Promise<PriceSubmission[]> {
    console.log("[v0] Fetching current epoch submissions")

    // Reload state from localStorage to ensure we have latest data
    const currentState = loadState()
    Object.assign(localState, currentState)

    const submissions: PriceSubmission[] = []
    const currentEpoch = Math.floor(Date.now() / (5 * 60 * 1000))
    const addressMap: { [shortAddr: string]: string } = {} // Track short -> full address mapping

    for (const [address, submissionList] of Object.entries(localState.submissions)) {
      for (const sub of submissionList) {
        const submissionEpoch = Math.floor(sub.timestamp / (5 * 60 * 1000))

        if (submissionEpoch === currentEpoch) {
          const oracleInfo = await this.getOracleInfo(address)
          const shortAddr = address.substring(0, 6) + "..." + address.substring(address.length - 4)
          
          // Store mapping for reward distribution
          addressMap[shortAddr] = address
          localState.addressToShortMap[shortAddr] = address

          submissions.push({
            oracle: shortAddr,
            price: sub.price,
            weight: oracleInfo?.reputation || 50,
            status: "included",
          })
        }
      }
    }

    // Save state
    saveState(localState)

    return submissions
  }

  async triggerAggregation(pair: string): Promise<string> {
    const address = await ergoWallet.getAddress()
    if (!address) {
      throw new Error("Wallet not connected")
    }

    console.log("[v0] Triggering aggregation for:", pair)

    try {
      // Reload state to ensure we have latest submissions
      const currentState = loadState()
      Object.assign(localState, currentState)

      const submissions = await this.getCurrentSubmissions()

      if (submissions.length === 0) {
        throw new Error("No submissions available for aggregation")
      }

      // Calculate weighted median
      const sortedSubmissions = [...submissions].sort((a, b) => a.price - b.price)
      const totalWeight = sortedSubmissions.reduce((sum, s) => sum + s.weight, 0)
      let cumulativeWeight = 0
      let medianPrice = 0

      for (const sub of sortedSubmissions) {
        cumulativeWeight += sub.weight
        if (cumulativeWeight >= totalWeight / 2) {
          medianPrice = sub.price
          break
        }
      }

      // Update aggregated price
      localState.aggregations[pair] = {
        value: medianPrice,
        timestamp: Date.now(),
        confidence: 95,
        sources: submissions.length,
      }

      // Distribute rewards and update reputation/accuracy
      await this.distributeRewards(submissions, medianPrice, pair)

      // Save state after aggregation
      saveState(localState)

      const mockTxId = `mock_aggregation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("[v0] Aggregation completed successfully (mock):", mockTxId)

      return mockTxId
    } catch (error) {
      console.error("[v0] Aggregation error:", error)
      throw error
    }
  }

  private async distributeRewards(submissions: PriceSubmission[], medianPrice: number, pair: string): Promise<void> {
    console.log("[v0] Distributing rewards to oracles and updating reputation/accuracy")

    if (submissions.length === 0) {
      console.warn("[v0] No submissions to distribute rewards to")
      return
    }

    const rewardPool = 100 // 100 ERG per epoch
    const rewardPerOracle = rewardPool / submissions.length

    // Get actual submission prices from local state to calculate accuracy
    const currentEpoch = Math.floor(Date.now() / (5 * 60 * 1000))
    const addressToPriceMap: { [address: string]: number } = {}

    // Map addresses to their submission prices for this epoch
    for (const [address, submissionList] of Object.entries(localState.submissions)) {
      for (const sub of submissionList) {
        if (sub.pair === pair) {
          const submissionEpoch = Math.floor(sub.timestamp / (5 * 60 * 1000))
          if (submissionEpoch === currentEpoch) {
            addressToPriceMap[address] = sub.price
            break
          }
        }
      }
    }

    for (const submission of submissions) {
      if (submission.status === "included") {
        // Use the address mapping to get full address from short address
        const fullAddress = localState.addressToShortMap[submission.oracle]
        
        if (!fullAddress) {
          console.warn(`[v0] Could not find full address for ${submission.oracle}, skipping`)
          continue
        }

        // Ensure stats exist
        if (!localState.stats[fullAddress]) {
          console.warn(`[v0] Stats not found for ${fullAddress}, initializing...`)
          localState.stats[fullAddress] = {
            reputation: 100,
            totalSubmissions: 0,
            rewardsEarned: "0",
            accuracy: 100,
          }
        }

        const stats = localState.stats[fullAddress]

        // Update rewards
        const currentRewards = Number.parseFloat(stats.rewardsEarned || "0")
        stats.rewardsEarned = (currentRewards + rewardPerOracle).toFixed(2)

        // Calculate accuracy based on how close the submission was to median
        const submittedPrice = addressToPriceMap[fullAddress] || submission.price
        const priceDifference = Math.abs(submittedPrice - medianPrice)
        const percentageDifference = medianPrice > 0 ? (priceDifference / medianPrice) * 100 : 0
        
        // Accuracy: 100% if exact match, decreases with difference
        // Max accuracy loss is 50% for very large differences
        const accuracyContribution = Math.max(50, 100 - percentageDifference * 2)
        
        // Update accuracy: weighted average of existing accuracy and new contribution
        const currentAccuracy = stats.accuracy || 100
        // Use exponential moving average: 70% old, 30% new
        stats.accuracy = Math.round((currentAccuracy * 0.7 + accuracyContribution * 0.3) * 100) / 100

        // Update reputation based on accuracy
        // Higher accuracy = more reputation boost
        let reputationBoost = 0
        if (percentageDifference <= 0.5) {
          // Very accurate (within 0.5%): +15 reputation
          reputationBoost = 15
        } else if (percentageDifference <= 1.0) {
          // Accurate (within 1%): +10 reputation
          reputationBoost = 10
        } else if (percentageDifference <= 2.0) {
          // Reasonable (within 2%): +5 reputation
          reputationBoost = 5
        } else if (percentageDifference <= 5.0) {
          // Acceptable (within 5%): +2 reputation
          reputationBoost = 2
        } else {
          // Less accurate (beyond 5%): +1 reputation (still rewarded for participation)
          reputationBoost = 1
        }

        stats.reputation = (stats.reputation || 0) + reputationBoost

        console.log(`[v0] Updated ${submission.oracle} (${fullAddress.substring(0, 8)}...): +${rewardPerOracle.toFixed(2)} ERG, +${reputationBoost} rep, accuracy: ${stats.accuracy.toFixed(2)}% (diff: ${percentageDifference.toFixed(2)}%)`)
      }
    }

    // Save state after distributing rewards
    saveState(localState)
  }

  async submitDispute(txId: string, reason: string, bondAmount?: number): Promise<string> {
    const address = await ergoWallet.getAddress()
    if (!address) {
      throw new Error("Wallet not connected")
    }

    console.log("[v0] Submitting dispute for tx:", txId, "Reason:", reason, "Bond:", bondAmount)

    try {
      // In a real implementation, this would validate the dispute and post the bond
      // For now, we'll just log it and return a mock transaction ID
      const mockTxId = `mock_dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log("[v0] Dispute submitted successfully (mock):", mockTxId)

      return mockTxId
    } catch (error) {
      console.error("[v0] Dispute submission error:", error)
      throw error
    }
  }
}

export const keenOracle = new KeenOracleContract()
