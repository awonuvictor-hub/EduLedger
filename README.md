# EduLedger

Modern full-stack school fee payment and financial administration system built with React, Tailwind CSS, Lucide icons, and Supabase-ready schema.

## Features
- Role-based dashboards for admin, bursar, and parent
- Student registration and fee structure setup
- Master ledger with search and filtering
- Multi-channel payment flows: mobile money, bank transfer, and cash reconciliation
- Automated reconciliation indicators and instant audit trail
- Digital receipts with QR-style verification panel
- Fully responsive, indigo/slate UI

## Local setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env` file with Supabase values
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the app
   ```bash
   npm run dev
   ```

## Demo credentials
- Admin: admin@edulegder.com
- Bursar: bursar@edulegder.com
- Parent: parent@edulegder.com
- Password: password123

## Supabase schema
The database schema is included in `supabase/schema.sql`.
