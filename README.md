# KEEN Protocol

**Reputation-Secured Oracle Infrastructure for Ergo**

> *Turning oracle trust from an assumption into an on-chain, enforceable property.*

---

## 🚀 Overview

**KEEN** is a **fully decentralized, on-chain oracle reputation and incentive protocol** built on the **Ergo blockchain** using the **eUTXO model**.

Unlike traditional oracle systems that rely on whitelists or assumed honesty, KEEN introduces **verifiable reputation, slashing, and rewards**, all enforced by smart contracts — **without any backend, admin keys, or off-chain trust**.

KEEN is designed to **align with Ergo Oracle Pools (EIP-0023)** and act as a **reputation & accountability layer**, not a replacement.

---

## 🎯 Problem Statement

Decentralized applications depend on oracles — but:

* Oracle trust is often **implicit**, not enforceable
* Equal-weight oracle models ignore historical accuracy
* No transparent way to audit oracle behavior over time
* Incentives for long-term honest operation are weak
* Sybil attacks remain a threat in permissionless systems

**KEEN solves this by making oracle correctness economically measurable, slashable, and rewarded — on-chain.**

---

## ✅ Solution Summary

KEEN introduces a **reputation-weighted oracle protocol** where:

* Every oracle has a **non-transferable on-chain identity**
* Reputation increases only through **correct submissions**
* Incorrect or malicious data leads to **slashing**
* Oracle influence scales with **historical accuracy**
* Rewards accumulate **without creating UTXO dust**
* All logic is **deterministic, auditable, and permissionless**

---

## 🧠 Key Concepts

### 🔐 Oracle Identity

* Oracle = wallet public key
* Identity represented by a **unique NFT**
* Identity cannot be transferred or duplicated

### 📊 Reputation

* Stored on-chain in a `ReputationBox`
* Starts at `0`
* Increases with accuracy
* Decreases only via slashing
* Non-transferable, non-forgeable

### 🧮 Aggregation

* Uses **reputation-weighted median**
* Sorting done off-chain
* Verified on-chain using **off-chain hints**
* Fully permissionless aggregation

### 💰 Rewards

* Accuracy-based incentives
* Rewards **accumulate inside the oracle box**
* No per-epoch reward fan-out
* Withdrawable anytime by oracle

### ⚖️ Disputes & Slashing

* Anyone can challenge incorrect aggregation
* Challenger posts a bond
* Valid dispute → oracle slashed
* Invalid dispute → bond forfeited
* All events recorded on-chain

---

## 🧱 Architecture Overview

```
Oracle Wallet
   ↓
Oracle Registration
   ↓
Identity NFT + ReputationBox (rep = 0)
   ↓
Warm-up Phase (low influence)
   ↓
Price Submission
   ↓
Reputation-Weighted Aggregation
   ↓
Reputation ↑ / Rewards ↑
   ↓
Optional Dispute → Slashing
```

---

## 🧩 Smart Contract Architecture

```
contracts/
├── OracleRegistry.es        # Oracle registration & staking
├── ReputationBox.es         # Reputation + reward accumulation
├── PriceSubmission.es       # Oracle price submissions
├── Aggregation.es           # Weighted median verification
├── RewardAccumulator.es     # Dust-free reward logic
├── Dispute.es               # Challenge & slashing mechanism
├── Treasury.es              # Long-term incentive funding
└── CompatibilityPool.es     # EIP-0023 compatible output
```

All contracts:

* Follow eUTXO principles
* Use deterministic validation
* Contain strict invariants
* Avoid loops & heavy computation
* Require no admin privileges

---

## 🔗 Alignment with Ergo Oracle Pools (EIP-0023)

KEEN is **not a competitor** to Ergo Oracle Pools.

Instead, KEEN provides:

* A **reputation layer** on top of existing pools
* Compatibility outputs matching EIP-0023 structure
* Drop-in replacement for dApps (NFT switch only)
* Optional deep integration for future pools

Existing dApps can adopt KEEN **without rewriting contracts**.

---

## 🖥️ Frontend (No Backend)

KEEN includes a **fully client-side frontend**:

### Features

* Wallet connection (Nautilus)
* Oracle registration
* Live reputation dashboard
* Price submission UI
* Aggregation trigger
* Dispute & slashing interface
* Reward balance & withdrawal

### Stack

* React + TypeScript
* Ergo Explorer (read-only)
* Wallet signing for all actions
* No servers, no databases

---

## 📁 Repository Structure

```
keen/
├── contracts/          # ErgoScript smart contracts
├── frontend/           # Wallet-connected UI
│   ├── components/
│   ├── services/
│   ├── App.tsx
│   └── constants.ts
├── docs/               # Protocol documentation
│   ├── architecture.md
│   ├── invariants.md
│   └── security.md
├── README.md
└── metadata.json
```

---

## 🔒 Security Guarantees

* No oracle can submit twice per round
* No aggregation without threshold
* No reputation jump beyond max delta
* No rewards without correctness proof
* No dispute without bond
* No admin overrides
* All state transitions are atomic

---

## 🧪 Hackathon Scope

### What’s Implemented

* Oracle identity & registration
* On-chain reputation tracking
* Weighted aggregation logic
* Reward accumulation
* Permissionless interaction
* Fully working frontend demo

### What’s Explained (Roadmap)

* Multi-feed support
* DAO-governed parameters
* Ecosystem fee integration
* Advanced dispute resolution

---

## 🏆 Why KEEN Is Different

* Reputation is **on-chain**, not social
* Trust is **earned**, not assumed
* Incentives are **economically enforced**
* Designed specifically for **eUTXO**
* Complements Ergo’s existing oracle stack
* Suitable for DeFi, bridges, and cross-chain use



## 🤝 Contributing

KEEN is a research-grade protocol.
Contributions, audits, and integrations are welcome.

---

## 🧠 One-Line Summary 

> **KEEN transforms oracle trust into an on-chain, slashable, reputation-weighted economic system — fully decentralized and Ergo-native.**

---
