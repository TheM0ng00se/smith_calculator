'use client'

import { useState } from 'react'
import CalculatorForm from '@/components/CalculatorForm'
import ResultsDisplay from '@/components/ResultsDisplay'
import { CalculatorInputs } from '@/types'

export default function Home() {
  const [results, setResults] = useState(null)
  const [inputs, setInputs] = useState<CalculatorInputs>({
    primaryProperty: {
      mortgageAmount: 0,
      interestRate: 0,
      amortizationYears: 25,
      currentAmountOwing: 0,
      propertyValue: 0,
      monthlyPayment: 0,
    },
    income: {
      province: 'ON',
      netTaxableIncome: 0,
      otherTaxableIncome: 0,
      marginalTaxRate: 0.25,
    },
    helocInterestRate: 7.2,
    rentalIncomeToSpouse: false,
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
                            <header className="text-center mb-8">
                      <h1 className="text-4xl font-bold text-dark-100 mb-4">
                        Smith Manoeuvre Calculator
                      </h1>
                      <p className="text-lg text-dark-300 max-w-2xl mx-auto">
                        Calculate your potential tax savings and equity gains through the Smith Manoeuvre strategy.
                        This Canadian real estate investment technique converts non-deductible mortgage interest into tax-deductible investment loan interest,
                        using rental property income and tax deductions to accelerate your primary mortgage payoff.
                      </p>
                    </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <CalculatorForm onCalculate={setResults} onInputsChange={setInputs} />
          </div>
          <div>
            <ResultsDisplay results={results} inputs={inputs} />
          </div>
        </div>
      </div>
    </main>
  )
} 