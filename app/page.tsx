"use client"

import { useState, useEffect } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { OracleDashboard } from "@/components/oracle-dashboard"
import { RegistrationForm } from "@/components/registration-form"
import { PriceSubmission } from "@/components/price-submission"
import { AggregationView } from "@/components/aggregation-view"
import { DisputePanel } from "@/components/dispute-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { keenOracle } from "@/lib/ergo-contracts"

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [isRegistered, setIsRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const checkRegistration = async () => {
      if (!walletAddress) {
        setIsRegistered(false)
        return
      }

      setCheckingRegistration(true)
      try {
        const oracleInfo = await keenOracle.getOracleInfo(walletAddress)
        if (oracleInfo?.registered) {
          setIsRegistered(true)
          console.log("[v0] Oracle already registered:", walletAddress)
        } else {
          setIsRegistered(false)
          console.log("[v0] Oracle not registered:", walletAddress)
        }
      } catch (error) {
        console.error("[v0] Error checking registration:", error)
        setIsRegistered(false)
      } finally {
        setCheckingRegistration(false)
      }
    }

    checkRegistration()
  }, [walletAddress])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleRegistration = () => {
    setIsRegistered(true)
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-5 w-5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight">KEEN</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect onConnect={setWalletAddress} connectedAddress={walletAddress} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {!walletAddress ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-10 w-10 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-balance">Connect Your Wallet</h1>
            <p className="mb-8 max-w-md text-muted-foreground text-pretty">
              Connect your Ergo wallet to participate in the KEEN oracle protocol. Submit prices, earn rewards, and
              build reputation.
            </p>
            <WalletConnect onConnect={setWalletAddress} variant="large" connectedAddress="" />
          </div>
        ) : checkingRegistration ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-muted-foreground">Checking registration status...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <OracleDashboard
              walletAddress={walletAddress}
              isRegistered={isRegistered}
              refreshTrigger={refreshTrigger}
            />

            <Tabs defaultValue={isRegistered ? "submit" : "register"} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="submit">Submit Price</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="aggregate">Aggregation</TabsTrigger>
                <TabsTrigger value="dispute">Dispute</TabsTrigger>
              </TabsList>

              <TabsContent value="submit" className="mt-6">
                <PriceSubmission
                  walletAddress={walletAddress}
                  isRegistered={isRegistered}
                  onSubmissionComplete={handleRefresh}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                {isRegistered ? (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                        <svg
                          className="h-6 w-6 text-success"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">Already Registered</h3>
                    <p className="text-muted-foreground">
                      Your wallet is already registered as an oracle. You can submit prices and participate in the
                      protocol.
                    </p>
                  </div>
                ) : (
                  <RegistrationForm walletAddress={walletAddress} onRegister={handleRegistration} />
                )}
              </TabsContent>

              <TabsContent value="aggregate" className="mt-6">
                <AggregationView walletAddress={walletAddress} onAggregationComplete={handleRefresh} />
              </TabsContent>

              <TabsContent value="dispute" className="mt-6">
                <DisputePanel walletAddress={walletAddress} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}
