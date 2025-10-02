import Decimal from 'decimal.js'
import { CalculatorInputs, CalculationResults, Province } from '@/types'
import { useEffect } from 'react'

// Debug logging function for browser
async function writeDebugLog(data: any) {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      ...data
    }
    
    // Store in localStorage for easy access
    localStorage.setItem('smithy-debug-data', JSON.stringify(logData))
    
    // Also send to API to write to file
    const response = await fetch('/api/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData)
    })
    
    if (response.ok) {
      console.log('Debug data written to file successfully')
    } else {
      console.log('Debug data stored in localStorage only')
    }
  } catch (error) {
    console.error('Failed to write debug log:', error)
    // Fallback to localStorage only
    localStorage.setItem('smithy-debug-data', JSON.stringify(data))
  }
}

// Canadian provinces with more detailed tax information
export const PROVINCES: Province[] = [
  { name: 'Alberta', code: 'AB', federalTaxRate: 0.15, provincialTaxRate: 0.10 },
  { name: 'British Columbia', code: 'BC', federalTaxRate: 0.15, provincialTaxRate: 0.0506 },
  { name: 'Manitoba', code: 'MB', federalTaxRate: 0.15, provincialTaxRate: 0.108 },
  { name: 'New Brunswick', code: 'NB', federalTaxRate: 0.15, provincialTaxRate: 0.0968 },
  { name: 'Newfoundland and Labrador', code: 'NL', federalTaxRate: 0.15, provincialTaxRate: 0.087 },
  { name: 'Nova Scotia', code: 'NS', federalTaxRate: 0.15, provincialTaxRate: 0.0875 },
  { name: 'Ontario', code: 'ON', federalTaxRate: 0.15, provincialTaxRate: 0.0505 },
  { name: 'Prince Edward Island', code: 'PE', federalTaxRate: 0.15, provincialTaxRate: 0.098 },
  { name: 'Quebec', code: 'QC', federalTaxRate: 0.15, provincialTaxRate: 0.1475 },
  { name: 'Saskatchewan', code: 'SK', federalTaxRate: 0.15, provincialTaxRate: 0.105 },
  { name: 'Northwest Territories', code: 'NT', federalTaxRate: 0.15, provincialTaxRate: 0.059 },
  { name: 'Nunavut', code: 'NU', federalTaxRate: 0.15, provincialTaxRate: 0.04 },
  { name: 'Yukon', code: 'YT', federalTaxRate: 0.15, provincialTaxRate: 0.064 },
]

export function getProvinceByCode(code: string): Province | undefined {
  return PROVINCES.find(p => p.code === code)
}

// More sophisticated tax rate calculation based on income brackets
export function calculateMarginalTaxRate(province: string, netTaxableIncome: number): number {
  const provinceData = getProvinceByCode(province)
  if (!provinceData) return 0.25 // Default fallback

  // Use net taxable income directly (no conversion needed)
  const taxableIncome = netTaxableIncome
  
  // Federal tax brackets (2024)
  let federalRate = 0.15 // Base rate
  if (taxableIncome > 246752) federalRate = 0.33
  else if (taxableIncome > 173205) federalRate = 0.29
  else if (taxableIncome > 111733) federalRate = 0.205
  else if (taxableIncome > 53359) federalRate = 0.205
  
  // Provincial rates vary by province and income - using simplified approach
  const provincialRate = provinceData.provincialTaxRate
  
  // Calculate effective marginal rate (weighted average)
  const totalRate = new Decimal(federalRate).plus(provincialRate)
  
  return totalRate.toNumber()
}

// More accurate tax calculation that considers tiered brackets and basic personal amount
export function calculateAccurateTaxRate(province: string, netTaxableIncome: number): number {
  const provinceData = getProvinceByCode(province)
  if (!provinceData) return 0.25 // Default fallback

  // Basic personal amount (2024) - reduces taxable income
  const basicPersonalAmount = 15000 // Federal basic personal amount
  const adjustedIncome = Math.max(0, netTaxableIncome - basicPersonalAmount)
  
  if (adjustedIncome <= 0) return 0 // No tax if below basic personal amount
  
  // Federal tax brackets (2025) - from Wealthsimple BC Tax Calculator
  const federalBrackets = [
    { threshold: 0, rate: 0.15 },
    { threshold: 55867, rate: 0.205 },
    { threshold: 111733, rate: 0.26 },
    { threshold: 173205, rate: 0.29 },
    { threshold: 246752, rate: 0.33 }
  ]
  
  // Provincial tax brackets (2025) - from Wealthsimple BC Tax Calculator
  const provincialBrackets = {
    'AB': [
      { threshold: 0, rate: 0.10 },
      { threshold: 148600, rate: 0.12 },
      { threshold: 177922, rate: 0.13 },
      { threshold: 237230, rate: 0.14 },
      { threshold: 355845, rate: 0.15 }
    ],
    'BC': [
      { threshold: 0, rate: 0.0506 },
      { threshold: 47937, rate: 0.077 },
      { threshold: 95875, rate: 0.105 },
      { threshold: 110076, rate: 0.1229 },
      { threshold: 133664, rate: 0.147 },
      { threshold: 181232, rate: 0.168 },
      { threshold: 252752, rate: 0.205 }
    ],
    'ON': [
      { threshold: 0, rate: 0.0505 },
      { threshold: 49231, rate: 0.0915 },
      { threshold: 98463, rate: 0.1116 },
      { threshold: 150000, rate: 0.1216 },
      { threshold: 220000, rate: 0.1316 }
    ],
    'MB': [
      { threshold: 0, rate: 0.108 },
      { threshold: 36832, rate: 0.1275 },
      { threshold: 79625, rate: 0.174 }
    ],
    'NB': [
      { threshold: 0, rate: 0.0968 },
      { threshold: 47715, rate: 0.1482 },
      { threshold: 95431, rate: 0.1652 },
      { threshold: 176756, rate: 0.1784 }
    ],
    'NL': [
      { threshold: 0, rate: 0.087 },
      { threshold: 41447, rate: 0.145 },
      { threshold: 82894, rate: 0.158 },
      { threshold: 148027, rate: 0.173 },
      { threshold: 207239, rate: 0.183 },
      { threshold: 264750, rate: 0.208 }
    ],
    'NS': [
      { threshold: 0, rate: 0.0875 },
      { threshold: 29590, rate: 0.1495 },
      { threshold: 59180, rate: 0.1667 },
      { threshold: 93000, rate: 0.175 },
      { threshold: 150000, rate: 0.21 }
    ],
    'PE': [
      { threshold: 0, rate: 0.098 },
      { threshold: 31984, rate: 0.138 },
      { threshold: 63968, rate: 0.167 }
    ],
    'QC': [
      { threshold: 0, rate: 0.14 },
      { threshold: 49275, rate: 0.19 },
      { threshold: 98540, rate: 0.24 },
      { threshold: 119910, rate: 0.2575 }
    ],
    'SK': [
      { threshold: 0, rate: 0.105 },
      { threshold: 52057, rate: 0.125 },
      { threshold: 148734, rate: 0.145 }
    ],
    'NT': [
      { threshold: 0, rate: 0.059 },
      { threshold: 48326, rate: 0.086 },
      { threshold: 96655, rate: 0.122 },
      { threshold: 157139, rate: 0.1405 }
    ],
    'NU': [
      { threshold: 0, rate: 0.04 },
      { threshold: 53359, rate: 0.07 },
      { threshold: 106717, rate: 0.09 },
      { threshold: 165430, rate: 0.115 }
    ],
    'YT': [
      { threshold: 0, rate: 0.064 },
      { threshold: 53359, rate: 0.09 },
      { threshold: 106717, rate: 0.109 },
      { threshold: 165430, rate: 0.128 },
      { threshold: 500000, rate: 0.15 }
    ]
  }
  
  // Find the marginal federal rate
  let federalRate = 0.15
  for (let i = federalBrackets.length - 1; i >= 0; i--) {
    if (adjustedIncome > federalBrackets[i].threshold) {
      federalRate = federalBrackets[i].rate
      break
    }
  }
  
  // Find the marginal provincial rate
  let provincialRate = provinceData.provincialTaxRate // Default to simplified rate
  const provinceBrackets = provincialBrackets[province as keyof typeof provincialBrackets]
  if (provinceBrackets) {
    // For BC, we need to handle the basic personal amount differently
    if (province === 'BC') {
      // BC has its own basic personal amount that affects provincial tax
      const bcBasicPersonalAmount = 15000 // BC basic personal amount
      const bcAdjustedIncome = Math.max(0, netTaxableIncome - bcBasicPersonalAmount)
      if (bcAdjustedIncome <= 0) {
        provincialRate = 0
      } else {
        // Find the correct BC bracket for the adjusted income
        for (let i = provinceBrackets.length - 1; i >= 0; i--) {
          if (bcAdjustedIncome > provinceBrackets[i].threshold) {
            provincialRate = provinceBrackets[i].rate
            break
          }
        }
      }
    } else {
      // Other provinces use the federal adjusted income
      for (let i = provinceBrackets.length - 1; i >= 0; i--) {
        if (adjustedIncome > provinceBrackets[i].threshold) {
          provincialRate = provinceBrackets[i].rate
          break
        }
      }
    }
  }
  
  // Calculate total marginal rate
  const totalRate = new Decimal(federalRate).plus(provincialRate)
  
  return totalRate.toNumber()
}

export function calculateMortgagePayment(principal: number, rate: number, years: number): number {
  const monthlyRate = new Decimal(rate).dividedBy(100).dividedBy(12)
  const numberOfPayments = new Decimal(years).times(12)
  
  if (monthlyRate.equals(0)) {
    return new Decimal(principal).dividedBy(numberOfPayments).toNumber()
  }
  
  const payment = new Decimal(principal)
    .times(monthlyRate)
    .times(new Decimal(1).plus(monthlyRate).pow(numberOfPayments))
    .dividedBy(new Decimal(1).plus(monthlyRate).pow(numberOfPayments).minus(1))
  
  return payment.toNumber()
}

// Calculate rental property cash flow and tax deductions
export function calculateRentalPropertyMetrics(property: any, taxRate: number) {
  const monthlyRent = new Decimal(property.monthlyRent || 0)
  const monthlyMaintenance = new Decimal(property.monthlyMaintenanceFees || 0)
  const monthlyPropertyTax = new Decimal(property.monthlyPropertyTax || 0)
  const monthlyInsurance = new Decimal(property.monthlyInsurance || 0)
  const monthlyUtilities = new Decimal(property.monthlyUtilities || 0)
  const monthlyManagementFees = new Decimal(property.propertyManagementFees || 0)
  
  // Calculate rental property mortgage interest using the dedicated field
  const property2MortgageRate = new Decimal(property.property2MortgageInterest || 0).dividedBy(100).dividedBy(12)
  const property2MortgageBalance = new Decimal(property.property2MortgageAmount || property.currentAmountOwing || property.mortgageAmount || 0)
  const monthlyProperty2MortgageInterest = property2MortgageBalance.times(property2MortgageRate)
  
  // Calculate HELOC downpayment interest cost
  const helocDownpaymentRate = new Decimal(property.helocDownpaymentInterest || 0).dividedBy(100).dividedBy(12)
  const downpaymentAmount = new Decimal(property.downpaymentAmount || 0)
  const monthlyHelocDownpaymentInterest = downpaymentAmount.times(helocDownpaymentRate)
  
  // Smith Manoeuvre: ALL rental income goes to primary mortgage principal
  const monthlyCashFlow = monthlyRent
  
  // Monthly expenses (paid via HELOC, not from rental income)
  const monthlyExpenses = monthlyMaintenance
    .plus(monthlyPropertyTax)
    .plus(monthlyInsurance)
    .plus(monthlyUtilities)
    .plus(monthlyManagementFees)
    .plus(monthlyProperty2MortgageInterest) // Property 2 mortgage interest is deductible
    .plus(monthlyHelocDownpaymentInterest) // HELOC downpayment interest is deductible
  
  // Annual tax deductions (HELOC interest on rental expenses is deductible)
  const annualTaxDeductions = monthlyExpenses.times(12)
  
  // Net rental income after tax deductions
  const netRentalIncome = monthlyCashFlow.times(12).plus(annualTaxDeductions.times(taxRate))
  
  return {
    monthlyCashFlow: monthlyCashFlow.toNumber(), // ALL rental income for primary mortgage
    annualTaxDeductions: annualTaxDeductions.toNumber(), // HELOC expenses for tax deduction
    netRentalIncome: netRentalIncome.toNumber(),
    effectiveMonthlyRent: monthlyRent.toNumber(), // Same as monthlyCashFlow
    monthlyExpenses: monthlyExpenses.toNumber(), // Paid via HELOC
    monthlyRentalMortgageInterest: monthlyProperty2MortgageInterest.toNumber(),
    // New financing details
    downpaymentAmount: downpaymentAmount.toNumber(),
    helocDownpaymentInterest: monthlyHelocDownpaymentInterest.times(12).toNumber(),
    property2MortgageAmount: property2MortgageBalance.toNumber(),
    property2MortgageInterest: monthlyProperty2MortgageInterest.times(12).toNumber()
  }
}

export async function calculateSmithManoeuvre(inputs: CalculatorInputs): Promise<CalculationResults> {
  const debugData: any = {
    inputs: inputs,
    calculations: {}
  }
  
  const primary = inputs.primaryProperty
  const income = inputs.income
  const property2 = inputs.property2
  const helocRate = new Decimal(inputs.helocInterestRate || 7.2) // Use user-provided rate or default to 7.2%
  
  debugData.calculations.primaryProperty = {
    mortgageAmount: primary.mortgageAmount,
    interestRate: primary.interestRate,
    amortizationYears: primary.amortizationYears,
    currentAmountOwing: primary.currentAmountOwing,
    propertyValue: primary.propertyValue
  }
  
  debugData.calculations.income = {
    province: income.province,
    netTaxableIncome: income.netTaxableIncome,
    otherTaxableIncome: income.otherTaxableIncome,
    marginalTaxRate: income.marginalTaxRate
  }
  
  // Calculate monthly mortgage payment
  const monthlyPayment = new Decimal(primary.monthlyPayment || 
    calculateMortgagePayment(primary.mortgageAmount, primary.interestRate, primary.amortizationYears))
  
  debugData.calculations.monthlyPayment = {
    calculatedPayment: monthlyPayment.toNumber(),
    providedPayment: primary.monthlyPayment
  }
  
  // Calculate monthly interest portion (more accurate calculation)
  // In early years, most of payment goes to interest
  const monthlyRate = new Decimal(primary.interestRate).dividedBy(100).dividedBy(12)
  const remainingBalance = new Decimal(primary.currentAmountOwing || primary.mortgageAmount)
  const monthlyInterest = remainingBalance.times(monthlyRate)
  
  debugData.calculations.interest = {
    monthlyRate: monthlyRate.toNumber(),
    remainingBalance: remainingBalance.toNumber(),
    monthlyInterest: monthlyInterest.toNumber()
  }
  
  // Calculate annual interest
  const annualInterest = monthlyInterest.times(12)
  
  // IMPORTANT: Primary residence mortgage interest is NOT tax deductible in Canada
  // The Smith Manoeuvre works by converting non-deductible mortgage interest into deductible investment loan interest
  const primaryMortgageTaxSavings = new Decimal(0) // No tax savings on primary mortgage interest
  
  // Calculate equity gained through regular payments
  const monthlyPrincipal = monthlyPayment.minus(monthlyInterest)
  let equityGained = monthlyPrincipal.times(12)
  
  debugData.calculations.equity = {
    monthlyPrincipal: monthlyPrincipal.toNumber(),
    annualEquityGained: equityGained.toNumber()
  }
  
  // Calculate HELOC interest on the equity borrowed for investments
  const helocInterest = equityGained.times(helocRate).dividedBy(100)
  
  debugData.calculations.heloc = {
    helocRate: helocRate.toNumber(),
    helocInterest: helocInterest.toNumber()
  }
  
  // HELOC interest is tax deductible when used for investment purposes
  const primaryTaxRate = new Decimal(calculateAccurateTaxRate(income.province, income.netTaxableIncome))
  const helocTaxDeduction = helocInterest.times(primaryTaxRate)
  
  debugData.calculations.tax = {
    primaryTaxRate: primaryTaxRate.toNumber(),
    helocTaxDeduction: helocTaxDeduction.toNumber()
  }
  
  // Net tax benefit from HELOC interest deduction (Primary Individual)
  const primaryNetTaxBenefit = helocTaxDeduction
  
  // Calculate total additional monthly payment available for primary mortgage
  let totalAdditionalMonthlyPayment = primaryNetTaxBenefit.dividedBy(12) // HELOC tax savings
  
  // Property 2 calculations (if exists)
  let rentalPropertyCashFlow = 0
  let rentalPropertyTaxDeductions = 0
  let netRentalIncome = 0
  let primaryTaxCredits = 0
  let primaryTaxSavings = 0
  let primaryIncreasedTaxableIncome = 0
  let spouseTaxCredits = 0
  let spouseTaxSavings = 0
  let spouseIncreasedTaxableIncome = 0
  let householdTaxBenefit = 0
  // Property 2 financing details
  let downpaymentAmount = 0
  let helocDownpaymentInterest = 0
  let property2MortgageAmount = 0
  let property2MortgageInterest = 0
  
  if (property2 && property2.monthlyRent) {
    // Calculate rental property metrics
    const rentalMetrics = calculateRentalPropertyMetrics(property2, 0) // We'll calculate tax rates separately
    
    rentalPropertyCashFlow = rentalMetrics.monthlyCashFlow
    rentalPropertyTaxDeductions = rentalMetrics.annualTaxDeductions
    netRentalIncome = rentalMetrics.netRentalIncome
    // Set financing details
    downpaymentAmount = rentalMetrics.downpaymentAmount
    helocDownpaymentInterest = rentalMetrics.helocDownpaymentInterest
    property2MortgageAmount = rentalMetrics.property2MortgageAmount
    property2MortgageInterest = rentalMetrics.property2MortgageInterest
    
    // Calculate ownership percentages (default to 100% primary if no spouse)
    const primaryPercentage = inputs.spouse ? inputs.primaryOwnerPercentage : 100
    const spousePercentage = inputs.spouse ? inputs.spousePercentage : 0
    
    debugData.calculations.ownershipPercentages = {
      primaryPercentage,
      spousePercentage,
      hasSpouse: !!inputs.spouse,
      spouseNetTaxableIncome: inputs.spouse?.netTaxableIncome || 0
    }
    
    // Calculate tax rates for both individuals
    const spouseProvince = inputs.income.province // Assume same province for simplicity
    const spouseTaxRate = inputs.spouse ? calculateAccurateTaxRate(spouseProvince, inputs.spouse.netTaxableIncome) : 0
    const primaryTaxRate = new Decimal(income.marginalTaxRate)
    
    // Calculate rental income allocation
    const totalRentalIncome = new Decimal(rentalMetrics.effectiveMonthlyRent).times(12)
    const primaryRentalIncome = totalRentalIncome.times(primaryPercentage).dividedBy(100)
    const spouseRentalIncome = totalRentalIncome.times(spousePercentage).dividedBy(100)
    
    // Calculate tax on rental income for each person
    const primaryTaxOnRentalIncome = primaryRentalIncome.times(primaryTaxRate)
    const spouseTaxOnRentalIncome = spouseRentalIncome.times(spouseTaxRate)
    
    // Calculate tax credits allocation (same percentages as ownership)
    const totalTaxCredits = new Decimal(rentalMetrics.annualTaxDeductions)
    const primaryTaxCreditsDecimal = totalTaxCredits.times(primaryPercentage).dividedBy(100)
    const spouseTaxCreditsDecimal = totalTaxCredits.times(spousePercentage).dividedBy(100)
    
    // Calculate tax savings from credits for each person
    const primaryTaxSavingsFromCredits = primaryTaxCreditsDecimal.times(primaryTaxRate)
    const spouseTaxSavingsFromCredits = spouseTaxCreditsDecimal.times(spouseTaxRate)
    
    // Calculate net tax impact for each person
    primaryTaxCredits = primaryTaxCreditsDecimal.toNumber()
    primaryTaxSavings = primaryTaxSavingsFromCredits.minus(primaryTaxOnRentalIncome).plus(helocTaxDeduction).toNumber()
    primaryIncreasedTaxableIncome = primaryRentalIncome.toNumber()
    
    spouseTaxCredits = spouseTaxCreditsDecimal.toNumber()
    spouseTaxSavings = spouseTaxSavingsFromCredits.minus(spouseTaxOnRentalIncome).toNumber()
    spouseIncreasedTaxableIncome = spouseRentalIncome.toNumber()
    
    debugData.calculations.percentageAllocation = {
      primaryPercentage,
      spousePercentage,
      primaryRentalIncome: primaryRentalIncome.toNumber(),
      spouseRentalIncome: spouseRentalIncome.toNumber(),
      primaryTaxOnRentalIncome: primaryTaxOnRentalIncome.toNumber(),
      spouseTaxOnRentalIncome: spouseTaxOnRentalIncome.toNumber(),
      primaryTaxCredits: primaryTaxCreditsDecimal.toNumber(),
      spouseTaxCredits: spouseTaxCreditsDecimal.toNumber(),
      primaryTaxSavingsFromCredits: primaryTaxSavingsFromCredits.toNumber(),
      spouseTaxSavingsFromCredits: spouseTaxSavingsFromCredits.toNumber()
    }
    
    // Add rental income to primary individual's additional payment (rental income helps pay primary mortgage)
    totalAdditionalMonthlyPayment = totalAdditionalMonthlyPayment.plus(new Decimal(rentalMetrics.monthlyCashFlow))
    
    // Calculate household total
    householdTaxBenefit = primaryTaxSavings + spouseTaxSavings
    
    debugData.calculations.finalTaxBreakdown = {
      primaryTaxCredits,
      primaryTaxSavings,
      spouseTaxCredits,
      spouseTaxSavings,
      householdTaxBenefit
    }
    
    // Add rental income to equity building capacity (rental income builds equity in primary property)
    const additionalEquity = new Decimal(rentalMetrics.monthlyCashFlow).times(12) // 100% of rental income
    equityGained = equityGained.plus(additionalEquity)
    
  } else {
    // No rental property - only HELOC benefits
    primaryTaxCredits = 0
    primaryTaxSavings = helocTaxDeduction.toNumber()
    spouseTaxCredits = 0
    spouseTaxSavings = 0
    householdTaxBenefit = primaryTaxSavings
  }
  
  // Monthly cash flow impact (total additional money available for primary mortgage)
  const monthlyCashFlow = totalAdditionalMonthlyPayment
  
  debugData.calculations.finalResults = {
    monthlyCashFlow: monthlyCashFlow.toNumber(),
    householdTaxBenefit,
    equityGained: equityGained.toNumber(),
    totalAdditionalMonthlyPayment: totalAdditionalMonthlyPayment.toNumber()
  }
  
  // Write debug data to file
  writeDebugLog(debugData)
  

  
  return {
    equityGained: equityGained.toNumber(),
    taxSavings: householdTaxBenefit, // Total household tax benefit
    investmentLoanInterest: helocInterest.toNumber(),
    totalSavings: householdTaxBenefit,
    monthlyCashFlow: monthlyCashFlow.toNumber(),
    // Detailed breakdown fields
    monthlyMortgagePayment: monthlyPayment.toNumber(),
    monthlyInterestPortion: monthlyInterest.toNumber(),
    monthlyPrincipalPortion: monthlyPrincipal.toNumber(),
    annualInterestPortion: annualInterest.toNumber(),
    helocInterestCost: helocInterest.toNumber(),
    netTaxBenefit: householdTaxBenefit,
    helocInterestRate: helocRate.toNumber(),
    marginalTaxRate: primaryTaxRate.toNumber(),
    // Property 2 specific results
    rentalPropertyCashFlow,
    rentalPropertyTaxDeductions,
    netRentalIncome,
    // Property 2 financing details
    downpaymentAmount,
    helocDownpaymentInterest,
    property2MortgageAmount,
    property2MortgageInterest,
    // Individual tax breakdown
    primaryTaxCredits,
    primaryTaxSavings,
    primaryIncreasedTaxableIncome,
    spouseTaxCredits,
    spouseTaxSavings,
    spouseIncreasedTaxableIncome,
    householdTaxBenefit,

  }
}
