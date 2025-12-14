"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield } from "lucide-react"
import { keenOracle } from "@/lib/ergo-contracts"

interface DisputePanelProps {
  walletAddress: string
}

export function DisputePanel({ walletAddress }: DisputePanelProps) {
  const [epochId, setEpochId] = useState("")
  const [bondAmount, setBondAmount] = useState("10")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const recentDisputes = [
    { epoch: 1245, challenger: "9xYz...a1b2", status: "resolved", outcome: "valid" },
    { epoch: 1243, challenger: "9wXy...c3d4", status: "resolved", outcome: "invalid" },
    { epoch: 1240, challenger: "9vWx...e5f6", status: "pending", outcome: null },
  ]

  const handleDispute = async () => {
    if (!epochId || Number.parseFloat(bondAmount) < 10) {
      alert("Please provide a valid epoch ID and bond amount (minimum 10 ERG)")
      return
    }

    setIsSubmitting(true)
    try {
      const bond = Number.parseFloat(bondAmount)
      const txId = await keenOracle.submitDispute(epochId, `Dispute for epoch ${epochId}`, bond)
      console.log("Dispute transaction:", txId)
      
      alert(`Dispute submitted successfully!\nTransaction: ${txId}`)
      setEpochId("")
      setBondAmount("10")
    } catch (error) {
      console.error("Dispute submission error:", error)
      alert("Failed to submit dispute. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Challenge Aggregation</CardTitle>
          <CardDescription>Submit a dispute if you believe an aggregation result is incorrect</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Disputing requires posting a bond. If your dispute is valid, you'll receive a reward. If invalid, your
              bond will be slashed.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="epoch">Epoch ID to Challenge</Label>
              <Input
                id="epoch"
                type="number"
                value={epochId}
                onChange={(e) => setEpochId(e.target.value)}
                placeholder="1247"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bond">Challenge Bond (ERG)</Label>
              <Input
                id="bond"
                type="number"
                value={bondAmount}
                onChange={(e) => setBondAmount(e.target.value)}
                placeholder="10"
                min="10"
              />
              <p className="text-xs text-muted-foreground">Minimum bond: 10 ERG</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Dispute Process
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Submit challenge with bond
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  On-chain verification of claim
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Oracle slashed if dispute valid
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Reward or bond burn based on outcome
                </li>
              </ul>
            </div>

            <Button
              onClick={handleDispute}
              disabled={!epochId || isSubmitting}
              className="w-full"
              size="lg"
              variant="destructive"
            >
              {isSubmitting ? "Processing..." : `Submit Dispute (${bondAmount} ERG)`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentDisputes.map((dispute, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium">Epoch #{dispute.epoch}</p>
                  <p className="text-xs text-muted-foreground font-mono">by {dispute.challenger}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      dispute.status === "pending"
                        ? "secondary"
                        : dispute.outcome === "valid"
                          ? "default"
                          : "destructive"
                    }
                  >
                    {dispute.status === "pending" ? "Pending" : dispute.outcome === "valid" ? "Valid" : "Invalid"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
