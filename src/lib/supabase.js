import { createClient } from '@supabase/supabase-js';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export const mockUsers = [
  {
    id: 'u-admin-1',
    name: 'Alex Morgan',
    email: 'admin@edulegder.com',
    role: 'admin',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-bursar-1',
    name: 'Nia Boateng',
    email: 'bursar@edulegder.com',
    role: 'bursar',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-parent-1',
    name: 'Kwame Adjei',
    email: 'parent@edulegder.com',
    role: 'parent',
    created_at: new Date().toISOString(),
  },
];

export const mockStudents = [
  {
    id: 's-1',
    student_id_number: 'STU-1042',
    first_name: 'Ama',
    last_name: 'Boateng',
    class_level: 'JHS 2',
    parent_id: 'u-parent-1',
  },
  {
    id: 's-2',
    student_id_number: 'STU-2049',
    first_name: 'Kojo',
    last_name: 'Adjei',
    class_level: 'SHS 1',
    parent_id: 'u-parent-1',
  },
  {
    id: 's-3',
    student_id_number: 'STU-3008',
    first_name: 'Efua',
    last_name: 'Mensah',
    class_level: 'Primary 6',
    parent_id: 'u-parent-1',
  },
];

export const mockFeeStructures = [
  {
    id: 'f-1',
    title: 'Term 1 School Fees',
    class_level: 'JHS 2',
    amount: 620,
    due_date: '2026-09-25',
  },
  {
    id: 'f-2',
    title: 'Term 1 School Fees',
    class_level: 'SHS 1',
    amount: 760,
    due_date: '2026-09-25',
  },
  {
    id: 'f-3',
    title: 'Term 1 School Fees',
    class_level: 'Primary 6',
    amount: 510,
    due_date: '2026-09-25',
  },
];

export const mockTransactions = [
  {
    id: 't-1',
    reference_code: 'TXN-94821',
    student_id: 's-1',
    amount_paid: 620,
    payment_method: 'Mobile Money - MTN/Vodafone',
    status: 'successful',
    created_at: '2026-09-15T09:12:00.000Z',
  },
  {
    id: 't-2',
    reference_code: 'TXN-33542',
    student_id: 's-2',
    amount_paid: 300,
    payment_method: 'Bank Transfer',
    status: 'pending',
    created_at: '2026-09-20T13:40:00.000Z',
  },
  {
    id: 't-3',
    reference_code: 'TXN-88014',
    student_id: 's-3',
    amount_paid: 180,
    payment_method: 'Physical Cash',
    status: 'reconciled',
    created_at: '2026-09-18T11:15:00.000Z',
  },
];

export const mockAuditLogs = [
  {
    id: 'a-1',
    action: 'Approved mobile money payment',
    user: 'Nia Boateng',
    timestamp: '2026-09-15T09:32:00.000Z',
    status: 'successful',
  },
  {
    id: 'a-2',
    action: 'Matched bank deposit receipt',
    user: 'Alex Morgan',
    timestamp: '2026-09-20T14:00:00.000Z',
    status: 'pending',
  },
  {
    id: 'a-3',
    action: 'Logged physical cash reconciliation',
    user: 'Nia Boateng',
    timestamp: '2026-09-18T11:26:00.000Z',
    status: 'reconciled',
  },
];
