'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PaymentCheckout from './PaymentCheckout';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  price_formatted: string;
  monthly_price: string;
}

interface PurchaseOptionsProps {
  itemType: 'course' | 'program' | 'diploma';
  itemId: number;
  itemName: string;
  itemPrice: number;
  onClose: () => void;
}

export const PurchaseOptions: React.FC<PurchaseOptionsProps> = ({
  itemType,
  itemId,
  itemName,
  itemPrice,
  onClose
}) => {
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);
  const [showSubscriptionOptions, setShowSubscriptionOptions] = useState(false);
  const { userToken } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscriptions/plans`
        );
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        console.error('Failed to load subscription plans:', err);
        setError('Unable to load subscription options');
      } finally {
        setLoadingPlans(false);
      }
    };

    if (showSubscriptionOptions) {
      fetchPlans();
    }
  }, [showSubscriptionOptions]);

  if (showPayment) {
    return (
      <PaymentCheckout
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        amount={itemPrice}
        currency="GBP"
        onSuccess={() => {
          onClose();
          setTimeout(() => {
            router.push(`/learning?courseId=${itemId}`);
          }, 1000);
        }}
        onError={(error) => {
          alert(`Payment error: ${error}`);
        }}
      />
    );
  }

  const formattedItemPrice = (itemPrice / 100).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Get {itemName}</h2>
        <p className="text-gray-400">Choose how you want to access this {itemType}</p>
      </div>

      {!showSubscriptionOptions ? (
        <>
          {/* Option 1: Buy Individual Item */}
          <div className="border-2 border-cyan-500 rounded-lg p-6 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
            onClick={() => setShowPayment(true)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Buy This {itemType.charAt(0).toUpperCase() + itemType.slice(1)}</h3>
                <p className="text-gray-400 text-sm">One-time purchase for this {itemType} only</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-cyan-400">£{formattedItemPrice}</div>
                <div className="text-xs text-gray-500 mt-1">One-time payment</div>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-cyan-400 mr-2">✓</span>
                Access to this {itemType} immediately
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-cyan-400 mr-2">✓</span>
                Learn at your own pace
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-cyan-400 mr-2">✓</span>
                Download course materials
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-cyan-400 mr-2">✓</span>
                Earn certificate upon completion
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
              Pay £{formattedItemPrice} Now
            </button>
          </div>

          {/* Option 2: Subscribe */}
          <div className="border-2 border-purple-500 rounded-lg p-6 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
            onClick={() => setShowSubscriptionOptions(true)}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Subscribe for Unlimited Access</h3>
                <p className="text-gray-400 text-sm">Get all courses + programs + diplomas</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-2">Starting from</div>
                <div className="text-2xl font-bold text-purple-400">See Plans →</div>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-purple-400 mr-2">✓</span>
                Access ALL courses, programs & diplomas
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-purple-400 mr-2">✓</span>
                New content added every month
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-purple-400 mr-2">✓</span>
                Save money vs individual purchases
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <span className="text-purple-400 mr-2">✓</span>
                Cancel anytime, no lock-in
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
              View Plans
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-gray-400 hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          {/* Subscription Plans */}
          <button
            onClick={() => setShowSubscriptionOptions(false)}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium mb-4 flex items-center"
          >
            ← Back to options
          </button>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loadingPlans ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-gray-400 mt-2">Loading subscription plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No subscription plans available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-purple-500 rounded-lg p-4 bg-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
                  onClick={() => {
                    // Trigger subscription checkout with this plan
                    const token = userToken;
                    if (!token) {
                      alert('Please log in to subscribe');
                      return;
                    }
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscriptions/checkout?plan_id=${plan.id}`;
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">{plan.name}</h4>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{plan.duration_days} days access</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{plan.price_formatted}</div>
                      <div className="text-xs text-gray-500">({plan.monthly_price}/month)</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-gray-400 hover:text-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default PurchaseOptions;
