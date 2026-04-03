export const PLANS = {
  starter: {
    name: 'Starter Plan',
    price: 999,
    days: 30,
  },
  growth: {
    name: 'Growth Plan',
    price: 2499,
    days: 60,
  },
  elite: {
    name: 'Elite Plan',
    price: 4999,
    days: 90,
  },
};

export type PlanId = keyof typeof PLANS;
