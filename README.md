# Smith Manoeuvre Calculator

A comprehensive web application for calculating the Smith Manoeuvre strategy, a Canadian real estate investment technique that converts non-deductible mortgage interest into tax-deductible investment loan interest.

## Features

- **Property Input**: Enter details for primary property and optional second property
- **Income Information**: Include province of residence, annual income, and other income sources
- **Spouse/Partner Support**: Optional spouse income and tax information
- **Real-time Calculations**: Instant calculation of potential tax savings and equity gains

- **Canadian Tax Integration**: Provincial and federal tax rate calculations
- **Professional UI**: Clean, modern interface with responsive design

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Calculations**: Decimal.js for precise financial calculations
- **Icons**: Lucide React
- **Deployment**: Ready for Vercel, Netlify, or other platforms

## Getting Started

### Prerequisites

- Node.js 18+ (though there may be some installation issues on macOS - see troubleshooting)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smithy-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting

If you encounter Node.js library issues on macOS (like ICU library errors), try:

1. Reinstall Node.js using Homebrew:
```bash
brew uninstall node
brew install node
```

2. Or use Node Version Manager (nvm):
```bash
nvm install 18
nvm use 18
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles with Tailwind
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main page component
├── components/         # React components
│   ├── CalculatorForm.tsx    # Main input form
│   └── ResultsDisplay.tsx    # Results display
├── lib/               # Utility functions
│   └── calculations.ts # Smith Manoeuvre calculations
└── types/             # TypeScript type definitions
    └── index.ts       # Data structure types
```

## Key Components

### CalculatorForm
- Handles all user input for properties, income, and spouse information
- Real-time tax rate calculation based on province and income
- Optional sections for additional properties and spouse information

### ResultsDisplay
- Shows comprehensive calculation results
- Summary cards with key metrics
- Detailed breakdown of savings and costs
- Scenario analysis for different risk levels

### Calculations
- Precise financial calculations using Decimal.js
- Canadian provincial and federal tax rate integration
- Smith Manoeuvre-specific logic for equity and tax savings

## Smith Manoeuvre Strategy

The Smith Manoeuvre is a Canadian real estate investment strategy that:

1. **Accelerates Mortgage Payments**: Uses investment returns to pay down the mortgage faster
2. **Converts Interest**: Transforms non-deductible mortgage interest into tax-deductible investment loan interest
3. **Builds Investment Portfolio**: Creates a growing investment portfolio while paying off the mortgage
4. **Tax Efficiency**: Maximizes tax deductions and savings

## Important Disclaimers

- This calculator provides estimates only and should not be considered as financial advice
- The Smith Manoeuvre involves significant risks and should be discussed with qualified financial professionals
- Tax laws and rates may change, affecting calculation accuracy
- Individual circumstances vary and may affect the suitability of this strategy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please open an issue in the repository.
