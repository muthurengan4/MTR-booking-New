import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mtr_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [loading, setLoading] = useState(false);
  
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('mtr_cart_session_id');
    if (!sid) {
      sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mtr_cart_session_id', sid);
    }
    return sid;
  });

  // Sync to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('mtr_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Try to sync with server on mount
  useEffect(() => {
    syncCartWithServer();
  }, []);

  const syncCartWithServer = async () => {
    try {
      const response = await api.get(`/api/cart/${sessionId}`);
      if (response.data && response.data.length > 0) {
        // Server has items, merge with local
        const serverItems = response.data;
        const localItems = cartItems;
        
        // Merge: keep server items, add local items that aren't on server
        const mergedItems = [...serverItems];
        localItems.forEach(localItem => {
          const exists = serverItems.some(s => s.item_id === localItem.item_id && s.item_type === localItem.item_type);
          if (!exists) {
            mergedItems.push(localItem);
          }
        });
        setCartItems(mergedItems);
      }
    } catch (error) {
      console.log('Using local cart (server sync failed):', error.message);
    }
  };

  const addToCart = useCallback(async (item) => {
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      item_type: item.type || 'product',
      item_id: item.id,
      item_name: item.name,
      item_details: item.details || {},
      quantity: item.quantity || 1,
      unit_price: item.price,
      total_price: item.totalPrice || (item.price * (item.quantity || 1))
    };

    // Check if item already exists
    const existingIndex = cartItems.findIndex(
      c => c.item_id === item.id && c.item_type === (item.type || 'product')
    );

    if (existingIndex >= 0) {
      // Update existing item
      if (item.type === 'product') {
        setCartItems(prev => prev.map((c, i) => 
          i === existingIndex 
            ? { ...c, quantity: c.quantity + (item.quantity || 1), total_price: c.unit_price * (c.quantity + (item.quantity || 1)) }
            : c
        ));
      }
      // For accommodations and activities, don't add duplicate
      return { success: true, message: 'Item already in cart' };
    }

    // Add new item to state
    setCartItems(prev => [...prev, newItem]);

    // Try to sync with server (non-blocking)
    try {
      await api.post('/api/cart/add', {
        session_id: sessionId,
        item_type: newItem.item_type,
        item_id: newItem.item_id,
        item_name: newItem.item_name,
        item_details: newItem.item_details,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
        total_price: newItem.total_price
      });
    } catch (error) {
      console.log('Cart saved locally (server sync pending)');
    }

    return { success: true };
  }, [cartItems, sessionId]);

  const removeFromCart = useCallback(async (cartItemId) => {
    const item = cartItems.find(c => c.id === cartItemId);
    setCartItems(prev => prev.filter(c => c.id !== cartItemId));

    // Try to sync with server
    try {
      if (item?.id && !item.id.startsWith('item_')) {
        await api.delete(`/api/cart/${cartItemId}`);
      }
    } catch (error) {
      console.log('Item removed locally');
    }
  }, [cartItems]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    setCartItems(prev => prev.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity, total_price: item.unit_price * quantity }
        : item
    ));

    // Try to sync with server
    try {
      await api.put(`/api/cart/${cartItemId}?quantity=${quantity}`);
    } catch (error) {
      console.log('Quantity updated locally');
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem('mtr_cart_items');

    try {
      await api.delete(`/api/cart/clear/${sessionId}`);
    } catch (error) {
      console.log('Cart cleared locally');
    }
  }, [sessionId]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.total_price) || 0), 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 1), 0);
  }, [cartItems]);

  const isInCart = useCallback((itemId, itemType) => {
    return cartItems.some(c => c.item_id === itemId && c.item_type === itemType);
  }, [cartItems]);

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
    isInCart,
    syncCartWithServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
