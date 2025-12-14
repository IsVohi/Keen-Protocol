"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock } from "lucide-react"
import { keenOracle, type PriceSubmission } from "@/lib/ergo-contracts"

interface AggregationViewProps {
  walletAddress: string
  onAggregationComplete?: () => void
}

export function AggregationView({ walletAddress, onAggregationComplete }: AggregationViewProps) {
  const [submissions, setSubmissions] = useState<PriceSubmission[]>([])
  const [aggregatedPrice, setAggregatedPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAggregating, setIsAggregating] = useState(false)

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true)
      try {
        const currentSubmissions = await keenOracle.getCurrentSubmissions()
        setSubmissions(currentSubmissions)
        
        // Also fetch the aggregated price if available
        const aggregated = await keenOracle.getAggregatedPrice("BTC/USD")
        if (aggregated) {
          setAggregatedPrice(aggregated.value)
        }
      } catch (error) {
        console.error("Error fetching submissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
    // Refresh every 30 seconds
    const interval = setInterval(fetchSubmissions, 30000)
    return () => clearInterval(interval)
  }, [])

  // Calculate median from submissions if aggregated price is not available
  const median =
    aggregatedPrice !== null
      ? aggregatedPrice
      : submissions.length > 0
        ? (() => {
            const sortedPrices = submissions
              .filter((s) => s.status === "included")
              .map((s) => s.price)
              .sort((a, b) => a - b)
            return sortedPrices.length > 0
              ? sortedPrices[Math.floor(sortedPrices.length / 2)]
              : 0
          })()
        : 0

  const handleTriggerAggregation = async () => {
    setIsAggregating(true)
    try {
      const txId = await keenOracle.triggerAggregation("BTC/USD")
      console.log("Aggregation transaction:", txId)

      // Refresh submissions and aggregated price
      const currentSubmissions = await keenOracle.getCurrentSubmissions()
      setSubmissions(currentSubmissions)
      
      const aggregated = await keenOracle.getAggregatedPrice("BTC/USD")
      if (aggregated) {
        setAggregatedPrice(aggregated.value)
      }

      // Notify parent to refresh stats
      onAggregationComplete?.()

      alert(`Aggregation completed successfully!\nTransaction: ${txId}`)
    } catch (error) {
      console.error("Aggregation error:", error)
      alert("Failed to trigger aggregation. Please try again.")
    } finally {
      setIsAggregating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Price Aggregation</CardTitle>
          <CardDescription>Reputation-weighted median calculation for current epoch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">Aggregated Median Price</p>
            <p className="text-4xl font-bold text-primary mb-1">
              {loading ? "..." : median > 0 ? `$${median.toLocaleString()}` : "No data"}
            </p>
            <p className="text-xs text-muted-foreground">Based on {submissions.length} oracle submissions</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Oracle Submissions</h4>
              <Badge variant="secondary">{submissions.length} oracles</Badge>
            </div>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-4">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">No submissions yet for this epoch</p>
            ) : (
              <div className="space-y-2">
                {submissions.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-mono text-xs">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">{sub.oracle}</p>
                        <p className="text-xs text-muted-foreground">Weight: {sub.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold">${sub.price.toLocaleString()}</p>
                      {sub.status === "included" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Outlier
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next aggregation in:</span>
              <span className="font-semibold">7m 18s</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerAggregation}
              disabled={isAggregating || submissions.length === 0}
            >
              {isAggregating ? "Aggregating..." : "Trigger Aggregation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Aggregation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Submissions are sorted by price (off-chain)</p>
          <p>• Weights are calculated based on oracle reputation</p>
          <p>• Median is found using cumulative weight method</p>
          <p>• Outliers beyond tolerance threshold are excluded</p>
          <p>• Result is verified on-chain for correctness</p>
        </CardContent>
      </Card>
    </div>
  )
}
