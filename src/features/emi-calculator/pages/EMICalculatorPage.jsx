import { useState, useMemo } from 'react';
import { Landmark, ArrowRight, Info } from 'lucide-react';
import { PATHS, LIMITS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { Link } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * EMI CALCULATOR PAGE
 * Implements standard EMI calculations and generates a 
 * month-by-month amortization schedule optimized using useMemo.
 * Refactored layout to place calculator parameters and results on top,
 * and the schedule table below.
 * ============================================================
 */
export default function EMICalculatorPage() {
  const [inputs, setInputs] = useState({
    amount: 1000000, // Default: ₹10 Lakhs
    tenureYears: 5,  // Default: 5 Years
    interestRate: 8.5, // Default: 8.5%
  });

  const [schedulePage, setSchedulePage] = useState(1);
  const rowsPerPage = 12; // Show one year of schedule at a time

  // --- Dynamic Input Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let numericValue = parseFloat(value) || 0;

    // Enforce limits to keep inputs within logical bounds
    if (id === 'amount') {
      numericValue = Math.min(numericValue, LIMITS.MAX_LOAN_AMOUNT);
    } else if (id === 'tenureYears') {
      numericValue = Math.min(numericValue, LIMITS.MAX_TENURE_MONTHS / 12);
    } else if (id === 'interestRate') {
      numericValue = Math.min(numericValue, 30); // Cap interest rate at 30% for safety
    }

    setInputs((prev) => ({
      ...prev,
      [id]: numericValue,
    }));
    setSchedulePage(1); // Reset page on input change
  };

  const handleSliderChange = (e) => {
    const { id, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [id]: parseFloat(value),
    }));
    setSchedulePage(1);
  };

  // --- 🛠️ Core EMI Calculations (Optimized using useMemo) ---
  const calculationResults = useMemo(() => {
    const P = inputs.amount;
    const annualRate = inputs.interestRate;
    const N = inputs.tenureYears * 12; // Total months

    if (P <= 0 || annualRate <= 0 || N <= 0) {
      return { emi: 0, totalInterest: 0, totalPayable: 0, schedule: [] };
    }

    // Monthly interest rate formula
    const r = annualRate / 12 / 100;

    // Standard EMI formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const totalPayable = emi * N;
    const totalInterest = totalPayable - P;

    // Generate Month-by-Month Amortization Schedule
    const schedule = [];
    let outstandingBalance = P;

    for (let month = 1; month <= N; month++) {
      const interestComponent = outstandingBalance * r;
      const principalComponent = emi - interestComponent;
      outstandingBalance = Math.max(0, outstandingBalance - principalComponent);

      schedule.push({
        month,
        emi,
        interest: interestComponent,
        principal: principalComponent,
        balance: outstandingBalance,
      });
    }

    return {
      emi,
      totalInterest,
      totalPayable,
      schedule,
    };
  }, [inputs.amount, inputs.tenureYears, inputs.interestRate]); // Only recompute if inputs change

  const { emi, totalInterest, totalPayable, schedule } = calculationResults;

  // Pagination for the schedule table
  const paginatedSchedule = useMemo(() => {
    const startIndex = (schedulePage - 1) * rowsPerPage;
    return schedule.slice(startIndex, startIndex + rowsPerPage);
  }, [schedule, schedulePage]);

  const totalPages = Math.ceil(schedule.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Headings */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive EMI Calculator
          </h1>
          <p className="text-md sm:text-lg text-slate-400">
            Configure your loan parameters to instantly estimate monthly repayments and check the full amortization schedule.
          </p>
        </div>

        {/* 1. TOP SECTION: Calculator parameters & Results Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT: Sliders & Form Controls (7 columns) */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-500" />
              Calculator Parameters
            </h2>

            {/* A. Loan Amount Configuration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Loan Amount</span>
                <span className="text-md font-bold text-blue-400">{formatCurrency(inputs.amount, false)}</span>
              </div>
              <input
                type="range"
                id="amount"
                min={LIMITS.MIN_LOAN_AMOUNT}
                max={LIMITS.MAX_LOAN_AMOUNT}
                step={50000}
                value={inputs.amount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
              <Input
                id="amount"
                type="number"
                value={inputs.amount || ''}
                onChange={handleInputChange}
                className="h-10 mt-1"
                placeholder="Enter custom loan amount"
              />
            </div>

            {/* B. Interest Rate Configuration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Interest Rate (P.A.)</span>
                <span className="text-md font-bold text-blue-400">{inputs.interestRate}%</span>
              </div>
              <input
                type="range"
                id="interestRate"
                min={5}
                max={25}
                step={0.1}
                value={inputs.interestRate}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
              <Input
                id="interestRate"
                type="number"
                step="0.1"
                value={inputs.interestRate || ''}
                onChange={handleInputChange}
                className="h-10 mt-1"
                placeholder="Enter custom interest rate"
              />
            </div>

            {/* C. Loan Tenure Configuration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">Tenure (Years)</span>
                <span className="text-md font-bold text-blue-400">{inputs.tenureYears} Years</span>
              </div>
              <input
                type="range"
                id="tenureYears"
                min={1}
                max={30}
                step={1}
                value={inputs.tenureYears}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
              />
              <Input
                id="tenureYears"
                type="number"
                value={inputs.tenureYears || ''}
                onChange={handleInputChange}
                className="h-10 mt-1"
                placeholder="Enter custom tenure in years"
              />
            </div>
          </div>

          {/* RIGHT: Results display (5 columns) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-900 p-6 rounded-2xl flex flex-col justify-center space-y-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />

            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              Estimated Repayments
            </h2>

            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly EMI Outgoings</span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  {formatCurrency(emi)}
                </h3>
              </div>

              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Interest Payable</span>
                <h3 className="text-2xl font-extrabold text-blue-400 mt-1">
                  {formatCurrency(totalInterest)}
                </h3>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Principal + Interest</span>
                <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {formatCurrency(totalPayable)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BOTTOM SECTION: Amortization Schedule Table & CTA */}
        <div className="space-y-6">
          {/* Amortization Table */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-blue-400" />
              Amortization Payment Schedule
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-400">Month</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Principal</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Interest</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Total EMI</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-400">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-900/20">
                  {paginatedSchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-300">Month {row.month}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{formatCurrency(row.principal)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{formatCurrency(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-200">{formatCurrency(row.emi)}</td>
                      <td className="px-4 py-3 text-right text-blue-400 font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Showing Year {schedulePage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={schedulePage === 1}
                    onClick={() => setSchedulePage((p) => p - 1)}
                  >
                    Prev Year
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={schedulePage === totalPages}
                    onClick={() => setSchedulePage((p) => p + 1)}
                  >
                    Next Year
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Apply CTA Banner */}
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-300 text-center md:text-left">
              Happy with the rates? Apply for a loan digital account onboarding in 10 minutes.
            </p>
            <Link to={PATHS.REGISTER}>
              <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                Apply Now
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
