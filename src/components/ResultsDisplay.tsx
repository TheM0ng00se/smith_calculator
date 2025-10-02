'use client'

import { CalculationResults, CalculatorInputs } from '@/types'
import { TrendingUp, Calculator, BarChart3, Home } from 'lucide-react'

interface ResultsDisplayProps {
  results: CalculationResults | null
  inputs: CalculatorInputs
}

export default function ResultsDisplay({ results, inputs }: ResultsDisplayProps) {
  if (!results) {
    return (
      <div className="card h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Enter your information and click calculate to see your results</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const calculateMortgageAcceleration = (inputs: CalculatorInputs, results: CalculationResults) => {
    // We're calculating how much faster the PRIMARY PROPERTY mortgage will be paid off
    // The rental property generates income that helps pay down the primary mortgage
    const primaryPropertyBalance = inputs.primaryProperty.currentAmountOwing;
    const monthlyPayment = results.monthlyMortgagePayment;
    const additionalPayment = Math.max(0, results.monthlyCashFlow || 0); // Ensure positive
    const interestRate = inputs.primaryProperty.interestRate / 100 / 12; // Monthly rate
    
    if (!primaryPropertyBalance || !monthlyPayment || !interestRate) {
      return 'N/A';
    }
    
    // Calculate remaining time with regular payments on primary property
    const regularTimeToPayoff = calculateMonthsToPayoff(primaryPropertyBalance, monthlyPayment, interestRate);
    
    // Calculate time with additional payments from Smith Manoeuvre benefits
    const totalMonthlyPayment = monthlyPayment + additionalPayment;
    const acceleratedTimeToPayoff = calculateMonthsToPayoff(primaryPropertyBalance, totalMonthlyPayment, interestRate);
    
    // Calculate time saved on primary property mortgage
    const timeSaved = regularTimeToPayoff - acceleratedTimeToPayoff;
    
    if (timeSaved <= 0 || !isFinite(timeSaved)) {
      return 'N/A';
    }
    
    return formatTimeGranular(timeSaved);
  };

  const calculateNormalPayoffTime = (inputs: CalculatorInputs, results: CalculationResults) => {
    const primaryPropertyBalance = inputs.primaryProperty.currentAmountOwing;
    const monthlyPayment = results.monthlyMortgagePayment;
    const interestRate = inputs.primaryProperty.interestRate / 100 / 12; // Monthly rate

    if (!primaryPropertyBalance || !monthlyPayment || !interestRate) {
      return 'N/A';
    }

    const monthsToPayoff = calculateMonthsToPayoff(primaryPropertyBalance, monthlyPayment, interestRate);
    return formatTimeGranular(monthsToPayoff);
  };

  const calculateAcceleratedPayoffTime = (inputs: CalculatorInputs, results: CalculationResults) => {
    const primaryPropertyBalance = inputs.primaryProperty.currentAmountOwing;
    const monthlyPayment = results.monthlyMortgagePayment;
    const additionalPayment = results.monthlyCashFlow || 0;
    const interestRate = inputs.primaryProperty.interestRate / 100 / 12; // Monthly rate

    if (!primaryPropertyBalance || !monthlyPayment || !interestRate) {
      return 'N/A';
    }

    const totalMonthlyPayment = monthlyPayment + additionalPayment;
    const monthsToPayoff = calculateMonthsToPayoff(primaryPropertyBalance, totalMonthlyPayment, interestRate);
    return formatTimeGranular(monthsToPayoff);
  };

  const calculateMonthsToPayoff = (balance: number, monthlyPayment: number, monthlyInterestRate: number) => {
    if (monthlyPayment <= balance * monthlyInterestRate) {
      // Payment is less than or equal to interest, loan will never be paid off
      return Infinity;
    }

    // Use the mortgage payoff formula: n = log(P/(P - r*B)) / log(1 + r)
    // where n = number of payments, P = payment, r = monthly interest rate, B = balance
    const numerator = Math.log(monthlyPayment / (monthlyPayment - monthlyInterestRate * balance));
    const denominator = Math.log(1 + monthlyInterestRate);
    
    return numerator / denominator;
  };

  const formatTimeGranular = (months: number) => {
    if (months <= 0) return 'N/A';
    
    const years = Math.floor(months / 12);
    const remainingMonths = Math.floor(months % 12);
    const days = Math.floor((months % 1) * 30.44); // Average days per month
    
    let result = '';
    
    if (years > 0) {
      result += `${years} year${years > 1 ? 's' : ''}`;
    }
    
    if (remainingMonths > 0) {
      if (result) result += ', ';
      result += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    
    if (days > 0) {
      if (result) result += ', ';
      result += `${days} day${days > 1 ? 's' : ''}`;
    }
    
    return result || 'Less than 1 month';
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-midnight-500" />
          <h2 className="text-xl font-semibold text-dark-100">Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-800/30">
            <span className="font-medium text-dark-200">Total Annual Savings</span>
            <span className="text-2xl font-bold text-green-400">
              {formatCurrency(results.totalSavings)}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <span className="font-medium text-dark-200">Monthly Cash Flow</span>
            <span className="text-xl font-semibold text-blue-400">
              {formatCurrency(results.monthlyCashFlow)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-midnight-500" />
          <h2 className="text-xl font-semibold text-dark-100">Detailed Breakdown</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">Equity Gained</span>
            <span className="font-semibold text-dark-100">{formatCurrency(results.equityGained)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">Tax Savings</span>
            <span className="font-semibold text-green-400">{formatCurrency(results.taxSavings)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">Investment Loan Interest</span>
            <span className="font-semibold text-red-400">-{formatCurrency(results.investmentLoanInterest)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-dark-700">
            <span className="text-dark-300">Net Tax Savings</span>
            <span className="font-semibold text-green-400">{formatCurrency(results.totalSavings)}</span>
          </div>
        </div>
      </div>

      {/* How It Works - Detailed Breakdown */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-midnight-500" />
          <h2 className="text-xl font-semibold text-dark-100">How the Smith Manoeuvre Works</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <h3 className="font-medium text-blue-300 mb-2">Step 1: Mortgage Payment Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-300">Monthly Payment:</span>
                <span className="font-medium text-dark-100">{formatCurrency(results.monthlyMortgagePayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Interest Portion:</span>
                <span className="font-medium text-red-400">{formatCurrency(results.monthlyInterestPortion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-300">Principal Portion:</span>
                <span className="font-medium text-green-400">{formatCurrency(results.monthlyPrincipalPortion)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/30">
            <h3 className="font-medium text-green-300 mb-2">Step 2: Tax Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-300">Annual Interest:</span>
                <span className="font-medium text-dark-100">{formatCurrency(results.annualInterestPortion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Tax Rate Applied:</span>
                <span className="font-medium">{formatPercentage(results.marginalTaxRate || 0.25)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Tax Savings:</span>
                <span className="font-medium text-green-600">{formatCurrency(results.taxSavings)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Step 3: Investment Loan Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                                        <span className="text-yellow-700">HELOC Interest Rate:</span>
                        <span className="font-medium">{results.helocInterestRate ? `${results.helocInterestRate.toFixed(1)}%` : '7.2%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Annual HELOC Cost:</span>
                <span className="font-medium text-red-600">{formatCurrency(results.helocInterestCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Tax Deduction on HELOC:</span>
                <span className="font-medium text-green-600">{formatCurrency(results.helocInterestCost * (results.marginalTaxRate || 0.25))}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Step 4: Net Result</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Gross Tax Savings:</span>
                <span className="font-medium text-green-600">{formatCurrency(results.taxSavings)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Net HELOC Cost:</span>
                <span className="font-medium text-red-600">-{formatCurrency(results.helocInterestCost * (1 - (results.marginalTaxRate || 0.25)))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Net Tax Benefit:</span>
                <span className="font-medium text-green-600">{formatCurrency(results.netTaxBenefit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Scenarios */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-midnight-500" />
          <h2 className="text-xl font-semibold text-dark-100">Your Smith Manoeuvre Benefits</h2>
        </div>
        
        <div className="space-y-4">
          {/* Mortgage Acceleration */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <h3 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
              <span>🚀</span>
              Mortgage Acceleration
            </h3>
            <div className="space-y-3">
              {/* Debug Info */}
              <div className="p-2 bg-yellow-900/20 rounded text-xs border border-yellow-800/30">
                <strong className="text-yellow-300">Debug Info:</strong><br/>
                <span className="text-yellow-300">Balance: {formatCurrency(inputs.primaryProperty.currentAmountOwing)}</span><br/>
                <span className="text-yellow-300">Regular Payment: {formatCurrency(results.monthlyMortgagePayment)}</span><br/>
                <span className="text-yellow-300">Additional Payment: {formatCurrency(results.monthlyCashFlow || 0)}</span><br/>
                <span className="text-yellow-300">Total Payment: {formatCurrency((results.monthlyMortgagePayment || 0) + (results.monthlyCashFlow || 0))}</span><br/>
                <span className="text-yellow-300">Interest Rate: {(inputs.primaryProperty.interestRate || 0).toFixed(2)}%</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-dark-800 rounded border border-dark-700">
                  <h4 className="font-medium text-dark-200 mb-2">Without Smith Manoeuvre</h4>
                  <p className="text-sm text-dark-300">
                    Your mortgage will be paid off in{' '}
                    <span className="font-semibold text-dark-100">
                      {calculateNormalPayoffTime(inputs, results)}
                    </span>
                  </p>
                </div>
                <div className="p-3 bg-blue-900/20 rounded border border-blue-800/30">
                  <h4 className="font-medium text-blue-300 mb-2">With Smith Manoeuvre</h4>
                  <p className="text-sm text-blue-300">
                    Your mortgage will be paid off in{' '}
                    <span className="font-semibold text-blue-300">
                      {calculateAcceleratedPayoffTime(inputs, results)}
                    </span>
                  </p>
                </div>
              </div>
              <p className="text-sm text-blue-300">
                <span className="font-semibold text-blue-300">
                  Time saved: {calculateMortgageAcceleration(inputs, results)}
                </span>
              </p>
              <div className="text-xs text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-800/30">
                💡 <strong>How it works:</strong> Your additional equity gains and rental income cash flow 
                are applied directly to your primary mortgage principal, reducing your total interest costs.
              </div>
            </div>
          </div>

          {/* Additional Tax Benefits */}
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-800/30">
            <h3 className="font-medium text-green-300 mb-3 flex items-center gap-2">
              <span>💰</span>
              Tax Benefits Breakdown
            </h3>
            <div className="space-y-4">
              {/* Primary Individual */}
              <div className="p-3 bg-dark-800 rounded border border-dark-700">
                <h4 className="font-medium text-dark-200 mb-2">Primary Individual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-300">Tax Credits:</span>
                    <span className="font-medium text-green-400">{formatCurrency(results.primaryTaxCredits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Net Tax Savings:</span>
                    <span className={`font-medium ${results.primaryTaxSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(results.primaryTaxSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Increased Taxable Income:</span>
                    <span className="font-medium text-blue-400">{formatCurrency(results.primaryIncreasedTaxableIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Spouse */}
              <div className="p-3 bg-white rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Spouse/Partner</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Credits:</span>
                    <span className="font-medium text-green-600">{formatCurrency(results.spouseTaxCredits)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Tax Impact:</span>
                    <span className={`font-medium ${results.spouseTaxSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(results.spouseTaxSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Increased Taxable Income:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(results.spouseIncreasedTaxableIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Household Total */}
              <div className="p-3 bg-green-100 rounded border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Household Total</h4>
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Total Tax Benefit:</span>
                  <span className={`font-semibold text-lg ${results.householdTaxBenefit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(results.householdTaxBenefit)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-green-600 bg-green-100 p-2 rounded mt-3">
              💡 <strong>Tax Credits:</strong> Deductible expenses (rental property costs, HELOC interest). 
              <strong>Net Tax Impact:</strong> Tax savings minus any additional taxes on rental income.
              <strong>Increased Taxable Income:</strong> Additional rental income added to tax return.
            </div>
          </div>



          {/* Total Annual Savings */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
              <span>🎯</span>
              Total Annual Impact
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-purple-700">
                Combined annual savings from tax benefits and rental income:{' '}
                <span className="font-semibold text-purple-800">
                  {formatCurrency((results.netTaxBenefit || 0) + ((results.rentalPropertyCashFlow || 0) * 12))}
                </span>
              </p>
              <div className="text-xs text-purple-600 bg-purple-100 p-2 rounded">
                💡 <strong>Compound effect:</strong> These savings compound over time, accelerating your 
                path to mortgage freedom and building wealth through your investment portfolio.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property 2 Results (if exists) */}
      {results.rentalPropertyCashFlow !== undefined && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-midnight-500" />
            <h2 className="text-xl font-semibold text-dark-100">Rental Property Results</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-dark-700">
              <span className="text-dark-300">Monthly Cash Flow</span>
              <span className={`font-semibold ${results.rentalPropertyCashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(results.rentalPropertyCashFlow)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-dark-700">
              <span className="text-dark-300">Annual Tax Deductions</span>
              <span className="font-semibold text-green-400">{formatCurrency(results.rentalPropertyTaxDeductions || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-dark-700">
              <span className="text-dark-300">Net Rental Income (After Tax)</span>
              <span className="font-semibold text-green-400">{formatCurrency(results.netRentalIncome || 0)}</span>
            </div>
            
            {/* Financing Details */}
            <div className="mt-4 p-3 bg-dark-800 rounded-lg border border-dark-700">
              <h4 className="font-medium text-dark-100 mb-3">Mortgage & Financing Details</h4>
              <p className="text-xs text-dark-400 mb-3">
                All financing costs are tax-deductible for investment properties
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-300">Downpayment Amount:</span>
                  <span className="font-medium text-dark-100">{formatCurrency(results.downpaymentAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">HELOC Downpayment Interest:</span>
                  <span className="font-medium text-red-400">{formatCurrency(results.helocDownpaymentInterest || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Property 2 Mortgage Amount:</span>
                  <span className="font-medium text-dark-100">{formatCurrency(results.property2MortgageAmount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Property 2 Mortgage Interest:</span>
                  <span className="font-medium text-red-400">{formatCurrency(results.property2MortgageInterest || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Amortization Period:</span>
                  <span className="font-medium text-dark-100">{inputs.property2?.amortizationYears || 0} years</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <p className="text-sm text-blue-300">
              💡 <strong>Tax Benefits:</strong> Rental property expenses are tax-deductible, 
              reducing your overall tax burden and increasing your Smith Manoeuvre effectiveness.
            </p>
            <p className="text-sm text-blue-300 mt-1">
              <strong>Note:</strong> Rental income is being reported on the{' '}
              {inputs.rentalIncomeToSpouse ? 'spouse\'s' : 'primary taxpayer\'s'} tax return.
            </p>
          </div>
        </div>
      )}



      {/* Disclaimer */}
      <div className="card bg-dark-800">
        <h3 className="font-semibold text-dark-100 mb-2">Important Disclaimer</h3>
        <p className="text-sm text-dark-300">
          This calculator provides estimates only and should not be considered as financial advice. 
          The Smith Manoeuvre involves significant risks and should be discussed with qualified 
          financial professionals. Tax laws and rates may change, affecting the accuracy of calculations.
        </p>
      </div>
    </div>
  )
}
