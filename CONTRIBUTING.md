# Contributing to Qmoosa Pi

Thank you for your interest in contributing to **Qmoosa Pi**! We welcome contributions from Pioneers, open-source developers, cryptographers, and autonomous machine agent builders.

---

## 🌟 How Can You Contribute?

1. **Bug Reports**: Open an issue if you encounter unexpected behavior or broken links.
2. **Feature Requests**: Propose enhancements for Conway Automaton simulations, x402 settlement, or Pi SDK integrations.
3. **Code Contributions**: Submit Pull Requests for bug fixes, test improvements, or feature enhancements.
4. **Documentation**: Improve whitepaper explanations, marketing strategies, or API reference guides.

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/elon00/qmoosa-pi.git
   cd qmoosa-pi
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm run dev
   ```

4. **Verify release readiness doctor:**
   ```bash
   node scripts/qmoosa-doctor.js
   ```

5. **Run tests:**
   ```bash
   pnpm exec tsc --noEmit
   npm --prefix backend test
   ```

---

## 📜 Pull Request Guidelines

1. Fork the repo and create a descriptive branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit with clear, concise messages conforming to Conventional Commits:
   - `feat:` for new capabilities
   - `fix:` for bug fixes
   - `docs:` for documentation updates
   - `chore:` for tooling and maintenance
3. Ensure CI hygiene checks pass:
   - No tracked `.env`, `.pem`, or `.key` secret files.
   - No fabricated claims or deceptive guarantees.
4. Submit your PR against `main`.

---

## 🔒 Security Vulnerabilities

Please do not report security vulnerabilities via public GitHub issues. See our [SECURITY.md](./SECURITY.md) for instructions on confidential disclosure.
