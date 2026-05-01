'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

interface CartItem {
  id: number;
  item_type: 'course' | 'program' | 'diploma';
  course_id?: number;
  program_id?: number;
  diploma_id?: number;
  price: number;
  discount: number;
  quantity: number;
  title?: string;
  description?: string;
}

export default function Checkout() {
  const { token, user } = useAuth();
  const { items, removeFromCart, getTotal, clearCart } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<number | null>(null);
  const router = useRouter();

  // Fetch item details for cart items
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const detailedItems: CartItem[] = [];

        for (const item of items) {
          let title = '';
          let description = '';

          if (item.item_type === 'course' && item.course_id) {
            const response = await fetch(`/api/courses/${item.course_id}`);
            if (response.ok) {
              const course = await response.json();
              title = course.title;
              description = course.description;
            }
          } else if (item.item_type === 'program' && item.program_id) {
            const response = await fetch(`/api/programs/${item.program_id}`);
            if (response.ok) {
              const program = await response.json();
              title = program.title;
              description = program.short_description || program.description;
            }
          } else if (item.item_type === 'diploma' && item.diploma_id) {
            const response = await fetch(`/api/diplomas/${item.diploma_id}`);
            if (response.ok) {
              const diploma = await response.json();
              title = diploma.title;
              description = diploma.short_description || diploma.description;
            }
          }

          detailedItems.push({
            ...item,
            title,
            description,
          });
        }

        setCartItems(detailedItems);
      } catch (error) {
        console.error('Failed to fetch item details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [items]);

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      alert('Failed to remove item from cart');
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      router.push('/login?next=/checkout');
      return;
    }

    setProcessing(true);
    try {
      // For now, just clear cart and redirect to dashboard
      // In a real implementation, this would process payment
      clearCart();
      router.push('/dashboard?message=Purchase successful');
    } catch (error) {
      alert('Failed to process checkout');
    } finally {
      setProcessing(false);
    }
  };

  const total = getTotal();
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cartItems.reduce((sum, item) => sum + (item.discount * item.quantity), 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
            <p className="text-gray-400 mb-8">Add some courses to get started!</p>
            <Link
              href="/courses"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Your Cart</h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{item.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                        <span>Quantity: {item.quantity}</span>
                        <span>Type: {item.item_type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        ${((item.price - item.discount) / 100).toFixed(2)}
                      </div>
                      {item.discount > 0 && (
                        <div className="text-green-400 text-sm">
                          Save ${(item.discount / 100).toFixed(2)}
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-${(discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Subscription Option */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Choose Payment Option</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="pay_per_item"
                      checked={!subscriptionPlan}
                      onChange={() => setSubscriptionPlan(null)}
                      className="mr-3"
                    />
                    <span className="text-gray-300">Pay per item</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="subscription"
                      checked={!!subscriptionPlan}
                      onChange={() => setSubscriptionPlan(1)} // Basic plan
                      className="mr-3"
                    />
                    <span className="text-gray-300">Monthly subscription (£9.99/month)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
              >
                {processing ? 'Processing...' : token ? 'Complete Purchase' : 'Sign in to Checkout'}
              </button>

              {!token && (
                <p className="text-gray-400 text-sm mt-3 text-center">
                  Sign in to complete your purchase
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}