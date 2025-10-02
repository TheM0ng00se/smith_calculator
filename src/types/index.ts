export interface PropertyDetails {
  mortgageAmount: number
  interestRate: number
  amortizationYears: number
  currentAmountOwing: number
  propertyValue: number
  monthlyPayment: number
  // Rental property specific fields
  monthlyRent?: number
  monthlyMaintenanceFees?: number
  monthlyPropertyTax?: number
  monthlyInsurance?: number
  monthlyUtilities?: number
  propertyManagementFees?: number
  // Property 2 financing details
  downpaymentAmount?: number
  helocDownpaymentInterest?: number
  property2MortgageAmount?: number
  property2MortgageInterest?: number
}

export interface IncomeDetails {
  province: string
  netTaxableIncome: number // Gross income minus RRSPs, pensions, etc.
  otherTaxableIncome: number // Other taxable income sources
  marginalTaxRate: number // This will be auto-calculated
}

export interface SpouseDetails {
  netTaxableIncome: number // Gross income minus RRSPs, pensions, etc.
  otherTaxableIncome: number // Other taxable income sources
  marginalTaxRate: number // This will be auto-calculated
}

export interface CalculatorInputs {
  primaryProperty: PropertyDetails
  income: IncomeDetails
  property2?: PropertyDetails
  spouse?: SpouseDetails
  helocInterestRate: number // User-customizable HELOC rate
  // Rental property ownership percentages (must add up to 100%)
  primaryOwnerPercentage: number // Primary owner's percentage of rental property
  spousePercentage: number // Spouse's percentage of rental property
  rentalIncomeToSpouse: boolean // Whether rental income goes to spouse
}

export interface CalculationResults {
  equityGained: number
  taxSavings: number
  investmentLoanInterest: number
  totalSavings: number
  monthlyCashFlow: number
  // Detailed breakdown fields
  monthlyMortgagePayment: number
  monthlyInterestPortion: number
  monthlyPrincipalPortion: number
  annualInterestPortion: number
  helocInterestCost: number
  netTaxBenefit: number
  helocInterestRate: number
  marginalTaxRate: number
  // Property 2 specific results
  rentalPropertyCashFlow?: number
  rentalPropertyTaxDeductions?: number
  netRentalIncome?: number
  // Property 2 financing details
  downpaymentAmount?: number
  helocDownpaymentInterest?: number
  property2MortgageAmount?: number
  property2MortgageInterest?: number
  // Individual tax breakdown
  primaryTaxCredits: number
  primaryTaxSavings: number
  primaryIncreasedTaxableIncome: number
  spouseTaxCredits: number
  spouseTaxSavings: number
  spouseIncreasedTaxableIncome: number
  householdTaxBenefit: number

}

export interface Province {
  name: string
  code: string
  federalTaxRate: number
  provincialTaxRate: number
}
