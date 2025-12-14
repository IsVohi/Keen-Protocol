"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, Copy, LogOut, Check, AlertCircle } from "lucide-react"
import { ergoWallet } from "@/lib/ergo-wallet"

interface WalletConnectProps {
  onConnect: (address: string) => void
  variant?: "default" | "large"
  connectedAddress?: string
}

export function WalletConnect({ onConnect, variant = "default", connectedAddress = "" }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    if (connectedAddress) {
      setAddress(connectedAddress)
    } else {
      setAddress(null)
    }
  }, [connectedAddress])

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await ergoWallet.isConnected()
      if (isConnected) {
        const addr = await ergoWallet.getAddress()
        if (addr) {
          setAddress(addr)
          onConnect(addr)
        }
      }
    }
    if (!connectedAddress) {
      checkConnection()
    }
  }, [onConnect, connectedAddress])

  const connectWallet = async () => {
    setConnecting(true)
    setError(null)

    try {
      const walletAddress = await ergoWallet.connect()
      setAddress(walletAddress)
      onConnect(walletAddress)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      setError(errorMessage)
      console.error("[v0] Wallet connection failed:", err)
    } finally {
      setConnecting(false)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const disconnect = () => {
    ergoWallet.disconnect()
    setAddress(null)
    onConnect("")
  }

  if (address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-transparent">
            <div className="h-2 w-2 rounded-full bg-success" />
            {address.slice(0, 6)}...{address.slice(-4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={copyAddress} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={connectWallet}
        className="gap-2"
        size={variant === "large" ? "lg" : "default"}
        disabled={connecting}
      >
        <Wallet className="h-4 w-4" />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}
