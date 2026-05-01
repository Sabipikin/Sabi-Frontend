'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface PaymentCheckoutProps {
  itemType: 'course' | 'program' | 'diploma';
  itemId: number;
  itemName: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  itemType,
  itemId,
  itemName,
  amount,
  currency = 'GBP',
  onSuccess,
  onError
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userToken } = useAuth();

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = userToken;
      if (!token) {
        throw new Error('Please log in to continue');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item_type: itemType,
            item_id: itemId,
            currency: currency.toLowerCase()
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to initiate checkout');
      }

      const data = await response.json();

      if (data.checkout_url) {
        // Redirect to Payoneer checkout
        window.location.href = data.checkout_url;
        onSuccess?.();
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount = (amount / 100).toFixed(2);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Details</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Item</span>
          <span className="font-medium text-gray-800">{itemName}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">Type</span>
          <span className="font-medium text-gray-800 capitalize">{itemType}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-lg font-semibold text-gray-800">Amount</span>
          <span className="text-2xl font-bold text-blue-600">
            {formattedAmount} {currency}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay with Payoneer ${formattedAmount} ${currency}`
        )}
      </button>

      <p className="text-center text-gray-600 text-xs mt-4">
        Powered by Payoneer | Secure Payment Processing
      </p>
    </div>
  );
};

export default PaymentCheckout;
