import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api.js';

const CartContext = createContext();

// Cart actions
export const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  SET_SESSION_ID: 'SET_SESSION_ID',
  TOGGLE_CART: 'TOGGLE_CART',
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          itemCount: 0,
          totalAmount: 0,
        },
        loading: false,
        error: null,
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case CART_ACTIONS.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.payload,
      };

    case CART_ACTIONS.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  cart: {
    id: null,
    items: [],
    itemCount: 0,
    totalAmount: 0,
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    currency: 'INR',
  },
  loading: false,
  error: null,
  sessionId: null,
  isOpen: false,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, []);

  // Initialize cart (get or create)
  const initializeCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      // Get session ID from cookie or generate new one
      const sessionId = getSessionId();
      dispatch({ type: CART_ACTIONS.SET_SESSION_ID, payload: sessionId });

      // Fetch full cart data with images
      const response = await cartAPI.getCart();
      if (response.success) {
        dispatch({ type: CART_ACTIONS.SET_CART, payload: response.data });
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: 'Failed to load cart' });
    }
  };

  // Get session ID from cookie or generate new one
  const getSessionId = () => {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith('sessionId='));

    if (sessionCookie) {
      return sessionCookie.split('=')[1];
    }

    // Generate new session ID
    const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    document.cookie = `sessionId=${newSessionId}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    return newSessionId;
  };

  // Add item to cart
  const addToCart = async (
    productId,
    productVariantId = null,
    quantity = 1,
    selectedAttributes = null,
  ) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await cartAPI.addToCart({
        productId,
        productVariantId,
        quantity,
        selectedAttributes,
      });

      if (response.success) {
        // Fetch updated cart
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.success) {
          dispatch({ type: CART_ACTIONS.SET_CART, payload: cartResponse.data });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await cartAPI.updateCartItem(itemId, { quantity });

      if (response.success) {
        // Fetch updated cart
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.success) {
          dispatch({ type: CART_ACTIONS.SET_CART, payload: cartResponse.data });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await cartAPI.removeFromCart(itemId);

      if (response.success) {
        // Fetch updated cart
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.success) {
          dispatch({ type: CART_ACTIONS.SET_CART, payload: cartResponse.data });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await cartAPI.clearCart();

      if (response.success) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await cartAPI.applyCoupon({
        couponCode,
        cartId: state.cart.id,
      });

      if (response.success) {
        // Fetch updated cart
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.success) {
          dispatch({ type: CART_ACTIONS.SET_CART, payload: cartResponse.data });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Remove coupon
  const removeCoupon = async (couponId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

      const response = await cartAPI.removeCoupon(couponId, state.cart.id);

      if (response.success) {
        // Fetch updated cart
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.success) {
          dispatch({ type: CART_ACTIONS.SET_CART, payload: cartResponse.data });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Toggle cart sidebar
  const toggleCart = () => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART });
  };

  // Get cart summary for header
  const getCartSummary = () => {
    return {
      itemCount: state.cart.itemCount || 0,
      totalAmount: state.cart.totalAmount || 0,
      items: state.cart.items?.slice(0, 3) || [], // Show only first 3 items
    };
  };

  // Check if product is in cart
  const isInCart = (productId, productVariantId = null) => {
    return (
      state.cart.items?.some(
        (item) => item.productId === productId && item.productVariantId === productVariantId,
      ) || false
    );
  };

  // Get item quantity in cart
  const getItemQuantity = (productId, productVariantId = null) => {
    const item = state.cart.items?.find(
      (item) => item.productId === productId && item.productVariantId === productVariantId,
    );
    return item ? item.quantity : 0;
  };

  // Get cart item ID
  const getCartItemId = (productId, productVariantId = null) => {
    const item = state.cart.items?.find(
      (item) => item.productId === productId && item.productVariantId === productVariantId,
    );
    return item ? item.id : null;
  };

  const value = {
    // State
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    sessionId: state.sessionId,
    isOpen: state.isOpen,

    // Actions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleCart,
    getCartSummary,
    isInCart,
    getItemQuantity,
    getCartItemId,

    // Utils
    initializeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
