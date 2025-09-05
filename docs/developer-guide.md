# Developer Guide

## Pi-Network-Launchpad

This guide provides detailed instructions for developers working on the Pi-Network-Launchpad project.

## Architecture Overview

The project follows a modular architecture with clear separation of concerns:

- **Frontend**: React-based user interface
- **Backend**: Node.js API server
- **Smart Contracts**: Rust-based contracts on Pi Network
- **AI Layer**: Python-based machine learning models
- **Database**: PostgreSQL with IPFS integration

## Development Setup

### Prerequisites

- Node.js 16 or higher
- Rust 1.60 or higher
- Python 3.8 or higher
- PostgreSQL 12 or higher

### Environment Setup

1. **Clone the repository**
    ```bash
    git clone https://github.com/pi-network/pi-network-launchpad.git
    cd pi-network-launchpad
    ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Smart Contracts Setup**
   ```bash
   cd contracts
   cargo build
   ```

5. **AI Layer Setup**
   ```bash
   cd ai
   pip install -r requirements.txt
   ```

## Development Guidelines

### Code Style

- **JavaScript/TypeScript**: Follow ESLint configuration
- **Rust**: Follow standard Rust formatting (`cargo fmt`)
- **Python**: Follow PEP 8 standards

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `hotfix/*`: Bug fixes

### Commit Messages

Follow conventional commit format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Testing
- `chore:` Maintenance

## API Documentation

### Backend Endpoints

#### Authentication
- `POST /api/auth/pi` - Pi wallet authentication
- `GET /api/auth/verify` - Verify authentication

#### Deposits
- `POST /api/deposits` - Create deposit
- `GET /api/deposits/:userId` - Get user deposits

#### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (admin)
- `GET /api/projects/:id` - Get project details

#### Airdrops
- `POST /api/airdrops` - Trigger airdrop (admin)
- `GET /api/airdrops/:userId` - Get user airdrops

## Smart Contract Development

### Contract Structure

```rust
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contract]
pub struct LaunchpadContract;

#[contractimpl]
impl LaunchpadContract {
    pub fn deposit(env: Env, user: Address, amount: i128) {
        // Implementation
    }
}
```

### Testing Contracts

```bash
cd contracts
cargo test
```

### Deployment

Contracts are deployed to Pi Network testnet/mainnet using Soroban CLI.

## Frontend Development

### Component Structure

```
src/
├── components/
│   ├── WalletConnect.tsx
│   ├── ProjectList.tsx
│   └── UserDashboard.tsx
├── hooks/
│   ├── useWallet.ts
│   └── useDeposits.ts
├── utils/
│   └── api.ts
└── App.tsx
```

### State Management

Use React hooks for local state management. For complex state, consider Zustand or Redux.

## Security Considerations

### Post-Quantum Cryptography

- Use Kyber for key exchange
- Implement NTRU for digital signatures
- Hybrid RSA + lattice-based encryption

### Smart Contract Security

- Reentrancy protection
- Access control
- Input validation
- Gas optimization

## Testing

### Unit Tests

```bash
# Frontend
cd frontend && npm test

# Backend
cd backend && npm test

# Contracts
cd contracts && cargo test
```

### Integration Tests

Use Cypress for end-to-end testing.

## Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy build/ to hosting service
```

### Backend
```bash
cd backend
npm run build
# Deploy to server
```

### Smart Contracts
```bash
soroban contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/pi_launchpad_contract.wasm \
  --source <your-account> \
  --network testnet
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For questions or issues:
- GitHub Issues
- Developer Discord
- Email: support@pi-network-launchpad.com