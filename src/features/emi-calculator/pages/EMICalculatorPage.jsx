import { useState, useMemo } from 'react';
import { Landmark, ArrowRight, Info } from 'lucide-react';
import { PATHS, LIMITS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';
import { Link } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/**
 * ============================================================
 * EMI CALCULATOR PAGE (LIGHT THEME)
 * Interactive EMI calculations & month-by-month schedule.
 * ============================================================
 */
export default function EMICalculatorPage() {
  const [inputs, setInputs] = useState({
    amount: 1000000,
    tenureYears: 5,
    interestRate: 8.5,
  });

  const [schedulePage, setSchedulePage] = useState(1);
  const rowsPerPage = 12;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let numericValue = parseFloat(value) || 0;

    if (id === 'amount') {
      numericValue = Math.min(numericValue, LIMITS.MAX_LOAN_AMOUNT);
    } else if (id === 'tenureYears') {
      numericValue = Math.min(numericValue, LIMITS.MAX_TENURE_MONTHS / 12);
    } else if (id === 'interestRate') {
      numericValue = Math.min(numericValue, 30);
    }

    setInputs((prev) => ({
      ...prev,
      [id]: numericValue,
    }));
    setSchedulePage(1);
  };

  const handleSliderChange = (e) => {
    const { id, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [id]: parseFloat(value),
    }));
    setSchedulePage(1);
  };

  const calculationResults = useMemo(() => {
    const P = inputs.amount;
    const annualRate = inputs.interestRate;
    const N = inputs.tenureYears * 12;

    if (P <= 0 || annualRate <= 0 || N <= 0) {
      return { emi: 0, totalInterest: 0, totalPayable: 0, schedule: [] };
    }

    const r = annualRate / 12 / 100;
    const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    const totalPayable = emi * N;
    const totalInterest = totalPayable - P;

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
  }, [inputs.amount, inputs.tenureYears, inputs.interestRate]);

  const { emi, totalInterest, totalPayable, schedule } = calculationResults;

  const paginatedSchedule = useMemo(() => {
    const startIndex = (schedulePage - 1) * rowsPerPage;
    return schedule.slice(startIndex, startIndex + rowsPerPage);
  }, [schedule, schedulePage]);

  const totalPages = Math.ceil(schedule.length / rowsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Headings */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Interactive EMI Calculator
          </h1>
          <p className="text-md sm:text-lg text-slate-500 font-medium">
            Configure your loan parameters to instantly estimate monthly repayments and check the full amortization schedule.
          </p>
        </div>

        {/* 1. TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: Sliders & Controls */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-indigo-600" />
              Calculator Parameters
            </h2>

            {/* A. Loan Amount Configuration */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Loan Amount</span>
                <span className="text-md font-extrabold text-indigo-600">{formatCurrency(inputs.amount, false)}</span>
              </div>
              <input
                type="range"
                id="amount"
                min={LIMITS.MIN_LOAN_AMOUNT}
                max={LIMITS.MAX_LOAN_AMOUNT}
                step={50000}
                value={inputs.amount}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
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
                <span className="text-xs font-bold text-slate-400 uppercase">Interest Rate (P.A.)</span>
                <span className="text-md font-extrabold text-indigo-600">{inputs.interestRate}%</span>
              </div>
              <input
                type="range"
                id="interestRate"
                min={5}
                max={25}
                step={0.1}
                value={inputs.interestRate}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
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
                <span className="text-xs font-bold text-slate-400 uppercase">Tenure (Years)</span>
                <span className="text-md font-extrabold text-indigo-600">{inputs.tenureYears} Years</span>
              </div>
              <input
                type="range"
                id="tenureYears"
                min={1}
                max={30}
                step={1}
                value={inputs.tenureYears}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
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

          {/* RIGHT: Results display */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl flex flex-col justify-center space-y-8 relative shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
              Estimated Repayments
            </h2>

            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly EMI</span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                  {formatCurrency(emi)}
                </h3>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Interest</span>
                <h3 className="text-2xl font-black text-indigo-600 mt-1">
                  {formatCurrency(totalInterest)}
                </h3>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Payable</span>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {formatCurrency(totalPayable)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BOTTOM SECTION: Amortization Schedule Table */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-indigo-600" />
              Amortization Payment Schedule
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-400 uppercase text-[10px]">Month</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">Principal</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">Interest</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">Total EMI</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-400 uppercase text-[10px]">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {paginatedSchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">Month {row.month}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(row.principal)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">{formatCurrency(row.interest)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{formatCurrency(row.emi)}</td>
                      <td className="px-4 py-3 text-right font-mono text-indigo-600 font-bold">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
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
          <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/60 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-indigo-900 font-semibold text-center md:text-left">
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
