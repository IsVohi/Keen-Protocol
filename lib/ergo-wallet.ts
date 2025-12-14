export interface ErgoAPI {
  connect(): Promise<boolean>
  isConnected(): Promise<boolean>
  get_change_address(): Promise<string>
  get_used_addresses(): Promise<string[]>
  get_utxos(): Promise<any[]>
  get_balance(token_id?: string): Promise<string>
  sign_tx(tx: any): Promise<any>
  submit_tx(tx: any): Promise<string>
}

declare global {
  interface Window {
    ergoConnector?: {
      nautilus?: {
        connect(): Promise<boolean>
        isConnected(): Promise<boolean>
        getContext(): Promise<ErgoAPI>
      }
    }
  }
}

export class ErgoWallet {
  private api: ErgoAPI | null = null

  async connect(): Promise<string> {
    try {
      // Check if Nautilus is installed
      if (!window.ergoConnector?.nautilus) {
        throw new Error("Nautilus wallet not found. Please install the Nautilus browser extension.")
      }

      // Request connection
      const connected = await window.ergoConnector.nautilus.connect()

      if (!connected) {
        throw new Error("Connection rejected by user")
      }

      // Get wallet context/API
      this.api = await window.ergoConnector.nautilus.getContext()

      // Get the primary address
      const address = await this.api.get_change_address()

      return address
    } catch (error) {
      console.error("[v0] Wallet connection error:", error)
      throw error
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!window.ergoConnector?.nautilus) {
        return false
      }
      return await window.ergoConnector.nautilus.isConnected()
    } catch {
      return false
    }
  }

  async getAddress(): Promise<string | null> {
    try {
      if (!this.api) {
        const isConnected = await this.isConnected()
        if (isConnected && window.ergoConnector?.nautilus) {
          this.api = await window.ergoConnector.nautilus.getContext()
        } else {
          return null
        }
      }
      return await this.api.get_change_address()
    } catch (error) {
      console.error("[v0] Error getting address:", error)
      return null
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.api) {
        throw new Error("Wallet not connected")
      }
      // Get ERG balance (no token_id means native ERG)
      return await this.api.get_balance()
    } catch (error) {
      console.error("[v0] Error getting balance:", error)
      throw error
    }
  }

  async signTx(tx: any): Promise<any> {
    try {
      if (!this.api) {
        throw new Error("Wallet not connected")
      }
      return await this.api.sign_tx(tx)
    } catch (error) {
      console.error("[v0] Error signing transaction:", error)
      throw error
    }
  }

  async submitTx(tx: any): Promise<string> {
    try {
      if (!this.api) {
        throw new Error("Wallet not connected")
      }
      return await this.api.submit_tx(tx)
    } catch (error) {
      console.error("[v0] Error submitting transaction:", error)
      throw error
    }
  }

  disconnect() {
    this.api = null
  }
}

export const ergoWallet = new ErgoWallet()
