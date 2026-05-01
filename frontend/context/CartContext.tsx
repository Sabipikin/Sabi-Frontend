'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: number;
  item_type: 'course' | 'program' | 'diploma';
  course_id?: number;
  program_id?: number;
  diploma_id?: number;
  price: number;
  discount: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  loading: boolean;
  mergeCartToUser: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    setLoading(true);
    try {
      // Check if item already exists
      const existingIndex = items.findIndex(
        (cartItem) =>
          cartItem.item_type === item.item_type &&
          cartItem.course_id === item.course_id &&
          cartItem.program_id === item.program_id &&
          cartItem.diploma_id === item.diploma_id
      );

      if (existingIndex >= 0) {
        // Update quantity
        const updatedItems = [...items];
        updatedItems[existingIndex].quantity += item.quantity;
        setItems(updatedItems);
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          id: Date.now(), // Simple ID generation
        };
        setItems([...items, newItem]);
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    setLoading(true);
    try {
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const discountedPrice = item.price - item.discount;
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const mergeCartToUser = async () => {
    // TODO: Implement cart merging with backend when user logs in
    // For now, just keep the local cart
    console.log('Cart merge functionality - to be implemented');
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getTotal,
    getItemCount,
    loading,
    mergeCartToUser,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};