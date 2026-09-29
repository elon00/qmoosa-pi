"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Wallet, Shield, Users, Star, Lock, TrendingUp, Cpu, ArrowRight, CheckCircle } from "lucide-react"

export default function PiNetworkLaunchpad() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [status, setStatus] = useState("")
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_PI_BACKEND_URL || "http://localhost:5000"
  const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX !== "false"

  const handleConnectWallet = async () => {
    try {
      if (!window.Pi) throw new Error("Pi SDK is not available")
      window.Pi.init({ version: "2.0", sandbox })

      const auth = await window.Pi.authenticate(["username", "payments"], async (payment: any) => {
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
      })
      if (!verify.ok) throw new Error("Server could not verify Pioneer")

      setAccessToken(auth.accessToken)
      setIsWalletConnected(true)
      setStatus(`Authenticated as ${auth.user.username}`)
    } catch (error) {
      console.error(error)
      setAccessToken(null)
      setIsWalletConnected(false)
      setStatus(error instanceof Error ? error.message : "Pi authentication failed")
    }
  }

  const handleDeposit = async () => {
    const amount = Number(depositAmount)
    if (!window.Pi || !accessToken || !isWalletConnected || !Number.isFinite(amount) || amount <= 0) return

    setIsPaymentLoading(true)
    setStatus("Starting Pi payment…")

    try {
      await window.Pi.createPayment(
        {
          amount,
          memo: "Pi Network Launchpad deposit",
          metadata: { feature: "launchpad_deposit" },
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
            if (!res.ok) throw new Error("Server approval failed")
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
            if (!res.ok) throw new Error("Server completion failed")
            setStatus(`Payment complete: ${txid}`)
            setDepositAmount("")
            setIsPaymentLoading(false)
          },
          onCancel: () => {
            setStatus("Payment cancelled")
            setIsPaymentLoading(false)
          },
          onError: (error: Error) => {
            console.error(error)
            setStatus(error.message || "Pi payment failed")
            setIsPaymentLoading(false)
          },
        },
      )
    } catch (error) {
      console.error(error)
      setStatus(error instanceof Error ? error.message : "Pi payment failed")
      setIsPaymentLoading(false)
    }
  }

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Crypto Investor • $2.3M Portfolio",
      content:
        "Pi Network Launchpad delivered 340% returns on my first investment. The post-quantum security gives me confidence to invest larger amounts.",
      rating: 5,
      avatar: "/professional-woman-crypto-investor.jpg",
    },
    {
      name: "Marcus Rodriguez",
      role: "Blockchain Developer • Ex-Ethereum Foundation",
      content:
        "I've received over $50K in airdrops from projects I backed early. The smart contract integration is flawless and the team delivers.",
      rating: 5,
      avatar: "/hispanic-male-blockchain-developer.jpg",
    },
    {
      name: "Dr. Emily Watson",
      role: "AI Research Lead • MIT",
      content:
        "Finally, a launchpad that understands quantum-resistant cryptography. I've invested $100K and recommended it to my entire research team.",
      rating: 5,
      avatar: "/female-ai-researcher-scientist.jpg",
    },
  ]

  const projects = [
    {
      name: "QuantumAI Protocol",
      description: "Post-quantum AI consensus mechanism",
      raised: "2.5M PI",
      target: "5M PI",
      participants: 1250,
      status: "Active",
    },
    {
      name: "Neural Chain",
      description: "Decentralized AI training network",
      raised: "1.8M PI",
      target: "3M PI",
      participants: 890,
      status: "Active",
    },
    {
      name: "CryptoMind",
      description: "AI-powered trading algorithms",
      raised: "4.2M PI",
      target: "4M PI",
      participants: 2100,
      status: "Completed",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">π</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Pi Network Launchpad</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="#projects" className="text-foreground hover:text-primary transition-colors">
                Projects
              </a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">
                Success Stories
              </a>
            </nav>
            <Button
              onClick={handleConnectWallet}
              variant={isWalletConnected ? "secondary" : "default"}
              className="flex items-center space-x-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{isWalletConnected ? "Wallet Connected" : "Connect Wallet"}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                $12.5M+ Raised
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Users className="w-3 h-3 mr-1" />
                15,000+ Investors
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Earn <span className="text-primary">Guaranteed Airdrops</span> from AI Crypto Projects
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Deposit Pi Network tokens and automatically receive airdrops from every successful project launch. Join
              15,000+ investors earning passive crypto income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90">
                Start Earning Airdrops <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                View Success Stories
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Post-Quantum Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Audited Smart Contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>340% Avg Returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start earning guaranteed airdrops from AI crypto projects
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">Connect your Pi Network wallet securely to our platform</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deposit Tokens</h3>
              <p className="text-muted-foreground">Stake your PI tokens in our quantum-secured smart contracts</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Airdrops</h3>
              <p className="text-muted-foreground">Automatically receive tokens from every successful project launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Start Earning Passive Crypto Income?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 15,000+ investors who are already earning guaranteed airdrops. The next project launches in 3 days -
              don't miss out.
            </p>
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Deposit Pi Tokens Now</CardTitle>
                <CardDescription>
                  Minimum deposit: 100 PI • Expected monthly airdrops: 15-25% of deposit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount (PI)</label>
                  <Input
                    type="number"
                    placeholder="Minimum 100 PI tokens"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={!isWalletConnected}
                    className="text-lg py-3"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span>Your tokens are secured by post-quantum smart contracts • Withdraw anytime</span>
                </div>
                <Button
                  onClick={handleDeposit}
                  disabled={!isWalletConnected || !depositAmount || isPaymentLoading}
                  className="w-full text-lg py-3"
                  size="lg"
                >
                  {!isWalletConnected ? "Connect Wallet to Continue" : isPaymentLoading ? "Processing…" : "Deposit & Start Earning"}
                </Button>
                {!isWalletConnected && (
                  <Button onClick={handleConnectWallet} variant="outline" className="w-full bg-transparent">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Pi Network Wallet
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {status && (
        <div className="container mx-auto px-4 pb-4">
          <p className="text-center text-sm text-muted-foreground" role="status">{status}</p>
        </div>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why 15,000+ Investors Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most secure and profitable way to invest in AI blockchain projects
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-primary/10 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Post-Quantum Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Military-grade cryptographic protection against quantum computing threats
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-primary/10 hover:border-primary/30 transition-colors">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>340% Average Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our investors earn an average of 340% returns through guaranteed airdrops
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-primary/10 hover:border-primary/30 transition-colors">
              <CardHeader>
                <Cpu className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>AI-Powered Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced AI algorithms select only the most promising projects for launch
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border-primary/10 hover:border-primary/30 transition-colors">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Guaranteed Airdrops</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatic token distributions from every successful project - no manual claiming
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deposit Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Deposit Pi Tokens</CardTitle>
                <CardDescription>
                  Stake your Pi Network tokens to participate in exclusive project launches and receive airdrops.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount (PI)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount to deposit"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={!isWalletConnected}
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Your tokens are secured by post-quantum smart contracts</span>
                </div>
                <Button
                  onClick={handleDeposit}
                  disabled={!isWalletConnected || !depositAmount}
                  className="w-full"
                  size="lg"
                >
                  {!isWalletConnected ? "Connect Wallet First" : isPaymentLoading ? "Processing…" : "Deposit Tokens"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground">
              Discover cutting-edge AI blockchain projects launching on our platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.status === "Completed" ? "default" : "secondary"}>{project.status}</Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>
                          {project.raised} / {project.target}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${(Number.parseFloat(project.raised) / Number.parseFloat(project.target)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.participants} participants</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              Real results from real investors in the Pi Network ecosystem
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-primary/10">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">π</span>
                </div>
                <span className="font-bold text-foreground">Pi Network Launchpad</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The premier platform for AI blockchain project launches in the post-quantum era.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Projects
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Wallet
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Staking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Airdrops
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Telegram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Pi Network Launchpad. All rights reserved. Built for the post-quantum future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
