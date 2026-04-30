import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function PaymentCancel() {
  const router = useRouter();
  const { payment_id } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Status */}
        <h1 className="text-center text-2xl font-bold mb-2 text-red-600">Payment Cancelled</h1>
        <p className="text-center text-gray-600 mb-6">
          Your payment has been cancelled. No charge has been made to your account.
        </p>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your order is still pending. If you change your mind, you can retry the payment anytime.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="block text-center py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">Need help?</p>
          <Link href="/support" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
