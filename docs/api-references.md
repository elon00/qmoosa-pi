# API Reference

## Pi-Network-Launchpad Backend API

Base URL: `https://api.pi-network-launchpad.com`

## Authentication

All API requests require authentication via Pi wallet.

### Headers
```
Authorization: Bearer <pi-auth-token>
Content-Type: application/json

## Endpoints

### Authentication

#### POST /api/auth/pi
Authenticate with Pi wallet.

**Request Body:**
```json
{
  "scopes": ["username", "payments"],
  "onIncompletePaymentFound": "function"
}
```

**Response:**
```json
{
  "access_token": "string",
  "user": {
    "uid": "string",
    "username": "string"
  }
}
```

#### GET /api/auth/verify
Verify authentication token.

**Response:**
```json
{
  "valid": true,
  "user": {
    "uid": "string",
    "username": "string"
  }
}
```

### Deposits

#### POST /api/deposits
Create a new deposit.

**Request Body:**
```json
{
  "amount": 1000,
  "token": "PNL"
}
```

**Response:**
```json
{
  "deposit_id": "string",
  "tx_hash": "string",
  "status": "pending"
}
```

#### GET /api/deposits/:userId
Get user deposits.

**Response:**
```json
{
  "deposits": [
    {
      "id": "string",
      "amount": 1000,
      "token": "PNL",
      "status": "confirmed",
      "tx_hash": "string",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Projects

#### GET /api/projects
List all projects.

**Query Parameters:**
- `category`: Filter by category (ai, crypto, post-quantum)
- `status`: Filter by status (upcoming, active, completed)
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "projects": [
    {
      "id": "string",
      "name": "AI Project 1",
      "description": "Revolutionary AI for crypto analysis",
      "category": "ai",
      "status": "upcoming",
      "target_raise": 1000000,
      "current_raise": 500000,
      "start_date": "2024-02-01T00:00:00Z",
      "end_date": "2024-02-28T00:00:00Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

#### GET /api/projects/:id
Get project details.

**Response:**
```json
{
  "id": "string",
  "name": "AI Project 1",
  "description": "Detailed description",
  "category": "ai",
  "status": "upcoming",
  "target_raise": 1000000,
  "current_raise": 500000,
  "start_date": "2024-02-01T00:00:00Z",
  "end_date": "2024-02-28T00:00:00Z",
  "team": [
    {
      "name": "John Doe",
      "role": "CEO",
      "linkedin": "https://linkedin.com/in/johndoe"
    }
  ],
  "documents": [
    {
      "type": "whitepaper",
      "url": "https://ipfs.io/ipfs/Qm..."
    }
  ]
}
```

#### POST /api/projects
Create a new project (Admin only).

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "category": "crypto",
  "target_raise": 500000,
  "start_date": "2024-03-01T00:00:00Z",
  "end_date": "2024-03-31T00:00:00Z"
}
```

### Airdrops

#### POST /api/airdrops
Trigger airdrop distribution (Admin only).

**Request Body:**
```json
{
  "project_id": "string",
  "recipients": ["user1", "user2"],
  "amount_per_recipient": 100,
  "token": "PNL"
}
```

**Response:**
```json
{
  "airdrop_id": "string",
  "tx_hash": "string",
  "status": "processing"
}
```

#### GET /api/airdrops/:userId
Get user airdrop history.

**Response:**
```json
{
  "airdrops": [
    {
      "id": "string",
      "project_name": "AI Project 1",
      "amount": 100,
      "token": "PNL",
      "status": "completed",
      "tx_hash": "string",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### User Dashboard

#### GET /api/dashboard/:userId
Get user dashboard data.

**Response:**
```json
{
  "user": {
    "uid": "string",
    "username": "string",
    "wallet_address": "string"
  },
  "deposits": {
    "total": 5000,
    "count": 5
  },
  "airdrops": {
    "total_received": 1000,
    "count": 10
  },
  "eligibility": {
    "status": "eligible",
    "next_airdrop": "2024-02-01T00:00:00Z"
  }
}
```

## Error Responses

All endpoints may return the following error formats:

**400 Bad Request:**
```json
{
  "error": "Invalid request parameters",
  "details": "Amount must be greater than 0"
}
```

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

## Webhooks

The API supports webhooks for real-time updates:

### Deposit Webhook
```
POST https://your-app.com/webhooks/deposit
```

**Payload:**
```json
{
  "event": "deposit.confirmed",
  "deposit_id": "string",
  "user_id": "string",
  "amount": 1000,
  "tx_hash": "string"
}
```

### Airdrop Webhook
```
POST https://your-app.com/webhooks/airdrop
```

**Payload:**
```json
{
  "event": "airdrop.distributed",
  "airdrop_id": "string",
  "recipients": ["user1", "user2"],
  "amount_per_recipient": 100
}
```

## SDK Integration

### JavaScript SDK

```javascript
import { PiNetworkLaunchpad } from '@pi-network/launchpad-sdk';

const client = new PiNetworkLaunchpad({
  apiKey: 'your-api-key'
});

// Authenticate
const auth = await client.authenticate();

// Create deposit
const deposit = await client.createDeposit({
  amount: 1000,
  token: 'PNL'
});
```

### React Hook

```javascript
import { usePiLaunchpad } from '@pi-network/launchpad-react';

function MyComponent() {
  const { user, deposits, createDeposit } = usePiLaunchpad();

  const handleDeposit = async () => {
    await createDeposit(1000);
  };

  return (
    <div>
      <p>User: {user?.username}</p>
      <button onClick={handleDeposit}>Deposit 1000 PNL</button>
    </div>
  );
}