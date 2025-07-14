export const MOCK_EXTRACT_DATA = {
  summary: {
    availableBalance: 7850.50,
    pendingBalance: 1230.00,
    monthRevenue: 15450.80,
    totalWithdrawals: 3250.00,
  },

  transactions: [
    {
      id: 'TRN1001',
      date: new Date('2025-07-15T14:30:00'),
      description: 'Venda Pedido #A3B45C',
      type: 'credit',
      value: 189.90,
      status: 'completed'
    },
    {
      id: 'TRN1002',
      date: new Date('2025-07-14T11:00:00'),
      description: 'Taxa de processamento',
      type: 'debit',
      value: -5.60,
      status: 'completed'
    },
    {
      id: 'TRN1003',
      date: new Date('2025-07-13T09:15:00'),
      description: 'Saque para conta bancária',
      type: 'debit',
      value: -1500.00,
      status: 'completed'
    },
    {
      id: 'TRN1004',
      date: new Date('2025-07-12T18:00:00'),
      description: 'Venda Pedido #D6E78F',
      type: 'credit',
      value: 79.50,
      status: 'pending'
    },
  ],

  cashFlow: {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    revenue: [5500, 6200, 7800, 7500, 9100, 11500],
    expenses: [2100, 2500, 3000, 2800, 3500, 4200],
  },
};