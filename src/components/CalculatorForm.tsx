'use client'

import { useState, useEffect } from 'react'
import { CalculatorInputs, PropertyDetails, IncomeDetails, SpouseDetails } from '@/types'
import { PROVINCES, calculateAccurateTaxRate, calculateSmithManoeuvre } from '@/lib/calculations'
import { Calculator, Home, DollarSign, User, Save, RotateCcw } from 'lucide-react'

interface CalculatorFormProps {
  onCalculate: (results: any) => void
  onInputsChange: (inputs: CalculatorInputs) => void
}

// Local storage keys
const STORAGE_KEYS = {
  PRIMARY_PROPERTY: 'smithy_primary_property',
  INCOME: 'smithy_income',
  PROPERTY2: 'smithy_property2',
  SPOUSE: 'smithy_spouse',
  HELOC_RATE: 'smithy_heloc_rate',
  PRIMARY_OWNER_PERCENTAGE: 'smithy_primary_owner_percentage',
  SPOUSE_PERCENTAGE: 'smithy_spouse_percentage',
  SHOW_PROPERTY2: 'smithy_show_property2',
  SHOW_SPOUSE: 'smithy_show_spouse'
}

export default function CalculatorForm({ onCalculate, onInputsChange }: CalculatorFormProps) {
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
    helocInterestRate: 7.2, // Default HELOC rate
    primaryOwnerPercentage: 100, // Default to 100% primary owner
    spousePercentage: 0, // Default to 0% spouse
  })

  const [showProperty2, setShowProperty2] = useState(false)
  const [showSpouse, setShowSpouse] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Load cached data on component mount
  useEffect(() => {
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      loadCachedData()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Auto-calculate tax rate when province or income changes
  useEffect(() => {
    if (inputs.income.netTaxableIncome > 0) {
      const taxRate = calculateAccurateTaxRate(inputs.income.province, inputs.income.netTaxableIncome)
      setInputs(prev => ({
        ...prev,
        income: {
          ...prev.income,
          marginalTaxRate: taxRate,
        }
      }))
    }
  }, [inputs.income.province, inputs.income.netTaxableIncome])

  // Cache data whenever inputs change
  useEffect(() => {
    // Don't cache on initial load
    if (inputs.primaryProperty.mortgageAmount > 0 || inputs.income.netTaxableIncome > 0) {
      cacheData()
    }
    // Notify parent component of input changes
    onInputsChange(inputs)
  }, [inputs, showProperty2, showSpouse, onInputsChange])

  const loadCachedData = () => {
    try {
      console.log('Loading cached data...')
      
      // Load primary property data
      const cachedPrimaryProperty = localStorage.getItem(STORAGE_KEYS.PRIMARY_PROPERTY)
      if (cachedPrimaryProperty) {
        console.log('Found cached primary property:', cachedPrimaryProperty)
        const parsed = JSON.parse(cachedPrimaryProperty)
        setInputs(prev => ({
          ...prev,
          primaryProperty: { ...prev.primaryProperty, ...parsed }
        }))
      }

      // Load income data
      const cachedIncome = localStorage.getItem(STORAGE_KEYS.INCOME)
      if (cachedIncome) {
        console.log('Found cached income:', cachedIncome)
        const parsed = JSON.parse(cachedIncome)
        setInputs(prev => ({
          ...prev,
          income: { ...prev.income, ...parsed }
        }))
      }

      // Load property 2 data
      const cachedProperty2 = localStorage.getItem(STORAGE_KEYS.PROPERTY2)
      if (cachedProperty2) {
        console.log('Found cached property 2:', cachedProperty2)
        const parsed = JSON.parse(cachedProperty2)
        setInputs(prev => ({
          ...prev,
          property2: { ...(prev.property2 || {}), ...parsed }
        }))
        setShowProperty2(true)
      }

      // Load spouse data
      const cachedSpouse = localStorage.getItem(STORAGE_KEYS.SPOUSE)
      if (cachedSpouse) {
        console.log('Found cached spouse:', cachedSpouse)
        const parsed = JSON.parse(cachedSpouse)
        setInputs(prev => ({
          ...prev,
          spouse: parsed
        }))
      }

      // Load HELOC rate
      const cachedHelocRate = localStorage.getItem(STORAGE_KEYS.HELOC_RATE)
      if (cachedHelocRate) {
        console.log('Found cached HELOC rate:', cachedHelocRate)
        const parsed = JSON.parse(cachedHelocRate)
        setInputs(prev => ({
          ...prev,
          helocInterestRate: parsed
        }))
      }

      // Load ownership percentages
      const cachedPrimaryPercentage = localStorage.getItem(STORAGE_KEYS.PRIMARY_OWNER_PERCENTAGE)
      if (cachedPrimaryPercentage) {
        console.log('Found cached primary owner percentage:', cachedPrimaryPercentage)
        const parsed = JSON.parse(cachedPrimaryPercentage)
        setInputs(prev => ({
          ...prev,
          primaryOwnerPercentage: parsed
        }))
      }

      const cachedSpousePercentage = localStorage.getItem(STORAGE_KEYS.SPOUSE_PERCENTAGE)
      if (cachedSpousePercentage) {
        console.log('Found cached spouse percentage:', cachedSpousePercentage)
        const parsed = JSON.parse(cachedSpousePercentage)
        setInputs(prev => ({
          ...prev,
          spousePercentage: parsed
        }))
      }

      // Load UI state
      const cachedShowProperty2 = localStorage.getItem(STORAGE_KEYS.SHOW_PROPERTY2)
      if (cachedShowProperty2) {
        setShowProperty2(JSON.parse(cachedShowProperty2))
      }

      const cachedShowSpouse = localStorage.getItem(STORAGE_KEYS.SHOW_SPOUSE)
      if (cachedShowSpouse) {
        setShowSpouse(JSON.parse(cachedShowSpouse))
      }
      
      console.log('Cached data loading complete')
    } catch (error) {
      console.warn('Failed to load cached data:', error)
    }
  }

  const cacheData = () => {
    try {
      // Cache primary property data
      localStorage.setItem(STORAGE_KEYS.PRIMARY_PROPERTY, JSON.stringify(inputs.primaryProperty))
      
      // Cache income data
      localStorage.setItem(STORAGE_KEYS.INCOME, JSON.stringify(inputs.income))
      
      // Cache property 2 data if it exists
      if (inputs.property2) {
        localStorage.setItem(STORAGE_KEYS.PROPERTY2, JSON.stringify(inputs.property2))
      }
      
      // Cache spouse data if it exists
      if (inputs.spouse) {
        localStorage.setItem(STORAGE_KEYS.SPOUSE, JSON.stringify(inputs.spouse))
      }
      
      // Cache HELOC rate
      localStorage.setItem(STORAGE_KEYS.HELOC_RATE, JSON.stringify(inputs.helocInterestRate))
      
      // Cache ownership percentages
      localStorage.setItem(STORAGE_KEYS.PRIMARY_OWNER_PERCENTAGE, JSON.stringify(inputs.primaryOwnerPercentage))
      localStorage.setItem(STORAGE_KEYS.SPOUSE_PERCENTAGE, JSON.stringify(inputs.spousePercentage))
      
      // Cache UI state
      localStorage.setItem(STORAGE_KEYS.SHOW_PROPERTY2, JSON.stringify(showProperty2))
      localStorage.setItem(STORAGE_KEYS.SHOW_SPOUSE, JSON.stringify(showSpouse))
      
      console.log('Data cached successfully')
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }

  const clearCachedData = () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Reset form to defaults
      setInputs({
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
        primaryOwnerPercentage: 100,
        spousePercentage: 0,
      })
      setShowProperty2(false)
      setShowSpouse(false)
      
      // Clear results
      onCalculate(null)
    } catch (error) {
      console.warn('Failed to clear cached data:', error)
    }
  }

  const handleInputChange = (section: keyof CalculatorInputs, field: string, value: number | string) => {
    setInputs(prev => {
      if (section === 'helocInterestRate') {
        return {
          ...prev,
          helocInterestRate: value as number
        }
      }
      
      // Handle property2 and spouse sections that might not exist initially
      if (section === 'property2') {
        const existingProperty2 = prev.property2 || {
          mortgageAmount: 0,
          interestRate: 0,
          amortizationYears: 25,
          currentAmountOwing: 0,
          propertyValue: 0,
          monthlyPayment: 0,
          monthlyRent: 0,
          monthlyMaintenanceFees: 0,
          monthlyPropertyTax: 0,
          monthlyInsurance: 0,
          monthlyUtilities: 0,
          vacancyRate: 0,
          propertyManagementFees: 0,
        }
        return {
          ...prev,
          property2: {
            ...existingProperty2,
            [field]: value,
          }
        }
      }
      
      if (section === 'spouse') {
        const existingSpouse = prev.spouse || {
          netTaxableIncome: 0,
          otherTaxableIncome: 0,
          marginalTaxRate: 0.25, // Default tax rate
        }
        return {
          ...prev,
          spouse: {
            ...existingSpouse,
            [field]: value,
          }
        }
      }
      
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        }
      }
    })
  }

  const handleProvinceChange = (province: string) => {
    setInputs(prev => ({
      ...prev,
      income: {
        ...prev.income,
        province,
      }
    }))
  }

  const validateInputs = (): string[] => {
    const errors: string[] = []

    // Primary Property - Required fields
    if (!inputs.primaryProperty.mortgageAmount || inputs.primaryProperty.mortgageAmount <= 0) {
      errors.push('Primary Property: Mortgage Amount is required and must be greater than 0')
    }
    if (!inputs.primaryProperty.interestRate || inputs.primaryProperty.interestRate <= 0) {
      errors.push('Primary Property: Interest Rate is required and must be greater than 0')
    }
    if (!inputs.primaryProperty.amortizationYears || inputs.primaryProperty.amortizationYears <= 0) {
      errors.push('Primary Property: Amortization Years is required and must be greater than 0')
    }
    if (!inputs.primaryProperty.currentAmountOwing || inputs.primaryProperty.currentAmountOwing <= 0) {
      errors.push('Primary Property: Current Amount Owing is required and must be greater than 0')
    }

    // Income - Required fields
    if (!inputs.income.netTaxableIncome || inputs.income.netTaxableIncome <= 0) {
      errors.push('Income: Net Taxable Income is required and must be greater than 0')
    }

    // HELOC Rate - Required
    if (!inputs.helocInterestRate || inputs.helocInterestRate <= 0) {
      errors.push('HELOC Interest Rate is required and must be greater than 0')
    }

    // Property 2 (if enabled) - Required fields
    if (showProperty2 && inputs.property2) {
      if (!inputs.property2.monthlyRent || inputs.property2.monthlyRent <= 0) {
        errors.push('Property 2: Monthly Rent is required and must be greater than 0')
      }
      if (!inputs.property2.propertyValue || inputs.property2.propertyValue <= 0) {
        errors.push('Property 2: Property Value is required and must be greater than 0')
      }
      if (!inputs.property2.currentAmountOwing || inputs.property2.currentAmountOwing <= 0) {
        errors.push('Property 2: Current Amount Owing is required and must be greater than 0')
      }
      if (!inputs.property2.property2MortgageInterest || inputs.property2.property2MortgageInterest <= 0) {
        errors.push('Property 2: Mortgage Interest Rate is required and must be greater than 0')
      }
      if (!inputs.property2.property2MortgageAmount || inputs.property2.property2MortgageAmount <= 0) {
        errors.push('Property 2: Mortgage Amount is required and must be greater than 0')
      }
    }

    // Spouse (if enabled) - Required fields
    if (showSpouse && inputs.spouse) {
      if (!inputs.spouse.netTaxableIncome || inputs.spouse.netTaxableIncome < 0) {
        errors.push('Spouse: Net Taxable Income is required (can be 0)')
      }
    }

    // Ownership Percentages - Validation
    if (showProperty2 && inputs.property2) {
      const totalPercentage = inputs.primaryOwnerPercentage + inputs.spousePercentage
      if (Math.abs(totalPercentage - 100) > 0.01) { // Allow for small floating point differences
        errors.push(`Ownership Percentages: Primary Owner (${inputs.primaryOwnerPercentage}%) + Spouse (${inputs.spousePercentage}%) must equal 100% (currently ${totalPercentage}%)`)
      }
      if (inputs.primaryOwnerPercentage < 0 || inputs.primaryOwnerPercentage > 100) {
        errors.push('Primary Owner Percentage must be between 0% and 100%')
      }
      if (inputs.spousePercentage < 0 || inputs.spousePercentage > 100) {
        errors.push('Spouse Percentage must be between 0% and 100%')
      }
    }

    // Logical consistency checks
    if (inputs.primaryProperty.currentAmountOwing > inputs.primaryProperty.mortgageAmount) {
      errors.push('Primary Property: Current Amount Owing cannot be greater than the original Mortgage Amount')
    }

    if (showProperty2 && inputs.property2) {
      if (inputs.property2.property2MortgageAmount && inputs.property2.currentAmountOwing > inputs.property2.property2MortgageAmount) {
        errors.push(`Property 2: Current Amount Owing ($${inputs.property2.currentAmountOwing.toLocaleString()}) cannot be greater than the original Mortgage Amount ($${inputs.property2.property2MortgageAmount.toLocaleString()})`)
      }
    }

    return errors
  }

  const handleCalculate = async () => {
    // Clear previous errors
    setValidationErrors([])
    
    // Validate inputs
    const errors = validateInputs()
    
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const results = await calculateSmithManoeuvre(inputs)
      onCalculate(results)
    } catch (error) {
      console.error('Calculation error:', error)
      setValidationErrors(['An error occurred during calculation. Please check your inputs and try again.'])
    }
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

  return (
    <div className="space-y-6">
      {/* Cache Controls */}
      <div className="card bg-dark-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-dark-300" />
            <span className="text-sm text-dark-300">Data automatically saved to your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadCachedData}
              className="flex items-center gap-1 text-sm text-midnight-400 hover:text-midnight-300 font-medium transition-colors"
              title="Reload previously saved data"
            >
              <RotateCcw className="w-4 h-4" />
              Load Previous Data
            </button>
            <button
              onClick={clearCachedData}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
              title="Clear all saved data and reset form"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Required Fields Legend */}
      <div className="card bg-blue-900/20 border border-blue-800/30">
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold">*</span>
          <span className="text-sm text-blue-300">
            Required fields must be filled in before calculation. Optional fields can be left empty and will use default assumptions.
          </span>
        </div>
      </div>

      {/* Primary Property Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-midnight-500" />
          <h2 className="text-xl font-semibold text-dark-100">Primary Property</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Mortgage Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.primaryProperty.mortgageAmount || ''}
              onChange={(e) => handleInputChange('primaryProperty', 'mortgageAmount', parseFloat(e.target.value) || 0)}
              placeholder="500,000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Interest Rate (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={inputs.primaryProperty.interestRate || ''}
              onChange={(e) => handleInputChange('primaryProperty', 'interestRate', parseFloat(e.target.value) || 0)}
              placeholder="5.5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Amortization (Years) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.primaryProperty.amortizationYears || ''}
              onChange={(e) => handleInputChange('primaryProperty', 'amortizationYears', parseInt(e.target.value) || 25)}
              placeholder="25"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Current Amount Owing <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.primaryProperty.currentAmountOwing || ''}
              onChange={(e) => handleInputChange('primaryProperty', 'currentAmountOwing', parseFloat(e.target.value) || 0)}
              placeholder="450,000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Property Value
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.primaryProperty.propertyValue || ''}
              onChange={(e) => handleInputChange('primaryProperty', 'propertyValue', parseFloat(e.target.value) || 0)}
              placeholder="600,000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Monthly Payment
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.primaryProperty.monthlyPayment || ''}
              onChange={(e) => handleInputChange('primaryProperty', 'monthlyPayment', parseFloat(e.target.value) || 0)}
              placeholder="3,000"
            />
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-midnight-500" />
          <h2 className="text-xl font-semibold text-dark-100">Income Information</h2>
        </div>
        
        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
          <p className="text-sm text-blue-300">
            💡 <strong>Note:</strong> Use your net (take-home) income after taxes for more accurate calculations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Province of Residence
            </label>
            <select
              className="input-field"
              value={inputs.income.province}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              {PROVINCES.map(province => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Net Taxable Income (Gross minus RRSPs, Pensions, etc.) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.income.netTaxableIncome || ''}
              onChange={(e) => handleInputChange('income', 'netTaxableIncome', parseFloat(e.target.value) || 0)}
              placeholder="85,000"
            />
            <p className="text-xs text-dark-400 mt-1">
              Your gross income minus RRSP contributions, pension contributions, and other deductions
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Other Net Taxable Income
            </label>
            <input
              type="number"
              className="input-field"
              value={inputs.income.otherTaxableIncome || ''}
              onChange={(e) => handleInputChange('income', 'otherTaxableIncome', parseFloat(e.target.value) || 0)}
              placeholder="5,000"
            />
            <p className="text-xs text-dark-400 mt-1">
              Other taxable income (investments, side business, etc.)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              Marginal Tax Rate (Auto-calculated)
            </label>
            <input
              type="text"
              className="input-field bg-gray-50 cursor-not-allowed"
              value={formatPercentage(inputs.income.marginalTaxRate)}
              readOnly
              placeholder="Calculating..."
            />
            <p className="text-xs text-dark-400 mt-1">
              Based on your province and income level
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1">
              HELOC Interest Rate (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={inputs.helocInterestRate || ''}
              onChange={(e) => handleInputChange('helocInterestRate', '', parseFloat(e.target.value) || 7.2)}
              placeholder="7.2"
            />
            <p className="text-xs text-dark-400 mt-1">
              Your Home Equity Line of Credit interest rate
            </p>
          </div>
        </div>
      </div>

      {/* Property 2 Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-midnight-500" />
            <h2 className="text-xl font-semibold text-dark-100">Property 2 (Rental Property)</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowProperty2(!showProperty2)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showProperty2 ? 'Hide' : 'Add Rental Property'}
          </button>
        </div>
        
        {showProperty2 && (
          <div className="space-y-6">
            {/* Property Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Value <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="350,000"
                    value={inputs.property2?.propertyValue || ''}
                    onChange={(e) => handleInputChange('property2', 'propertyValue', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Amount Owing <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="280,000"
                    value={inputs.property2?.currentAmountOwing || ''}
                    onChange={(e) => handleInputChange('property2', 'currentAmountOwing', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current remaining mortgage balance
                  </p>
                </div>
              </div>
            </div>

            {/* Property 2 Financing Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Mortgage & Financing Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Downpayment Amount
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="70,000"
                    value={inputs.property2?.downpaymentAmount ?? ''}
                    onChange={(e) => handleInputChange('property2', 'downpaymentAmount', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cash/equity used for downpayment
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HELOC Downpayment Interest (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="7.2"
                    value={inputs.property2?.helocDownpaymentInterest ?? ''}
                    onChange={(e) => handleInputChange('property2', 'helocDownpaymentInterest', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Interest rate on HELOC used for downpayment
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property 2 Mortgage Amount <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="280,000"
                    value={inputs.property2?.property2MortgageAmount || ''}
                    onChange={(e) => handleInputChange('property2', 'property2MortgageAmount', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The actual mortgage on the rental property
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property 2 Mortgage Interest (%) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    step="0.01"
                    placeholder="5.5"
                    value={inputs.property2?.property2MortgageInterest || ''}
                    onChange={(e) => handleInputChange('property2', 'property2MortgageInterest', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Interest rate on the rental property mortgage
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amortization (Years)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="25"
                    value={inputs.property2?.amortizationYears || ''}
                    onChange={(e) => handleInputChange('property2', 'amortizationYears', parseInt(e.target.value) || 25)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mortgage amortization period
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Income */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Rental Income</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="2,500"
                    value={inputs.property2?.monthlyRent || ''}
                    onChange={(e) => handleInputChange('property2', 'monthlyRent', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              {/* Rental Property Ownership */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rental Property Ownership Percentages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Owner Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      className="input-field"
                      placeholder="100"
                      value={inputs.primaryOwnerPercentage || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setInputs(prev => ({
                          ...prev,
                          primaryOwnerPercentage: value,
                          spousePercentage: inputs.spouse ? Math.max(0, 100 - value) : 0
                        }))
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spouse Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      className="input-field"
                      placeholder="0"
                      value={inputs.spousePercentage || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setInputs(prev => ({
                          ...prev,
                          spousePercentage: value,
                          primaryOwnerPercentage: Math.max(0, 100 - value)
                        }))
                      }}
                      disabled={!inputs.spouse}
                    />
                  </div>
                </div>
                <div className="mt-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Ownership Split:</strong> These percentages determine how rental income and tax credits are allocated between you and your spouse. 
                    Both rental income and tax deductions will be split according to these percentages.
                    <br />
                    <strong>Total:</strong> {inputs.primaryOwnerPercentage + inputs.spousePercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Expenses */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Monthly Expenses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Fees
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="200"
                    value={inputs.property2?.monthlyMaintenanceFees ?? ''}
                    onChange={(e) => handleInputChange('property2', 'monthlyMaintenanceFees', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Tax
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="300"
                    value={inputs.property2?.monthlyPropertyTax ?? ''}
                    onChange={(e) => handleInputChange('property2', 'monthlyPropertyTax', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="150"
                    value={inputs.property2?.monthlyInsurance ?? ''}
                    onChange={(e) => handleInputChange('property2', 'monthlyInsurance', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilities
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="100"
                    value={inputs.property2?.monthlyUtilities ?? ''}
                    onChange={(e) => handleInputChange('property2', 'monthlyUtilities', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-1">
                    Property Management Fees
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="125"
                    value={inputs.property2?.propertyManagementFees ?? ''}
                    onChange={(e) => handleInputChange('property2', 'propertyManagementFees', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-dark-400 mt-1">
                    If using a property manager
                  </p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-green-900/20 rounded-lg border border-green-800/30">
              <p className="text-sm text-green-300">
                💡 <strong>Smith Manoeuvre Strategy:</strong> This rental property will generate tax-deductible expenses 
                (including mortgage interest, HELOC downpayment interest, and operating costs) and rental income to help pay down your primary mortgage faster.
                <br /><br />
                <strong>Note:</strong> All financing costs are tax-deductible for investment properties, maximizing your tax benefits.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spouse Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-midnight-500" />
            <h2 className="text-xl font-semibold text-dark-100">Spouse/Partner (Optional)</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSpouse(!showSpouse)}
            className="text-midnight-400 hover:text-midnight-300 text-sm font-medium transition-colors"
          >
            {showSpouse ? 'Hide' : 'Add Spouse'}
          </button>
        </div>
        
        {showSpouse && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1">
                Net Taxable Income (Gross minus RRSPs, Pensions, etc.) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="60,000"
                value={inputs.spouse?.netTaxableIncome || ''}
                onChange={(e) => handleInputChange('spouse', 'netTaxableIncome', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-dark-400 mt-1">
                Spouse's gross income minus RRSP contributions, pension contributions, and other deductions
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-1">
                Other Net Taxable Income
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="3,000"
                value={inputs.spouse?.otherTaxableIncome || ''}
                onChange={(e) => handleInputChange('spouse', 'otherTaxableIncome', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-dark-400 mt-1">
                Other taxable income (investments, side business, etc.)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="card bg-red-900/20 border border-red-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <h3 className="text-lg font-semibold text-red-300">Validation Errors</h3>
          </div>
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-red-800/20 rounded border border-red-700/30">
            <p className="text-xs text-red-300">
              💡 <strong>Tip:</strong> Please fix the above errors before calculating. Required fields are marked with specific validation messages.
            </p>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className={`w-full flex items-center justify-center gap-2 ${
          validationErrors.length > 0 
            ? 'btn-secondary cursor-not-allowed opacity-50' 
            : 'btn-primary'
        }`}
        disabled={validationErrors.length > 0}
      >
        <Calculator className="w-5 h-5" />
        {validationErrors.length > 0 ? 'Fix Errors to Calculate' : 'Calculate Smith Manoeuvre'}
      </button>
    </div>
  )
}
