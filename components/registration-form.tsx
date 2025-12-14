"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { KycModal } from "@/components/kyc-modal"
import { keenOracle } from "@/lib/ergo-contracts"

interface RegistrationFormProps {
  walletAddress: string
  onRegister: () => void
}

export function RegistrationForm({ walletAddress, onRegister }: RegistrationFormProps) {
  const [stakeAmount, setStakeAmount] = useState("100")
  const [showKycModal, setShowKycModal] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegister = async () => {
    setShowKycModal(true)
  }

  const handleKycComplete = async () => {
    setShowKycModal(false)
    setIsRegistering(true)
    
    try {
      const stake = Number.parseFloat(stakeAmount)
      if (stake < 100) {
        alert("Minimum stake is 100 ERG")
        setIsRegistering(false)
        return
      }

      const txId = await keenOracle.registerOracle(stake)
      console.log("Registration transaction:", txId)
      
      // Notify parent component
      onRegister()
      
      alert(`Successfully registered as oracle!\nTransaction: ${txId}`)
    } catch (error) {
      console.error("Registration error:", error)
      alert("Failed to register. Please try again.")
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Register as Oracle</CardTitle>
          <CardDescription>Stake ERG to become an oracle provider and start earning rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your reputation starts at 0. Build trust by submitting accurate prices for at least 10 rounds to unlock
              full rewards and voting weight.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="stake">Stake Amount (ERG)</Label>
            <Input
              id="stake"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Minimum 100 ERG"
              min="100"
            />
            <p className="text-xs text-muted-foreground">Minimum stake: 100 ERG • Your stake secures the network</p>
          </div>

          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <div className="rounded-md border border-input bg-muted px-3 py-2 font-mono text-sm">{walletAddress}</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <h4 className="text-sm font-medium">Registration Requirements</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                Identity NFT will be minted
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                Non-transferable oracle credentials
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                On-chain reputation tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                Slashing risk for inaccurate data
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleRegister} 
            disabled={Number.parseFloat(stakeAmount) < 100 || isRegistering} 
            className="w-full" 
            size="lg"
          >
            {isRegistering ? "Registering..." : `Register & Stake ${stakeAmount} ERG`}
          </Button>
        </CardContent>
      </Card>

      <KycModal open={showKycModal} onComplete={handleKycComplete} />
    </>
  )
}
