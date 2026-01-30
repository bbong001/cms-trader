# Trader CMS

Content Management System for managing all database tables in the Trader project.

## Setup

1. Install dependencies:
```bash
cd cms
npm install
```

2. Set up Prisma schema:
```bash
# Option 1: Copy the schema from parent project
cp ../prisma/schema.prisma ./prisma/schema.prisma

# Option 2: Create a symlink (Windows may require admin)
# ln -s ../prisma/schema.prisma ./prisma/schema.prisma

# Then generate Prisma Client
npx prisma generate
```

Note: The CMS uses the same database as the parent project, so make sure the schema is in sync.

4. Set up environment variables:
```bash
# Create .env file in cms/ directory (or use parent's .env)
# DATABASE_URL should point to the same database as the parent project
```

5. Run the CMS:
```bash
npm run dev
```

The CMS will be available at `http://localhost:4322`

## Features

- **Dashboard**: Overview statistics
- **Users**: Manage users and view their details
- **Wallets**: View and manage user wallets
- **Spot Orders**: View and manage trading orders
- **Trade Fills**: View trade execution history
- **Contract Positions**: Manage contract positions
- **IEO Products**: Create and manage IEO products
- **IEO Investments**: View IEO investments
- **Mining Products**: Create and manage mining products
- **Mining Investments**: View mining investments
- **Withdrawal Requests**: Manage withdrawal requests
- **Transfers**: View transfer history
- **Exchange Transactions**: View exchange transaction history

## API Endpoints

All API endpoints are located in `src/pages/api/`:
- `/api/users/*` - User management
- `/api/wallets/*` - Wallet management
- `/api/spot-orders/*` - Spot order management
- `/api/trade-fills/*` - Trade fill listing
- `/api/contract-positions/*` - Contract position management
- `/api/ieo-products/*` - IEO product management
- `/api/ieo-investments/*` - IEO investment listing
- `/api/mining-products/*` - Mining product management
- `/api/mining-investments/*` - Mining investment listing
- `/api/withdrawal-requests/*` - Withdrawal request management
- `/api/transfers/*` - Transfer listing
- `/api/exchange-transactions/*` - Exchange transaction listing

