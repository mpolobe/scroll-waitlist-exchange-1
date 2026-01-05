
export interface DigitsFinancialReport {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  netIncome: number;
  cashFlow: 'positive' | 'negative';
  lastSync: string;
  aiInsights: string[];
}

export const getDigitsFinancials = async (): Promise<DigitsFinancialReport> => {
  // Simulate API call to Digits AI
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    totalRevenue: 284500.00,
    monthlyRecurringRevenue: 42000.00,
    netIncome: 15000.00,
    cashFlow: 'positive',
    lastSync: new Date().toISOString(),
    aiInsights: [
      "Revenue trending up 12% month-over-month driven by Freight yields.",
      "Operational expenses optimized by 5% via Sui gas efficiency.",
      "Recommended: Increase bond issuance to capitalize on high demand."
    ]
  };
};
