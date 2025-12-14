"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award, Coins, Activity } from "lucide-react"
import { keenOracle, type OracleStats } from "@/lib/ergo-contracts"

interface OracleDashboardProps {
  walletAddress: string
  isRegistered: boolean
  refreshTrigger?: number
}

export function OracleDashboard({ walletAddress, isRegistered, refreshTrigger }: OracleDashboardProps) {
  const [stats, setStats] = useState<OracleStats>({
    reputation: 0,
    totalSubmissions: 0,
    rewardsEarned: "0",
    accuracy: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      if (!walletAddress || !isRegistered) {
        setStats({
          reputation: 0,
          totalSubmissions: 0,
          rewardsEarned: "0",
          accuracy: 0,
        })
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const oracleStats = await keenOracle.getOracleStats(walletAddress)
        setStats(oracleStats)
      } catch (error) {
        console.error("Error fetching oracle stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [walletAddress, isRegistered, refreshTrigger]) // Added refreshTrigger dependency

  const handleWithdraw = async () => {
    if (Number.parseFloat(stats.rewardsEarned) <= 0) {
      return
    }

    setIsWithdrawing(true)
    try {
      const txId = await keenOracle.withdrawRewards()
      console.log("Withdrawal transaction:", txId)

      // Refresh stats after withdrawal
      const oracleStats = await keenOracle.getOracleStats(walletAddress)
      setStats(oracleStats)

      alert(`Successfully withdrew ${stats.rewardsEarned} ERG!\nTransaction: ${txId}`)
    } catch (error) {
      console.error("Withdrawal error:", error)
      alert("Failed to withdraw rewards. Please try again.")
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Reputation Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.reputation}</div>
          {isRegistered && stats.reputation > 0 && <p className="text-xs text-success">On-chain verified</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalSubmissions}</div>
          {isRegistered && <p className="text-xs text-muted-foreground">All time</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rewards Earned</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.rewardsEarned} ERG</div>
          {isRegistered && Number.parseFloat(stats.rewardsEarned) > 0 && (
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              size="sm"
              variant="outline"
              className="mt-2 w-full bg-transparent"
            >
              {isWithdrawing ? "Withdrawing..." : "Withdraw"}
            </Button>
          )}
          {isRegistered && Number.parseFloat(stats.rewardsEarned) === 0 && (
            <p className="text-xs text-muted-foreground">No rewards yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.accuracy}%</div>
          {isRegistered && stats.accuracy > 90 && (
            <Badge variant="secondary" className="mt-1">
              Excellent
            </Badge>
          )}
          {isRegistered && stats.accuracy > 0 && stats.accuracy <= 90 && (
            <Badge variant="secondary" className="mt-1">
              Good
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
