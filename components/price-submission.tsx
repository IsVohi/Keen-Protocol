"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertCircle } from "lucide-react"
import { keenOracle } from "@/lib/ergo-contracts"

interface PriceSubmissionProps {
  walletAddress: string
  isRegistered: boolean
  onSubmissionComplete?: () => void
}

export function PriceSubmission({ walletAddress, isRegistered, onSubmissionComplete }: PriceSubmissionProps) {
  const [price, setPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentMedian = 43250.5
  const tolerance = 2.5 // percentage

  const handleSubmit = async () => {
    if (!price) return

    setIsSubmitting(true)
    try {
      const txId = await keenOracle.submitPrice("BTC/USD", Number.parseFloat(price))
      console.log("Price submission transaction:", txId)

      // Clear form
      setPrice("")

      // Notify parent to refresh stats
      onSubmissionComplete?.()

      alert(`Price submitted successfully!\nTransaction: ${txId}`)
    } catch (error) {
      console.error("Price submission error:", error)
      alert("Failed to submit price. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOutlier = price && Math.abs(((Number.parseFloat(price) - currentMedian) / currentMedian) * 100) > tolerance

  if (!isRegistered) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Submission</CardTitle>
          <CardDescription>Submit BTC/USD price data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You must register as an oracle before submitting prices.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Price Data</CardTitle>
        <CardDescription>Submit your BTC/USD price observation for the current epoch</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Median Price</p>
              <p className="text-2xl font-bold">${currentMedian.toLocaleString()}</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.3%
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Last updated: 2 minutes ago • Epoch #1,247</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Your Price Submission (USD)</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="43250.50"
            step="0.01"
          />
          {isOutlier && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Warning: Your submission deviates more than {tolerance}% from the current median. This may impact your
                reputation.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
          <div>
            <p className="text-xs text-muted-foreground">Submissions Today</p>
            <p className="text-lg font-semibold">12/24</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Epoch</p>
            <p className="text-lg font-semibold">8m 32s</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reward Pool</p>
            <p className="text-lg font-semibold">1.2K ERG</p>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!price || isSubmitting} className="w-full" size="lg">
          {isSubmitting ? "Submitting..." : "Submit Price"}
        </Button>
      </CardContent>
    </Card>
  )
}
