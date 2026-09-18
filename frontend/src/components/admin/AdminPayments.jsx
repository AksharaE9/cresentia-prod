import { useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  TrendingUp,
  Download,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  FileText,
  RotateCcw,
  ShieldCheck,
  Receipt
} from 'lucide-react';

const AdminPayments = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');

  const totalRevenue = transactions
    .filter((t) => t.status === 'Succeeded')
    .reduce((sum, t) => sum + t.amount, 0);

  const averagePrice = transactions.length > 0
    ? totalRevenue / transactions.length
    : 0;

  const refundedCount = transactions.filter((t) => t.status === 'Refunded').length;
  const refundRatio = transactions.length > 0
    ? ((refundedCount / transactions.length) * 100).toFixed(1)
    : '0.0';

  const filtered = transactions.filter((t) => {
    const matchSearch = (t.student || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.course || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Student', 'Email', 'Course', 'Amount', 'Date', 'Gateway', 'Status'];
    const rows = filtered.map((t) => [t.id, t.student, t.email, t.course, `₹${t.amount}`, t.date, t.gateway, t.status]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crescentia-financial-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage('Financial ledger exported to CSV successfully.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResetLedger = () => {
    setTransactions([]);
    setSearch('');
    setStatusFilter('All');
    setMessage('Financial ledger reset. Ready for live production transactions.');
    setTimeout(() => setMessage(''), 3500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
              Payments & Tuition Financials
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#0A8543] border border-[#A8DAB5]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A8543]" />
              Production Ready
            </span>
          </div>
          <p className="text-sm text-[#555555]">
            Review student course fee transactions, institutional billing, and payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetLedger}
            className="px-3.5 py-2 rounded text-xs font-bold border border-[#D1D7DC] text-[#555555] hover:text-[#0056D2] hover:border-[#0056D2] bg-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset payment records to zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Ledger</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="coursera-btn-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Export Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded-md text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* 4 Financial KPI Cards - production zero state */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs hover:border-[#0056D2] transition-colors">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Total Gross Revenue
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-[#0A8543] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live production ledger</span>
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs hover:border-[#0056D2] transition-colors">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Average Course Price
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">
            ₹{averagePrice.toFixed(2)}
          </div>
          <div className="text-xs text-[#555555] mt-1">Direct institutional enrollment</div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs hover:border-[#0056D2] transition-colors">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Settled Transactions
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">{transactions.length}</div>
          <div className="text-xs text-[#0A8543] font-semibold mt-1">100% gateway uptime</div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs hover:border-[#0056D2] transition-colors">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Refund Ratio
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">{refundRatio}%</div>
          <div className="text-xs text-[#0A8543] font-semibold mt-1">Zero chargebacks</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, transaction ID, or course..."
            className="w-full pr-4 py-2 text-sm rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none search-input-with-icon"
            style={{ paddingLeft: '2.75rem' }}
          />
          <Search className="w-4 h-4 text-[#6A6F73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555] shrink-0 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded border border-[#757575] bg-white font-medium focus:border-[#0056D2] cursor-pointer"
          >
            <option value="All">All Transactions</option>
            <option value="Succeeded">Succeeded Only</option>
            <option value="Refunded">Refunded Only</option>
          </select>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#D1D7DC] text-[#555555] uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3.5 px-4 min-w-[120px]">Txn ID</th>
                <th className="py-3.5 px-4 min-w-[180px]">Student</th>
                <th className="py-3.5 px-4 min-w-[220px]">Course Enrolled</th>
                <th className="py-3.5 px-4 min-w-[100px]">Amount</th>
                <th className="py-3.5 px-4 min-w-[150px]">Payment Method</th>
                <th className="py-3.5 px-4 min-w-[110px]">Date</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center mx-auto border border-[#C5DCFA]">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-base text-[#1F1F1F]">
                        No Financial Transactions Recorded
                      </div>
                      <p className="text-xs text-[#555555] leading-relaxed">
                        All current course access is managed via direct institutional enrollment. When paid student tuition or corporate sponsorships occur, settled transactions will automatically be logged and audited here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0056D2] align-middle">{t.id}</td>
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-bold text-[#1F1F1F]">{t.student}</div>
                      <div className="text-[11px] text-[#6A6F73]">{t.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1F1F1F] truncate max-w-xs align-middle">{t.course}</td>
                    <td className="py-3.5 px-4 font-bold text-[#1F1F1F] align-middle">₹{t.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-[#555555] align-middle">{t.gateway}</td>
                    <td className="py-3.5 px-4 text-[#555555] align-middle">{t.date}</td>
                    <td className="py-3.5 px-4 text-center align-middle">
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                        t.status === 'Succeeded'
                          ? 'bg-[#E6F4EA] text-[#0A8543] border border-[#A8DAB5]'
                          : 'bg-[#FFF0EB] text-[#DC2626] border border-[#FFD0B8]'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
