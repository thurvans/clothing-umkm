import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      setCartCount(0);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      const cartData = response.data.data;
      setCart(cartData.items);
      setCartCount(cartData.summary.totalItems);
    } catch (error) {
      console.error('Fetch cart error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart({ product_id: productId, quantity });
      await fetchCart();
      return { success: true, message: 'Produk berhasil ditambahkan ke keranjang' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menambahkan ke keranjang'
      };
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      await cartAPI.updateCartItem(cartId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal update keranjang'
      };
    }
  };

  const removeItem = async (cartId) => {
    try {
      await cartAPI.removeFromCart(cartId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menghapus item'
      };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart([]);
      setCartCount(0);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const value = {
    cart,
    cartCount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
