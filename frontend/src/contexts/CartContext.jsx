import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    // Get or create session ID
    let sid = localStorage.getItem('cart_session_id');
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cart_session_id', sid);
    }
    return sid;
  });

  // Load cart from API on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/cart/${sessionId}`);
      setCartItems(response.data || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Fall back to local storage
      const localCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const cartItem = {
        session_id: sessionId,
        item_type: item.type || 'product',
        item_id: item.id,
        item_name: item.name,
        item_details: item.details || {},
        quantity: item.quantity || 1,
        unit_price: item.price,
        total_price: item.totalPrice || (item.price * (item.quantity || 1))
      };

      const response = await api.post('/api/cart/add', cartItem);
      
      if (response.data?.success) {
        await loadCart();
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Fall back to local state
      const newItem = {
        id: 'local_' + Date.now(),
        item_type: item.type || 'product',
        item_id: item.id,
        item_name: item.name,
        item_details: item.details || {},
        quantity: item.quantity || 1,
        unit_price: item.price,
        total_price: item.totalPrice || (item.price * (item.quantity || 1))
      };
      setCartItems(prev => [...prev, newItem]);
      localStorage.setItem('cart_items', JSON.stringify([...cartItems, newItem]));
    }
    return { success: true };
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/api/cart/${cartItemId}`);
      await loadCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      // Fall back to local state
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(cartItemId);
        return;
      }
      await api.put(`/api/cart/${cartItemId}?quantity=${quantity}`);
      await loadCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Fall back to local state
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity, total_price: item.unit_price * quantity }
          : item
      ));
    }
  };

  const clearCart = async () => {
    try {
      await api.delete(`/api/cart/clear/${sessionId}`);
      setCartItems([]);
      localStorage.removeItem('cart_items');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setCartItems([]);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  const value = {
    cartItems,
    loading,
    sessionId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
