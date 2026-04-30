import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function PaymentSuccess() {
  const router = useRouter();
  const { payment_id } = router.query;
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payment_id) return;

    const fetchPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Please log in');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/status/${payment_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }

        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [payment_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block">
            <svg
              className="animate-spin h-12 w-12 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard" className="block text-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = paymentDetails?.status === 'completed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className={`flex items-center justify-center h-16 w-16 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {isCompleted ? (
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              </svg>
            )}
          </div>
        </div>

        {/* Status */}
        <h1 className={`text-center text-2xl font-bold mb-2 ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
          {isCompleted ? 'Payment Successful!' : 'Payment Processing...'}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {isCompleted
            ? 'Your payment has been processed successfully. You now have access to your purchased content.'
            : 'Your payment is being processed. You will receive a confirmation email shortly.'}
        </p>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-medium text-gray-900">{paymentDetails.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-gray-900">
                {(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Item Type:</span>
              <span className="font-medium text-gray-900 capitalize">{paymentDetails.item_type}</span>
            </div>
            {paymentDetails.transaction_id && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-gray-900 text-xs">{paymentDetails.transaction_id}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={paymentDetails?.item_type === 'course' ? '/my-courses' : paymentDetails?.item_type === 'program' ? '/programs' : '/diplomas'}
            className="block text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Go to {paymentDetails?.item_type === 'course' ? 'My Courses' : paymentDetails?.item_type === 'program' ? 'Programs' : 'Diplomas'}
          </Link>
          <Link
            href="/dashboard"
            className="block text-center py-3 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          A confirmation email has been sent to your email address
        </p>
      </div>
    </div>
  );
}
