'use client';

import { useState } from 'react';
import { CreditCard, Check, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PLANS } from '@lade/shared';

const planList = [
  {
    id: 'free' as const,
    name: PLANS.free.name,
    price: `$${PLANS.free.priceMonthly}`,
    key: 'free',
    description: 'Basic SEO tools',
  },
  {
    id: 'pro' as const,
    name: PLANS.pro.name,
    price: `$${PLANS.pro.priceMonthly}`,
    key: 'pro',
    description: 'For professionals',
  },
  {
    id: 'business' as const,
    name: PLANS.business.name,
    price: `$${PLANS.business.priceMonthly}`,
    key: 'business',
    description: 'For growing teams',
  },
  {
    id: 'enterprise' as const,
    name: PLANS.enterprise.name,
    price: 'Custom',
    key: 'enterprise',
    description: 'Custom solution',
  },
];

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState('free');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Billing & Plan</h2>
        <p className="text-surface-500 mt-1">Manage your subscription and billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {planList.map((plan) => (
          <Card
            key={plan.id}
            className={`relative cursor-pointer transition-all hover:shadow-md ${
              selectedPlan === plan.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardContent className="py-6 text-center">
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3">
                  <Check size={18} className="text-primary-500" />
                </div>
              )}
              {plan.id === 'pro' && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-medium px-3 py-0.5 rounded-full">Popular</span>
                </div>
              )}
              <div className="mb-4">
                {plan.id === 'enterprise' ? <Building2 size={32} className="mx-auto text-surface-400" /> : <Zap size={32} className="mx-auto text-primary-500" />}
              </div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">{plan.name}</h3>
              <p className="text-3xl font-bold mt-2 text-surface-900 dark:text-surface-100">
                {plan.id === 'free' ? 'Free' : plan.price}
              </p>
              <p className="text-sm text-surface-500 mt-1">/month</p>
              <p className="text-sm text-surface-500 mt-2">{plan.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Current Plan</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-surface-900 dark:text-surface-100">
                {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
              </p>
              <p className="text-sm text-surface-500 mt-1">
                AI Credits: {PLANS[selectedPlan as keyof typeof PLANS]?.aiCredits === -1 ? 'Unlimited' : `0 / ${PLANS[selectedPlan as keyof typeof PLANS]?.aiCredits}`}
              </p>
            </div>
            <Button>{selectedPlan === 'free' ? 'Upgrade' : 'Manage'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
