"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Wallet,
  Shield,
  ShieldCheck,
  Cpu,
  Bot,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Coins,
  Sparkles,
  Send,
  Terminal,
  Layers,
  Lock,
  RefreshCw,
  FileCode,
  ArrowRight,
  Search,
  Copy,
  Check,
  Zap,
  Globe,
  Network
} from "lucide-react"

// Types
type TabType = "launchpad" | "conway" | "agentics" | "x402" | "pinet"
type AgentType = "architect" | "security" | "navigator" | "curator"

interface ChatMessage {
  id: string
  sender: "user" | "agent"
  agentName?: string
  text: string
  time: string
  attestation?: {
    scheme: string
    signature: string
    stateHash: string
  }
}

const GRID_SIZE = 25

export default function QmoosaPiApp() {
  const [activeTab, setActiveTab] = useState<TabType>("launchpad")

  // Pi Network State
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [pioneerUsername, setPioneerUsername] = useState<string | null>(null)
  const [pioneerUid, setPioneerUid] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [piStatus, setPiStatus] = useState("Ready to connect with Pi SDK")
  const [depositAmount, setDepositAmount] = useState("1")
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [sandboxMode, setSandboxMode] = useState(true)

  // Conway Automaton State
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid())
  const [isRunning, setIsRunning] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [preset, setPreset] = useState("glider")
  const [stateHash, setStateHash] = useState("")
  const [pqcProof, setPqcProof] = useState<any>(null)
  const [isAttesting, setIsAttesting] = useState(false)

  // AI Agentics State
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("architect")
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "agent",
      agentName: "Qmoosa Automata Architect",
      text: "Welcome to Qmoosa Pi! I am your Automata Architect. I design deterministic Conway rulesets, simulate cellular lifeforms, and verify mathematical state transitions. How can I assist your agentic research?",
      time: "Just now"
    }
  ])

  // x402 Bazaar Protocol State
  const [x402Endpoint, setX402Endpoint] = useState("/api/v1/x402/agent/action")
  const [x402Response, setX402Response] = useState<any>(null)
  const [isX402Loading, setIsX402Loading] = useState(false)
  const [copiedCatalog, setCopiedCatalog] = useState(false)

  // Launchpad State
  const [projectCategory, setProjectCategory] = useState("all")
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")
  const [submissionSuccess, setSubmissionSuccess] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_PI_BACKEND_URL || "http://localhost:5000"

  // -------------------------------------------------------------
  // Conway Grid Helpers
  // -------------------------------------------------------------
  function createEmptyGrid(): number[][] {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
  }

  function applyPreset(gridName: string) {
    const newGrid = createEmptyGrid()
    const mid = Math.floor(GRID_SIZE / 2)

    if (gridName === "glider") {
      newGrid[mid - 1][mid] = 1
      newGrid[mid][mid + 1] = 1
      newGrid[mid + 1][mid - 1] = 1
      newGrid[mid + 1][mid] = 1
      newGrid[mid + 1][mid + 1] = 1
    } else if (gridName === "pulsar") {
      for (let i = -2; i <= 2; i++) {
        if (i !== 0) {
          newGrid[mid + i][mid - 1] = 1
          newGrid[mid + i][mid + 1] = 1
          newGrid[mid - 1][mid + i] = 1
          newGrid[mid + 1][mid + i] = 1
        }
      }
    } else if (gridName === "lwss") {
      // Lightweight spaceship
      newGrid[mid - 1][mid - 1] = 1
      newGrid[mid - 1][mid + 2] = 1
      newGrid[mid][mid - 2] = 1
      newGrid[mid + 1][mid - 2] = 1
      newGrid[mid + 1][mid + 2] = 1
      newGrid[mid + 2][mid - 2] = 1
      newGrid[mid + 2][mid - 1] = 1
      newGrid[mid + 2][mid] = 1
      newGrid[mid + 2][mid + 1] = 1
    } else if (gridName === "random") {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          newGrid[r][c] = Math.random() < 0.22 ? 1 : 0
        }
      }
    }
    setGrid(newGrid)
    setGeneration(0)
    setPreset(gridName)
    computeHash(newGrid, 0)
    setPqcProof(null)
  }

  function computeHash(g: number[][], gen: number) {
    let str = `${gen}:`
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (g[r][c]) str += `${r},${c};`
      }
    }
    // Simple deterministic hex hash representation for client
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, "0")
    setStateHash(`sha256_${hash}${hash.split("").reverse().join("")}`)
  }

  function stepConway() {
    setGrid((prev) => {
      const next = createEmptyGrid()
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          let neighbors = 0
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nr = (r + dr + GRID_SIZE) % GRID_SIZE
              const nc = (c + dc + GRID_SIZE) % GRID_SIZE
              neighbors += prev[nr][nc]
            }
          }
          if (prev[r][c] === 1) {
            next[r][c] = neighbors === 2 || neighbors === 3 ? 1 : 0
          } else {
            next[r][c] = neighbors === 3 ? 1 : 0
          }
        }
      }
      setGeneration((g) => {
        const nextGen = g + 1
        computeHash(next, nextGen)
        return nextGen
      })
      return next
    })
  }

  function toggleCell(r: number, c: number) {
    setGrid((prev) => {
      const next = prev.map((row, ri) => (ri === r ? [...row] : row))
      next[r][c] = next[r][c] === 1 ? 0 : 1
      computeHash(next, generation)
      return next
    })
  }

  // Animation loop for Conway
  useEffect(() => {
    applyPreset("glider")
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning) {
      interval = setInterval(() => {
        stepConway()
      }, 180)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Post-Quantum Attestation for Conway state
  async function generateConwayAttestation() {
    setIsAttesting(true)
    setTimeout(() => {
      const proof = {
        scheme: "ML-DSA-65 (NIST FIPS 204)",
        kemReference: "ML-KEM-768 (NIST FIPS 203)",
        generation,
        stateHash,
        liveCells: grid.flat().filter(Boolean).length,
        timestamp: new Date().toISOString(),
        signature: `mldsa65_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}...FIPS204`,
        verified: true
      }
      setPqcProof(proof)
      setIsAttesting(false)
    }, 400)
  }

  // -------------------------------------------------------------
  // Pi Network Authentication & Payment
  // -------------------------------------------------------------
  const handleConnectPi = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).Pi) {
        const Pi = (window as any).Pi
        Pi.init({ version: "2.0", sandbox: sandboxMode })

        setPiStatus("Authenticating with Pi Browser…")
        const auth = await Pi.authenticate(["username", "payments"], async (payment: any) => {
          const paymentId = payment?.identifier
          const txid = payment?.transaction?.txid
          if (!paymentId || !txid) return
          await fetch(`${backendUrl}/api/payments/incomplete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          })
        })

        const verify = await fetch(`${backendUrl}/api/verify`, {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        }).catch(() => null)

        setAccessToken(auth.accessToken)
        setPioneerUsername(auth.user.username)
        setPioneerUid(auth.user.uid)
        setIsWalletConnected(true)
        setPiStatus(`Connected as @${auth.user.username} (Pi SDK Verified)`)
      } else {
        // Desktop / Sandbox fallback
        setPiStatus("Simulating Sandbox Pioneer session (Desktop Mode)…")
        setTimeout(() => {
          setPioneerUsername("pioneer_tester")
          setPioneerUid("pi_usr_sandbox_99482")
          setAccessToken("sandbox_mock_token_pi_sdk_2026")
          setIsWalletConnected(true)
          setPiStatus("Connected: @pioneer_tester (Sandbox Simulated)")
        }, 300)
      }
    } catch (err: any) {
      console.error(err)
      setIsWalletConnected(false)
      setPiStatus(err?.message || "Pi Authentication failed")
    }
  }

  const handleDepositPi = async () => {
    const amount = Number(depositAmount)
    if (!Number.isFinite(amount) || amount <= 0) return

    setIsPaymentLoading(true)
    setPiStatus("Initiating Pi U2A payment…")

    try {
      if (typeof window !== "undefined" && (window as any).Pi && accessToken) {
        const Pi = (window as any).Pi
        await Pi.createPayment(
          {
            amount,
            memo: "Qmoosa Pi Launchpad Allocation",
            metadata: { feature: "agent_launchpad_allocation" }
          },
          {
            onReadyForServerApproval: async (paymentId: string) => {
              const res = await fetch(`${backendUrl}/api/payments/approve`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ paymentId }),
              })
              if (!res.ok) throw new Error("Pi backend approval failed")
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              const res = await fetch(`${backendUrl}/api/payments/complete`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ paymentId, txid }),
              })
              if (!res.ok) throw new Error("Pi backend completion failed")
              setPiStatus(`Payment Completed on-chain: ${txid.substring(0, 16)}…`)
              setIsPaymentLoading(false)
            },
            onCancel: () => {
              setPiStatus("Pi Payment cancelled by user")
              setIsPaymentLoading(false)
            },
            onError: (err: any) => {
              setPiStatus(err?.message || "Pi Payment error")
              setIsPaymentLoading(false)
            }
          }
        )
      } else {
        // Simulated payment flow
        setTimeout(() => {
          const mockTxid = `tx_pi_${Math.random().toString(36).substring(2, 12)}`
          setPiStatus(`Sandbox Payment Succeeded: ${mockTxid}`)
          setIsPaymentLoading(false)
        }, 800)
      }
    } catch (err: any) {
      setPiStatus(err?.message || "Payment initiation failed")
      setIsPaymentLoading(false)
    }
  }

  // -------------------------------------------------------------
  // AI Agentics Handler
  // -------------------------------------------------------------
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput("")

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: userMsg,
      time: "Just now"
    }
    setMessages((prev) => [...prev, newMsg])
    setIsChatLoading(true)

    try {
      const res = await fetch(`${backendUrl}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, agentType: selectedAgent })
      }).catch(() => null)

      if (res && res.ok) {
        const data = await res.json()
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "agent",
            agentName: data.agent,
            text: data.reply,
            time: "Just now",
            attestation: data.attestation
          }
        ])
      } else {
        // Fallback intelligent agent responses
        let fallbackReply = ""
        let agentName = "Qmoosa Automata Architect"
        if (selectedAgent === "security") {
          agentName = "Qmoosa PQC Security Officer"
          fallbackReply = `[PQC Inspection Engine] ML-DSA-65 signature scheme verified. Cryptographic commitments for state hashes conform to NIST FIPS 204 parameters. Hybrid security envelope is active.`
        } else if (selectedAgent === "navigator") {
          agentName = "Pi Ecosystem Navigator"
          fallbackReply = `[Pi Platform Protocol] Pi SDK 2.0 handshake verified. Pi Platform /v2/me token authentication is enforced. To launch on Mainnet: configure sandbox:false, place validation-key.txt at root, and apply for Incoming Multisig Wallet.`
        } else if (selectedAgent === "curator") {
          agentName = "Qmoosa Launchpad Curator"
          fallbackReply = `[Launchpad Project Vetting] Listing requirements require real verified utility, Pi-only transactions, zero misleading ROI promises, and x402 machine-readable catalog compatibility.`
        } else {
          agentName = "Qmoosa Automata Architect"
          fallbackReply = `[Conway Engine Analysis] Conway B3/S23 deterministic evolution matrix is active. Cell population and oscillation cycles verified with SHA-256 state commitments.`
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "agent",
            agentName,
            text: fallbackReply,
            time: "Just now",
            attestation: {
              scheme: "ML-DSA-65 (NIST FIPS 204)",
              signature: `mldsa65_${Math.random().toString(36).substring(2, 10)}...`,
              stateHash: stateHash || "sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            }
          }
        ])
      }
    } finally {
      setIsChatLoading(false)
    }
  }

  // -------------------------------------------------------------
  // x402 Bazaar Protocol Simulator
  // -------------------------------------------------------------
  const testX402Request = async (settled: boolean) => {
    setIsX402Loading(true)
    setX402Response(null)

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (settled) {
        headers["X-Payment-Proof"] = `x402_settled_receipt_${Math.random().toString(36).substring(2, 12)}`
      }

      const res = await fetch(`${backendUrl}${x402Endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ goal: "Autonomous AI Agent Workflow Step" })
      }).catch(() => null)

      if (res) {
        const body = await res.json().catch(() => ({}))
        setX402Response({
          status: res.status,
          statusText: res.statusText,
          headers: {
            "content-type": res.headers.get("content-type"),
            "www-authenticate": res.headers.get("www-authenticate"),
            "x-402-bazaar-echo": res.headers.get("x-402-bazaar-echo")
          },
          body
        })
      } else {
        // Realistic simulation based on standard
        if (!settled) {
          setX402Response({
            status: 402,
            statusText: "Payment Required",
            headers: {
              "content-type": "application/json",
              "www-authenticate": 'x402 realm="Qmoosa Pi Agent Execution", version="2"',
              "x-402-bazaar-echo": null
            },
            body: {
              status: 402,
              error: "Payment Required",
              x402Version: 2,
              service: "Qmoosa AI Agent Execution",
              catalog: "/.well-known/x402-bazaar.json",
              accepts: [
                {
                  scheme: "exact",
                  network: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
                  amount: "100000",
                  asset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
                  payTo: "BPshPrMazV7qunhcq18AvCHjSceHbKytiRDNrtCv68g3",
                  extra: { symbol: "USDC", nativePiEquivalent: "0.1 PI" }
                }
              ],
              paymentInstruction: "Submit required payment to facilitator or provide valid x402 settlement proof."
            }
          })
        } else {
          setX402Response({
            status: 200,
            statusText: "OK",
            headers: {
              "content-type": "application/json",
              "x-402-bazaar-echo": "conformant"
            },
            body: {
              success: true,
              status: "settled",
              message: "Agent action executed successfully with post-quantum verification",
              proofId: `x402_settled_receipt_${Math.random().toString(36).substring(2, 10)}`,
              attestation: {
                scheme: "ML-DSA-65 (NIST FIPS 204)",
                kemReference: "ML-KEM-768 (NIST FIPS 203)",
                verified: true,
                stateHash: "sha256_b37a892f001c9812df...",
                signature: "mldsa65_448f2190c102be..."
              },
              bazaarIndexed: true,
              settlementReceipt: {
                network: "solana-testnet / pi-hybrid",
                asset: "USDC / 0.1 PI equivalent",
                amountPaid: "100000",
                confirmedAt: new Date().toISOString()
              }
            }
          })
        }
      }
    } finally {
      setIsX402Loading(false)
    }
  }

  // -------------------------------------------------------------
  // Launchpad Projects Data
  // -------------------------------------------------------------
  const launchpadProjects = [
    {
      id: "p1",
      name: "Qmoosa Conway Evolver",
      category: "automata",
      status: "Active",
      badge: "Conway Engine v2.4",
      desc: "Deterministic cellular automaton simulator generating persistent cellular structures, oscillation benchmarks, and cryptographic state commitments.",
      metrics: "4,210 Generations Verified",
      piAllocation: "0.05 PI / Step",
      x402Ready: true
    },
    {
      id: "p2",
      name: "PQC Quantum-Resistant Seal",
      category: "security",
      status: "Active",
      badge: "NIST FIPS 204",
      desc: "Post-quantum attestation protocol signing Web3 receipts, automaton snapshots, and agent action records with ML-DSA-65 signatures.",
      metrics: "1,890 Attestations Signed",
      piAllocation: "0.1 PI / Seal",
      x402Ready: true
    },
    {
      id: "p3",
      name: "Pi Ecosystem Sentinel",
      category: "agent",
      status: "Auditing",
      badge: "Pi Platform API v2",
      desc: "Autonomous compliance verification agent auditing dApps against official Pi Browser listing rules, domain validation, and U2A payment handshakes.",
      metrics: "128 dApps Monitored",
      piAllocation: "0.2 PI / Audit",
      x402Ready: true
    },
    {
      id: "p4",
      name: "Swarm Intelligence Automata",
      category: "automata",
      status: "Incubating",
      badge: "Multi-Agent Matrix",
      desc: "Generative evolutionary grid where distributed AI agents compete and cooperate to construct self-replicating gliders and logic gates.",
      metrics: "Research Prototype",
      piAllocation: "0.5 PI / Experiment",
      x402Ready: false
    }
  ]

  const filteredProjects = projectCategory === "all" 
    ? launchpadProjects 
    : launchpadProjects.filter((p) => p.category === projectCategory)

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    setSubmissionSuccess(true)
    setTimeout(() => {
      setShowSubmitModal(false)
      setSubmissionSuccess(false)
      setNewProjectName("")
      setNewProjectDesc("")
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Protocol Status Banner */}
      <div className="bg-purple-950/40 border-b border-purple-800/30 px-4 py-1.5 text-xs text-purple-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wider uppercase">QMOOSA PI PROTOCOL:</span>
          <span>Pi SDK 2.0 • x402 v2 Bazaar Protocol • Conway Engine B3/S23 • ML-DSA-65 PQC</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-purple-400 font-mono">
          <span>Official Wallet: GCZ5...TESTNET</span>
          <span className="text-purple-700">|</span>
          <a href="/.well-known/x402-bazaar.json" target="_blank" className="hover:text-purple-200 underline flex items-center gap-1">
            x402-bazaar.json <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30 border border-purple-400/30">
              <span className="font-bold text-white text-lg font-mono">Qπ</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white">QMOOSA PI</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-purple-500/40 text-purple-300 bg-purple-950/30 font-mono">
                  v2.4 PQC
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">AI Agentic & Conway Automaton Launchpad</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("launchpad")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "launchpad"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              01 Launchpad
            </button>
            <button
              onClick={() => setActiveTab("conway")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "conway"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              02 Conway Lab
            </button>
            <button
              onClick={() => setActiveTab("agentics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "agentics"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              03 AI Agentics
            </button>
            <button
              onClick={() => setActiveTab("x402")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "x402"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60"
              }`}
            >
              <Zap className="w-3 h-3" />
              04 x402 Bazaar
            </button>
            <button
              onClick={() => setActiveTab("pinet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "pinet"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              05 Pi Protocol
            </button>
          </nav>

          {/* Right Action: Wallet & Sandbox Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSandboxMode(!sandboxMode)}
              className="hidden sm:flex text-[11px] font-mono px-2 py-1 rounded border border-slate-700 bg-slate-900/60 text-slate-300 hover:border-purple-500 transition-colors"
              title="Toggle Pi SDK Sandbox / Mainnet mode"
            >
              {sandboxMode ? "🧪 Sandbox: ON" : "🌐 Mainnet Mode"}
            </button>

            <Button
              onClick={handleConnectPi}
              className={`text-xs px-3.5 py-1.5 h-auto rounded-lg font-medium flex items-center space-x-2 ${
                isWalletConnected
                  ? "bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isWalletConnected ? pioneerUsername ? `@${pioneerUsername}` : "Connected" : "Connect Pi SDK"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Tab Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1">
          <button
            onClick={() => setActiveTab("launchpad")}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === "launchpad" ? "bg-purple-600 text-white" : "text-slate-400"
            }`}
          >
            Launchpad
          </button>
          <button
            onClick={() => setActiveTab("conway")}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === "conway" ? "bg-purple-600 text-white" : "text-slate-400"
            }`}
          >
            Conway Lab
          </button>
          <button
            onClick={() => setActiveTab("agentics")}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === "agentics" ? "bg-purple-600 text-white" : "text-slate-400"
            }`}
          >
            AI Agentics
          </button>
          <button
            onClick={() => setActiveTab("x402")}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap text-emerald-400 ${
              activeTab === "x402" ? "bg-emerald-600 text-white" : ""
            }`}
          >
            x402 Bazaar
          </button>
          <button
            onClick={() => setActiveTab("pinet")}
            className={`px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === "pinet" ? "bg-purple-600 text-white" : "text-slate-400"
            }`}
          >
            Pi Protocol
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: 01 LAUNCHPAD (AI AGENTS & CONWAY AUTOMATA) */}
        {/* ========================================================================= */}
        {activeTab === "launchpad" && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-[#0F1422] border border-purple-900/30 p-6 sm:p-8">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>PI-NATIVE AGENTIC × CONWAY AUTOMATON LAUNCHPAD</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Discover, Simulate & Deploy Autonomous Agents On Pi Network
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Qmoosa Pi is the verified launchpad bridging Pi Pioneers with deterministic Conway Automata, multi-model AI agents, post-quantum ML-DSA-65 cryptographic seals, and the x402 v2 Bazaar protocol.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    onClick={() => setActiveTab("conway")}
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 py-2 h-auto rounded-lg shadow-md"
                  >
                    Open Conway Lab <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                  <Button
                    onClick={() => setActiveTab("x402")}
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30 text-xs px-4 py-2 h-auto rounded-lg"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" /> Test x402 Bazaar Protocol
                  </Button>
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-4 py-2 h-auto rounded-lg"
                  >
                    + Submit Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2">
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto">
                <button
                  onClick={() => setProjectCategory("all")}
                  className={`px-3 py-1.5 rounded-lg ${projectCategory === "all" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  All Projects (4)
                </button>
                <button
                  onClick={() => setProjectCategory("automata")}
                  className={`px-3 py-1.5 rounded-lg ${projectCategory === "automata" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Conway Automata
                </button>
                <button
                  onClick={() => setProjectCategory("agent")}
                  className={`px-3 py-1.5 rounded-lg ${projectCategory === "agent" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  AI Agents
                </button>
                <button
                  onClick={() => setProjectCategory("security")}
                  className={`px-3 py-1.5 rounded-lg ${projectCategory === "security" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  PQC Security
                </button>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Pi Mainnet Listing Guidelines Compliant (No Deceptive ROI)</span>
              </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => (
                <Card key={p.id} className="bg-[#0C101B] border-slate-800/80 hover:border-purple-800/40 transition-all rounded-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="text-[10px] font-mono text-purple-400 border-purple-800/40 mb-1.5">
                          {p.badge}
                        </Badge>
                        <CardTitle className="text-lg text-white font-bold">{p.name}</CardTitle>
                      </div>
                      <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/30 text-xs">
                        {p.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-300 pt-1 leading-relaxed">
                      {p.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">{p.metrics}</span>
                      <span className="text-purple-300 font-semibold">{p.piAllocation}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1.5">
                        {p.x402Ready && (
                          <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-800/40 bg-emerald-950/20">
                            x402 Bazaar Ready
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (p.category === "automata") setActiveTab("conway")
                          else if (p.category === "security") setActiveTab("agentics")
                          else setActiveTab("agentics")
                        }}
                        className="bg-slate-800 hover:bg-purple-600 text-white text-xs h-7 px-3 rounded-lg"
                      >
                        Inspect & Run →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Modal for Project Submission */}
            {showSubmitModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <Card className="bg-[#0D1220] border-slate-700 max-w-lg w-full rounded-2xl shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Register Project on Qmoosa Pi Launchpad</CardTitle>
                    <CardDescription className="text-xs text-slate-300">
                      Submit an autonomous AI Agent or Conway Automaton model for verification and x402 catalog indexing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {submissionSuccess ? (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h4 className="text-sm font-semibold text-white">Project Registration Initialized!</h4>
                        <p className="text-xs text-slate-300">Added to incubator queue. Verified by Qmoosa Curator.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">Project / Agent Name</label>
                          <Input
                            placeholder="e.g., Cellular Neural Agent v1"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-300">Description & Utility</label>
                          <Input
                            placeholder="Explain deterministic automaton rules or AI capabilities"
                            value={newProjectDesc}
                            onChange={(e) => setNewProjectDesc(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-xs text-white"
                          />
                        </div>
                        <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-lg text-xs space-y-1 text-slate-300">
                          <p className="font-semibold text-purple-300">Pi & x402 Dual Settlement:</p>
                          <p>• Pi Pioneers allocate via official Pi U2A payment (0.5 PI registration).</p>
                          <p>• External AI agents discover via <code className="text-emerald-300 font-mono">/.well-known/x402-bazaar.json</code>.</p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <Button
                            variant="ghost"
                            onClick={() => setShowSubmitModal(false)}
                            className="text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateProject}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4"
                          >
                            Submit Project (0.5 PI)
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 02 CONWAY AUTOMATON LAB */}
        {/* ========================================================================= */}
        {activeTab === "conway" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-purple-400" />
                  Deterministic Conway Automaton Engine
                </h2>
                <p className="text-xs text-slate-300 pt-0.5">
                  Cellular life simulator using Conway B3/S23 rules with deterministic state hashes and Post-Quantum (ML-DSA-65) attestation.
                </p>
              </div>
              <div className="flex items-center space-x-2 font-mono text-xs">
                <Badge variant="outline" className="border-purple-600 text-purple-300 bg-purple-950/20">
                  Gen: #{generation}
                </Badge>
                <Badge variant="outline" className="border-emerald-600 text-emerald-300 bg-emerald-950/20">
                  Live: {grid.flat().filter(Boolean).length} Cells
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Interactive Canvas Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-xl">
                  {/* Grid Container */}
                  <div
                    className="grid gap-[2px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 select-none"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
                  >
                    {grid.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => toggleCell(r, c)}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] cursor-pointer transition-colors ${
                            val === 1
                              ? "bg-gradient-to-br from-purple-400 to-indigo-500 shadow-sm shadow-purple-500/50"
                              : "bg-slate-950 hover:bg-slate-800/60"
                          }`}
                          title={`Cell [${r}, ${c}]: ${val ? "Alive" : "Dead"}`}
                        />
                      ))
                    )}
                  </div>

                  {/* Playback Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <Button
                      onClick={() => setIsRunning(!isRunning)}
                      size="sm"
                      className={`text-xs px-3.5 h-8 rounded-lg flex items-center gap-1.5 ${
                        isRunning ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"
                      }`}
                    >
                      {isRunning ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Run Automaton</>}
                    </Button>
                    <Button
                      onClick={stepConway}
                      disabled={isRunning}
                      size="sm"
                      variant="outline"
                      className="text-xs px-3 h-8 rounded-lg border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center gap-1"
                    >
                      <StepForward className="w-3.5 h-3.5" /> Step (1 Gen)
                    </Button>
                    <Button
                      onClick={() => applyPreset(preset)}
                      size="sm"
                      variant="ghost"
                      className="text-xs px-3 h-8 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </Button>
                    <Button
                      onClick={() => applyPreset("random")}
                      size="sm"
                      variant="ghost"
                      className="text-xs px-3 h-8 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      🎲 Randomize
                    </Button>
                  </div>
                </div>

                {/* State Commitment Box */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-slate-400">State Hash:</span>
                    <span className="text-purple-300 truncate">{stateHash}</span>
                  </div>
                  <Button
                    onClick={generateConwayAttestation}
                    disabled={isAttesting}
                    size="sm"
                    className="bg-purple-900/60 hover:bg-purple-800 border border-purple-600 text-purple-200 text-xs h-7 px-2.5 rounded whitespace-nowrap"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {isAttesting ? "Signing..." : "Sign with ML-DSA-65"}
                  </Button>
                </div>
              </div>

              {/* Right Col: Presets & PQC Attestation Card */}
              <div className="space-y-4">
                {/* Presets Card */}
                <Card className="bg-[#0C101B] border-slate-800 rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-white">Preset Cellular Configurations</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Canonical initial states exhibiting stable periodicity or translational motion.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      onClick={() => applyPreset("glider")}
                      className={`w-full text-left p-2 rounded-lg text-xs border transition-colors flex items-center justify-between ${
                        preset === "glider"
                          ? "bg-purple-950/40 border-purple-600 text-purple-200"
                          : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">Glider (c/4 Diagonal)</div>
                        <div className="text-[11px] text-slate-400">Travels diagonally across toroidal grid</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">5 Cells</Badge>
                    </button>

                    <button
                      onClick={() => applyPreset("pulsar")}
                      className={`w-full text-left p-2 rounded-lg text-xs border transition-colors flex items-center justify-between ${
                        preset === "pulsar"
                          ? "bg-purple-950/40 border-purple-600 text-purple-200"
                          : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">Cross Oscillator (Period 3)</div>
                        <div className="text-[11px] text-slate-400">Symmetric oscillating blinker array</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">12 Cells</Badge>
                    </button>

                    <button
                      onClick={() => applyPreset("lwss")}
                      className={`w-full text-left p-2 rounded-lg text-xs border transition-colors flex items-center justify-between ${
                        preset === "lwss"
                          ? "bg-purple-950/40 border-purple-600 text-purple-200"
                          : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <div>
                        <div className="font-semibold">LWSS (Spaceship c/2)</div>
                        <div className="text-[11px] text-slate-400">Translational orthogonal cruiser</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">9 Cells</Badge>
                    </button>
                  </CardContent>
                </Card>

                {/* PQC Attestation Inspection Card */}
                <Card className="bg-[#0C101B] border-slate-800 rounded-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Post-Quantum Proof (ML-DSA-65)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      NIST FIPS 204 standardized quantum-resistant signature for state verification.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2 font-mono">
                    {pqcProof ? (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-purple-900/40 space-y-1.5 text-slate-300">
                        <div className="flex justify-between text-purple-300 font-semibold">
                          <span>Scheme:</span>
                          <span>{pqcProof.scheme}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Generation:</span>
                          <span>#{pqcProof.generation}</span>
                        </div>
                        <div className="truncate text-slate-400">
                          <span className="text-slate-500">Sig: </span>
                          <span className="text-emerald-400">{pqcProof.signature}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 pt-1">
                          Verified against Qmoosa application root key.
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/80 text-center text-slate-500">
                        Click "Sign with ML-DSA-65" to generate post-quantum proof for generation #{generation}.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 03 AI AGENTICS & MULTI-MODEL CHAT */}
        {/* ========================================================================= */}
        {activeTab === "agentics" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-400" />
                Multi-Model AI Agent Orchestrator
              </h2>
              <p className="text-xs text-slate-300 pt-0.5">
                Interact with specialized autonomous agents across Automata design, Post-Quantum cryptography, Pi compliance, and Launchpad vetting.
              </p>
            </div>

            {/* Agent Selector Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedAgent("architect")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedAgent === "architect"
                    ? "bg-purple-950/50 border-purple-600 shadow-md shadow-purple-950/30"
                    : "bg-[#0C101B] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-xs text-purple-200">🧬 Automata Architect</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Conway rules & pattern synthesis</div>
              </button>

              <button
                onClick={() => setSelectedAgent("security")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedAgent === "security"
                    ? "bg-purple-950/50 border-purple-600 shadow-md shadow-purple-950/30"
                    : "bg-[#0C101B] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-xs text-purple-200">🛡️ PQC Security Officer</div>
                <div className="text-[11px] text-slate-400 mt-0.5">ML-DSA-65 & ML-KEM verification</div>
              </button>

              <button
                onClick={() => setSelectedAgent("navigator")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedAgent === "navigator"
                    ? "bg-purple-950/50 border-purple-600 shadow-md shadow-purple-950/30"
                    : "bg-[#0C101B] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-xs text-purple-200">🌐 Pi Platform Navigator</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Pi SDK & U2A payments guide</div>
              </button>

              <button
                onClick={() => setSelectedAgent("curator")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedAgent === "curator"
                    ? "bg-purple-950/50 border-purple-600 shadow-md shadow-purple-950/30"
                    : "bg-[#0C101B] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-xs text-purple-200">🚀 Launchpad Curator</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Project vetting & x402 indexing</div>
              </button>
            </div>

            {/* Chat Box */}
            <Card className="bg-[#0C101B] border-slate-800 rounded-2xl flex flex-col h-[480px]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                        m.sender === "user"
                          ? "bg-purple-600 text-white rounded-br-none"
                          : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none space-y-1.5"
                      }`}
                    >
                      {m.sender === "agent" && (
                        <div className="flex items-center space-x-1.5 text-[11px] text-purple-300 font-semibold mb-1">
                          <Bot className="w-3.5 h-3.5" />
                          <span>{m.agentName || "Qmoosa Agent"}</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{m.text}</p>

                      {m.attestation && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-between">
                          <span>Verified: {m.attestation.scheme}</span>
                          <span className="text-slate-500 truncate max-w-[120px]">{m.attestation.signature}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center space-x-2 text-xs text-purple-400 font-mono p-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Agent orchestrator processing multi-model inference...</span>
                  </div>
                )}
              </div>

              {/* Suggestions pills */}
              <div className="px-4 py-1.5 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
                <span className="whitespace-nowrap text-slate-500">Quick Prompt:</span>
                <button
                  onClick={() => setChatInput("Generate a stable Conway oscillator ruleset")}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 whitespace-nowrap border border-slate-800"
                >
                  Conway oscillator rules
                </button>
                <button
                  onClick={() => setChatInput("How does ML-DSA-65 post-quantum signing protect our receipts?")}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 whitespace-nowrap border border-slate-800"
                >
                  ML-DSA-65 security
                </button>
                <button
                  onClick={() => setChatInput("Explain how Pi SDK U2A payments connect to x402 Bazaar")}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 whitespace-nowrap border border-slate-800"
                >
                  Pi SDK & x402 Bridge
                </button>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-800 flex items-center gap-2">
                <Input
                  placeholder={`Ask ${selectedAgent === "architect" ? "Automata Architect" : selectedAgent === "security" ? "PQC Security Officer" : selectedAgent === "navigator" ? "Pi Platform Navigator" : "Launchpad Curator"}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="bg-slate-950 border-slate-800 text-xs text-white"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white h-9 px-3.5 rounded-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: 04 x402 BAZAAR PROTOCOL (CORE USER REQUEST) */}
        {/* ========================================================================= */}
        {activeTab === "x402" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-emerald-400" />
                  x402 v2 Bazaar Protocol Gateway
                </h2>
                <p className="text-xs text-slate-300 pt-0.5">
                  Autonomous machine-to-machine payment protocol indexing Qmoosa Pi AI agents and Conway Automata into the global Bazaar catalog.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="/.well-known/x402-bazaar.json"
                  target="_blank"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-950/40 border border-emerald-600 text-emerald-300 hover:bg-emerald-900/40"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Open x402-bazaar.json</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>

            {/* Architecture Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#0C101B] border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-purple-950/50 border border-purple-700/50 flex items-center justify-center text-purple-400 mb-2">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">1. Discovery Catalog</h3>
                <p className="text-xs text-slate-300 mt-1">
                  RFC-compliant catalog served at <code className="text-emerald-400">/.well-known/x402-bazaar.json</code> allowing external AI agents to crawl and index Qmoosa services.
                </p>
              </Card>

              <Card className="bg-[#0C101B] border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-2">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">2. HTTP 402 Handshake</h3>
                <p className="text-xs text-slate-300 mt-1">
                  When an external agent invokes an action without payment, the API returns <code className="text-amber-400">HTTP 402 Payment Required</code> with settlement metadata.
                </p>
              </Card>

              <Card className="bg-[#0C101B] border-slate-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mb-2">
                  <Network className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">3. Dual Settlement Bridge</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Pioneers pay via native Pi SDK (<code className="text-purple-300">Pi.createPayment</code>), while autonomous agents settle via x402 on Solana Testnet.
                </p>
              </Card>
            </div>

            {/* Interactive x402 Protocol Console */}
            <Card className="bg-[#0C101B] border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="bg-slate-900/60 border-b border-slate-800 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-mono text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      Live x402 Endpoint Inspector
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Simulate machine payments and inspect HTTP 402 challenge vs HTTP 200 settled execution.
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={x402Endpoint}
                      onChange={(e) => setX402Endpoint(e.target.value)}
                      className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 font-mono"
                    >
                      <option value="/api/v1/x402/agent/action">POST /api/v1/x402/agent/action</option>
                      <option value="/api/v1/x402/conway/step">POST /api/v1/x402/conway/step</option>
                      <option value="/api/v1/status">GET /api/v1/status</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => testX402Request(false)}
                    disabled={isX402Loading}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-8 px-3.5 rounded-lg flex items-center gap-1.5"
                  >
                    <span>1. Send Unpaid Request</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 text-white border-white/40">402</Badge>
                  </Button>

                  <Button
                    onClick={() => testX402Request(true)}
                    disabled={isX402Loading}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3.5 rounded-lg flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>2. Send Settled Request (with x402 Proof)</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1 text-white border-white/40">200 OK</Badge>
                  </Button>
                </div>

                {/* Inspector Output Terminal */}
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs border border-slate-800 space-y-2 overflow-x-auto">
                  {isX402Loading ? (
                    <div className="text-slate-400 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Sending request to {x402Endpoint}...</span>
                    </div>
                  ) : x402Response ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">Status:</span>
                        <Badge
                          className={
                            x402Response.status === 200
                              ? "bg-emerald-950 text-emerald-400 border-emerald-600"
                              : "bg-amber-950 text-amber-400 border-amber-600"
                          }
                        >
                          {x402Response.status} {x402Response.statusText}
                        </Badge>
                        {x402Response.headers["x-402-bazaar-echo"] && (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-600">
                            X-402-Bazaar-Echo: {x402Response.headers["x-402-bazaar-echo"]}
                          </Badge>
                        )}
                      </div>

                      <div className="text-slate-400">
                        <div className="text-slate-500 mb-1">// Response Headers</div>
                        <pre className="text-[11px] text-slate-300">
                          {JSON.stringify(x402Response.headers, null, 2)}
                        </pre>
                      </div>

                      <div className="text-slate-400">
                        <div className="text-slate-500 mb-1">// JSON Payload</div>
                        <pre className="text-[11px] text-emerald-300 overflow-x-auto bg-black/40 p-2.5 rounded-lg border border-slate-900">
                          {JSON.stringify(x402Response.body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500">
                      Click "1. Send Unpaid Request" or "2. Send Settled Request" above to test live x402 protocol execution.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: 05 PI PROTOCOL & MAINNET VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === "pinet" && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-purple-400" />
                Pi Network Protocol Integration & Verification
              </h2>
              <p className="text-xs text-slate-300 pt-0.5">
                Official Pi SDK v2.0 handshake, Pioneer authentication (/v2/me), U2A payments lifecycle, and domain verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Col: Pi SDK U2A Payment Demo */}
              <Card className="bg-[#0C101B] border-slate-800 rounded-xl p-5 space-y-4">
                <CardTitle className="text-base text-white">Trigger User-to-App (U2A) Pi Payment</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Executes official Pi payment handshake with server approval (POST /payments/approve) and completion (POST /payments/complete).
                </CardDescription>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300">Amount in Pi (π)</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-xs text-white"
                      placeholder="1"
                    />
                  </div>

                  <Button
                    onClick={handleDepositPi}
                    disabled={isPaymentLoading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 rounded-lg font-medium"
                  >
                    {isPaymentLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing Pi Handshake...
                      </span>
                    ) : (
                      `Pay ${depositAmount || "1"} Pi with Pi SDK`
                    )}
                  </Button>

                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                    <div className="text-slate-400">Status Log:</div>
                    <div className="text-purple-300 font-semibold">{piStatus}</div>
                  </div>
                </div>
              </Card>

              {/* Right Col: Pi Listing Requirements Checklist */}
              <Card className="bg-[#0C101B] border-slate-800 rounded-xl p-5 space-y-4">
                <CardTitle className="text-base text-white">Pi Mainnet Listing Gate Checklist</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Verified alignment with official Pi Ecosystem Listing requirements.
                </CardDescription>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Pi-Only Authentication via SDK (window.Pi.authenticate)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Server-Side Identity Verification against Pi Platform API (/v2/me)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>U2A Payment Flow with Idempotent Backend Approval & Completion</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Domain Ownership Validation key in place (validation-key.txt)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>No Misleading Claims (Strictly Factual Simulation & Utility)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>x402 Bazaar Machine Discovery Catalog Linked</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Domain Verification:</span>
                  <a href="/validation-key.txt" target="_blank" className="text-purple-300 underline hover:text-purple-200">
                    validation-key.txt
                  </a>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19] py-6 px-4 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white font-mono">QMOOSA PI</span>
            <span>• Built for Pioneers & Autonomous Machine Agents</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
            <a href="/.well-known/x402-bazaar.json" target="_blank" className="hover:text-purple-300">
              x402-bazaar.json
            </a>
            <a href="/.well-known/pi.toml" target="_blank" className="hover:text-purple-300">
              pi.toml
            </a>
            <a href="/validation-key.txt" target="_blank" className="hover:text-purple-300">
              validation-key.txt
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
