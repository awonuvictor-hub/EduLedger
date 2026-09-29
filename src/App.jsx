import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  SquareUser,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  mockAuditLogs,
  mockFeeStructures,
  mockStudents,
  mockTransactions,
  mockUsers,
} from './lib/supabase';

const roleMeta = {
  admin: { label: 'Administrator', accent: 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/30', icon: ShieldCheck },
  bursar: { label: 'Bursar', accent: 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/30', icon: BriefcaseBusiness },
  parent: { label: 'Parent', accent: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30', icon: SquareUser },
};

const navSections = {
  admin: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Students', icon: Users },
    { label: 'Fee Setup', icon: Wallet },
    { label: 'Ledger', icon: FileText },
    { label: 'Audit', icon: ShieldCheck },
  ],
  bursar: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Student Registry', icon: Users },
    { label: 'Fee Setup', icon: Calculator },
    { label: 'Ledger', icon: FileText },
    { label: 'Reconciliation', icon: CheckCircle2 },
  ],
  parent: [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Children', icon: GraduationCap },
    { label: 'Bills', icon: Wallet },
    { label: 'Payments', icon: CreditCard },
  ],
};

const defaultStudentForm = {
  student_id_number: '',
  first_name: '',
  last_name: '',
  class_level: 'JHS 2',
  parent_id: 'u-parent-1',
};

const defaultFeeForm = {
  title: 'Term 1 School Fees',
  class_level: 'JHS 2',
  amount: '',
  due_date: '2026-09-25',
};

const paymentMethods = ['Bank Transfer', 'Mobile Money - MTN/Vodafone', 'Physical Cash'];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 2,
  }).format(value || 0);

const randomCode = () => `TXN-${Math.floor(10000 + Math.random() * 90000)}`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('bursar');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [students, setStudents] = useState(mockStudents);
  const [feeStructures, setFeeStructures] = useState(mockFeeStructures);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [searchText, setSearchText] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');
  const [studentForm, setStudentForm] = useState(defaultStudentForm);
  const [feeForm, setFeeForm] = useState(defaultFeeForm);
  const [paymentModal, setPaymentModal] = useState({ open: false, studentId: null, studentName: '' });
  const [receipt, setReceipt] = useState(null);
  const [paymentOption, setPaymentOption] = useState('Mobile Money - MTN/Vodafone');
  const [mobileProvider, setMobileProvider] = useState('MTN');
  const [mobileNumber, setMobileNumber] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(9650);

  const userRole = currentUser?.role || selectedRole;
  const CurrentRoleIcon = roleMeta[userRole]?.icon;

  const studentMap = useMemo(
    () =>
      students.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {}),
    [students]
  );

  const feeSummary = useMemo(() => {
    const totalExpected = feeStructures.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const totalPaid = transactions.reduce((sum, txn) => sum + Number(txn.amount_paid), 0);
    return { totalExpected, totalPaid, outstanding: totalExpected - totalPaid };
  }, [feeStructures, transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const student = studentMap[txn.student_id];
      const matchesText =
        !searchText ||
        txn.reference_code.toLowerCase().includes(searchText.toLowerCase()) ||
        `${student?.first_name ?? ''} ${student?.last_name ?? ''}`.toLowerCase().includes(searchText.toLowerCase());

      const matchesClass = filterClass === 'All' || student?.class_level === filterClass;
      const matchesMethod = filterMethod === 'All' || txn.payment_method === filterMethod;

      return matchesText && matchesClass && matchesMethod;
    });
  }, [transactions, studentMap, searchText, filterClass, filterMethod]);

  const classOptions = ['All', ...new Set(students.map((student) => student.class_level))];

  const handleLogin = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const selected = mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (selected) {
      setCurrentUser(selected);
      setSelectedRole(selected.role);
      setActiveTab('Overview');
      return;
    }

    const fallback = mockUsers.find((user) => user.role === selectedRole);
    setCurrentUser(fallback || mockUsers[0]);
  };

  const handleStudentSubmit = (event) => {
    event.preventDefault();
    const nextStudent = {
      id: `s-${Date.now()}`,
      student_id_number: studentForm.student_id_number || `STU-${Math.floor(Math.random() * 10000)}`,
      first_name: studentForm.first_name,
      last_name: studentForm.last_name,
      class_level: studentForm.class_level,
      parent_id: studentForm.parent_id,
    };

    setStudents((current) => [nextStudent, ...current]);
    setStudentForm(defaultStudentForm);
  };

  const handleFeeSubmit = (event) => {
    event.preventDefault();
    const nextFee = {
      id: `f-${Date.now()}`,
      title: feeForm.title,
      class_level: feeForm.class_level,
      amount: Number(feeForm.amount),
      due_date: feeForm.due_date,
    };

    setFeeStructures((current) => [nextFee, ...current]);
    setFeeForm(defaultFeeForm);
  };

  const handleRecordPayment = (studentId, amount) => {
    const selectedStudent = students.find((student) => student.id === studentId);
    const txnCode = randomCode();
    const txn = {
      id: `t-${Date.now()}`,
      reference_code: txnCode,
      student_id: studentId,
      amount_paid: Number(amount),
      payment_method: paymentOption,
      status: paymentOption === 'Physical Cash' ? 'reconciled' : 'successful',
      created_at: new Date().toISOString(),
    };

    setTransactions((current) => [txn, ...current]);
    setAuditLogs((current) => [
      {
        id: `a-${Date.now()}`,
        action: `${paymentOption} recorded for ${selectedStudent?.first_name ?? 'student'}`,
        user: currentUser?.name || 'System',
        timestamp: new Date().toISOString(),
        status: txn.status,
      },
      ...current,
    ]);
    setWalletBalance((balance) => balance + Number(amount));
    setReceipt({
      code: txnCode,
      amount: Number(amount),
      student: selectedStudent,
      method: paymentOption,
      date: new Date().toLocaleDateString(),
      qr: 'QR-EDULEGDER-VERIFY',
    });
    setPaymentModal({ open: false, studentId: null, studentName: '' });
    setPaymentAmount('');
    setTransactionRef('');
    setMobileNumber('');
  };

  const totalOutstanding = students.reduce((sum, student) => {
    const relevantFee = feeStructures.find((fee) => fee.class_level === student.class_level);
    const paid = transactions
      .filter((txn) => txn.student_id === student.id)
      .reduce((total, tx) => total + Number(tx.amount_paid), 0);
    return sum + Math.max(0, Number(relevantFee?.amount || 0) - paid);
  }, 0);

  const parentChildren = currentUser?.role === 'parent'
    ? students.filter((student) => student.parent_id === currentUser.id)
    : students;

  const renderOverview = () => {
    const cards = [
      { label: 'Students on roll', value: students.length.toString(), icon: Users, change: '+12%' },
      { label: 'Collections', value: formatCurrency(feeSummary.totalPaid), icon: TrendingUp, change: '+8.1%' },
      { label: 'Outstanding', value: formatCurrency(totalOutstanding), icon: Banknote, change: '-3.4%' },
      { label: 'Reconciled', value: `${transactions.filter((txn) => txn.status === 'reconciled').length}`, icon: CheckCircle2, change: '+6%' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, change }) => (
            <div key={label} className="card-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{label}</p>
                  <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
                </div>
                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-200">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-emerald-300">{change} vs last term</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="card-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="section-title">Master Financial Ledger</h3>
              <button className="btn-secondary text-xs">Export CSV</button>
            </div>

            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <label className="relative block md:w-72">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder="Search transaction"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </label>
              <select className="input-field md:w-40" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                {classOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select className="input-field md:w-48" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                <option value="All">All methods</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead className="border-b border-slate-700 text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Reference</th>
                    <th className="py-3 pr-4">Student</th>
                    <th className="py-3 pr-4">Class</th>
                    <th className="py-3 pr-4">Method</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => {
                    const student = studentMap[txn.student_id];
                    return (
                      <tr key={txn.id} className="border-b border-slate-800/80">
                        <td className="py-3 pr-4 font-medium text-white">{txn.reference_code}</td>
                        <td className="py-3 pr-4">{student ? `${student.first_name} ${student.last_name}` : 'Unknown'}</td>
                        <td className="py-3 pr-4">{student?.class_level ?? '—'}</td>
                        <td className="py-3 pr-4">{txn.payment_method}</td>
                        <td className="py-3 pr-4">{formatCurrency(txn.amount_paid)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`status-pill ${
                              txn.status === 'successful' || txn.status === 'reconciled'
                                ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-surface p-5">
              <h3 className="section-title">Automated Reconciliation</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-200">Flagged</p>
                  <p className="mt-2 text-lg font-semibold text-white">2 payment tokens need review</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">Matched</p>
                  <p className="mt-2 text-lg font-semibold text-white">18 records reconciled</p>
                </div>
              </div>
            </div>

            <div className="card-surface p-5">
              <h3 className="section-title">Instant Audit Trail</h3>
              <div className="mt-4 space-y-3">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white">{log.action}</p>
                      <span className="status-pill bg-indigo-500/10 text-indigo-100 ring-1 ring-indigo-500/20">{log.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">by {log.user}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentRegistry = () => (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
      <div className="card-surface p-5">
        <h3 className="section-title">Register new student</h3>
        <form className="mt-5 space-y-4" onSubmit={handleStudentSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Student ID number</label>
            <input
              className="input-field"
              value={studentForm.student_id_number}
              onChange={(e) => setStudentForm({ ...studentForm, student_id_number: e.target.value })}
              placeholder="STU-1012"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">First name</label>
              <input
                className="input-field"
                required
                value={studentForm.first_name}
                onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Last name</label>
              <input
                className="input-field"
                required
                value={studentForm.last_name}
                onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Class level</label>
            <select
              className="input-field"
              value={studentForm.class_level}
              onChange={(e) => setStudentForm({ ...studentForm, class_level: e.target.value })}
            >
              <option>Primary 6</option>
              <option>JHS 2</option>
              <option>SHS 1</option>
              <option>SHS 2</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Parent account</label>
            <select
              className="input-field"
              value={studentForm.parent_id}
              onChange={(e) => setStudentForm({ ...studentForm, parent_id: e.target.value })}
            >
              {mockUsers.filter((user) => user.role === 'parent').map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary w-full">
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </form>
      </div>

      <div className="card-surface p-5">
        <h3 className="section-title">Student directory</h3>
        <div className="mt-5 space-y-3">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <div>
                <p className="font-semibold text-white">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-sm text-slate-400">ID: {student.student_id_number} • {student.class_level}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="status-pill bg-indigo-500/10 text-indigo-100 ring-1 ring-indigo-500/20">Linked</span>
                <button
                  className="btn-secondary px-3 py-2 text-xs"
                  onClick={() => setPaymentModal({ open: true, studentId: student.id, studentName: `${student.first_name} ${student.last_name}` })}
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFeeSetup = () => (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="card-surface p-5">
        <h3 className="section-title">Create fee structure</h3>
        <form className="mt-5 space-y-4" onSubmit={handleFeeSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Title</label>
            <input
              className="input-field"
              value={feeForm.title}
              onChange={(e) => setFeeForm({ ...feeForm, title: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Class level</label>
            <select
              className="input-field"
              value={feeForm.class_level}
              onChange={(e) => setFeeForm({ ...feeForm, class_level: e.target.value })}
            >
              <option>Primary 6</option>
              <option>JHS 2</option>
              <option>SHS 1</option>
              <option>SHS 2</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Amount</label>
            <input
              type="number"
              className="input-field"
              value={feeForm.amount}
              onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Due date</label>
            <input
              type="date"
              className="input-field"
              value={feeForm.due_date}
              onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            <Wallet className="h-4 w-4" /> Save fee setup
          </button>
        </form>
      </div>

      <div className="card-surface p-5">
        <h3 className="section-title">Fee catalog</h3>
        <div className="mt-5 space-y-3">
          {feeStructures.map((fee) => (
            <div key={fee.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <div>
                <p className="font-semibold text-white">{fee.title}</p>
                <p className="text-sm text-slate-400">{fee.class_level} • Due {new Date(fee.due_date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-300">{formatCurrency(fee.amount)}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParentOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-surface p-5">
          <p className="text-sm text-slate-400">Total outstanding</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{formatCurrency(totalOutstanding)}</h3>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-slate-400">Active bills</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{parentChildren.length}</h3>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm text-slate-400">Amount paid</p>
          <h3 className="mt-3 text-3xl font-bold text-white">{formatCurrency(feeSummary.totalPaid)}</h3>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {parentChildren.map((student) => {
          const fee = feeStructures.find((entry) => entry.class_level === student.class_level);
          const paid = transactions
            .filter((txn) => txn.student_id === student.id)
            .reduce((sum, txn) => sum + Number(txn.amount_paid), 0);
          const balance = Math.max(0, Number(fee?.amount || 0) - paid);

          return (
            <div key={student.id} className="card-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">Child account</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {student.first_name} {student.last_name}
                  </h3>
                </div>
                <span className="status-pill bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30">
                  {student.class_level}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Expected fee</span>
                  <span>{fee ? formatCurrency(fee.amount) : '—'}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Paid to date</span>
                  <span>{formatCurrency(paid)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Outstanding</span>
                  <span className="font-semibold text-amber-200">{formatCurrency(balance)}</span>
                </div>
              </div>

              <button
                className="btn-primary mt-5 w-full"
                onClick={() => setPaymentModal({ open: true, studentId: student.id, studentName: `${student.first_name} ${student.last_name}` })}
              >
                <CreditCard className="h-4 w-4" /> Pay now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPaymentModal = () => (
    <div className={`fixed inset-0 z-50 ${paymentModal.open ? 'flex' : 'hidden'} items-center justify-center bg-slate-950/80 p-4`}>
      <div className="card-surface w-full max-w-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Payment hub</p>
            <h3 className="text-2xl font-bold text-white">{paymentModal.studentName}</h3>
          </div>
          <button
            className="rounded-xl bg-slate-800 p-2 text-slate-200"
            onClick={() => setPaymentModal({ open: false, studentId: null, studentName: '' })}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Payment method</label>
              <select
                className="input-field"
                value={paymentOption}
                onChange={(e) => setPaymentOption(e.target.value)}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">Amount to pay</label>
              <input
                type="number"
                className="input-field"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="2500"
              />
            </div>

            {paymentOption === 'Mobile Money - MTN/Vodafone' && (
              <>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Network</label>
                  <select
                    className="input-field"
                    value={mobileProvider}
                    onChange={(e) => setMobileProvider(e.target.value)}
                  >
                    <option>MTN</option>
                    <option>Vodafone/Telecel</option>
                    <option>AirtelTigo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">Phone number</label>
                  <input
                    className="input-field"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="024 123 4567"
                  />
                </div>
              </>
            )}

            {paymentOption === 'Bank Transfer' && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">Bank teller/receipt number</label>
                <input
                  className="input-field"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="BANK-90324"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-200">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Secure authorization</p>
                <p className="font-semibold text-white">Transaction review</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Channel</span>
                <span>{paymentOption}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Network</span>
                <span>{paymentOption === 'Mobile Money - MTN/Vodafone' ? mobileProvider : '—'}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Reference</span>
                <span>{transactionRef || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Amount</span>
                <span>{formatCurrency(Number(paymentAmount || 0))}</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-indigo-100">
              Authorization confirmed — new transaction will be assigned automatically and the live ledger will update instantly.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="btn-secondary"
            onClick={() => setPaymentModal({ open: false, studentId: null, studentName: '' })}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => handleRecordPayment(paymentModal.studentId, paymentAmount || 0)}
          >
            Authorize payment
          </button>
        </div>
      </div>
    </div>
  );

  const renderReceipt = () => {
    if (!receipt) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-4">
        <div className="card-surface w-full max-w-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400">Digital receipt</p>
              <h3 className="text-2xl font-bold text-white">{receipt.code}</h3>
            </div>
            <button className="rounded-xl bg-slate-800 p-2 text-slate-200" onClick={() => setReceipt(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Student</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {receipt.student?.first_name} {receipt.student?.last_name}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-200">
                <Receipt className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between"><span>Amount paid</span><span>{formatCurrency(receipt.amount)}</span></div>
              <div className="flex justify-between"><span>Method</span><span>{receipt.method}</span></div>
              <div className="flex justify-between"><span>Verified</span><span>{receipt.qr}</span></div>
              <div className="flex justify-between"><span>Issued on</span><span>{receipt.date}</span></div>
            </div>

            <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-5">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white text-center text-[10px] font-bold text-slate-900">
                QR CODE
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary">Download PDF</button>
            <button className="btn-primary">Send to parent</button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (userRole === 'parent') return renderParentOverview();

    switch (activeTab) {
      case 'Students':
      case 'Student Registry':
        return renderStudentRegistry();
      case 'Fee Setup':
        return renderFeeSetup();
      case 'Ledger':
        return renderOverview();
      case 'Audit':
      case 'Reconciliation':
        return renderOverview();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {!currentUser ? (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="card-surface w-full max-w-md p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-200">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Finance Suite</p>
                <h1 className="text-2xl font-bold text-white">EduLedger</h1>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  className="input-field"
                  name="email"
                  type="email"
                  placeholder="name@school.edu"
                  defaultValue="bursar@edulegder.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Access role</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(roleMeta).map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        selectedRole === role
                          ? 'border-indigo-400 bg-indigo-500/10 text-indigo-100'
                          : 'border-slate-700 bg-slate-900/70 text-slate-300'
                      }`}
                      onClick={() => setSelectedRole(role)}
                    >
                      {roleMeta[role].label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <aside
            className={`${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-slate-950/90 p-5 backdrop-blur-xl transition md:translate-x-0`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/10 p-2 text-indigo-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">EduLedger</p>
                  <h2 className="text-lg font-bold text-white">School Portal</h2>
                </div>
              </div>
              <button className="rounded-lg bg-slate-800 p-2 text-slate-200 md:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className={`mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 ${roleMeta[userRole].accent}`}>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-900/40 p-2">
                  {CurrentRoleIcon ? <CurrentRoleIcon className="h-5 w-5" /> : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-200">{roleMeta[userRole].label}</p>
                </div>
              </div>
            </div>

            <nav className="mt-8 space-y-2">
              {(navSections[userRole] || navSections.admin).map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.label);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-link w-full ${activeTab === item.label ? 'active' : ''}`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                </button>
              ))}
            </nav>

            <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Wallet</p>
              <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(walletBalance)}</p>
            </div>

            <button className="btn-secondary mt-10 w-full" onClick={() => setCurrentUser(null)}>
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </aside>

          <main className="flex-1 md:ml-72">
            <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur-xl md:px-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button className="rounded-xl bg-slate-800 p-2 text-slate-200 md:hidden" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</p>
                    <h1 className="text-xl font-bold text-white">{activeTab}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="rounded-xl bg-slate-800 p-2 text-slate-200">
                    <Bell className="h-4 w-4" />
                  </button>
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Role</p>
                    <p className="text-sm font-semibold text-white">{roleMeta[userRole].label}</p>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-4 md:p-6">{renderContent()}</div>
          </main>
        </div>
      )}

      {renderPaymentModal()}
      {renderReceipt()}
    </div>
  );
}

export default App;
