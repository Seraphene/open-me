/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { products, type Product } from "./products";

export type CartItem = {
  product_id: string;
  qty: number;
};

export type CartState = {
  cart_items: CartItem[];
  user_location: string;
  total_value: number;
};

type CartContextType = {
  state: CartState;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setLocation: (location: string) => void;
  itemsDetailed: Array<{ product: Product; qty: number; subtotal: number }>;
};

type CartAction =
  | { type: "add"; productId: string }
  | { type: "remove"; productId: string }
  | { type: "set_location"; location: string };

const CartContext = createContext<CartContextType | null>(null);

const initialState: CartState = {
  cart_items: [
    { product_id: "p_101", qty: 1 },
    { product_id: "p_102", qty: 1 }
  ],
  user_location: "Bandra, Mumbai",
  total_value: 2399
};

function calculateTotal(cartItems: CartItem[]) {
  return cartItems.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    if (!product || product.currency !== "INR") {
      return sum;
    }

    return sum + product.price * item.qty;
  }, 0);
}

function reducer(state: CartState, action: CartAction): CartState {
  if (action.type === "set_location") {
    return {
      ...state,
      user_location: action.location
    };
  }

  if (action.type === "add") {
    const existing = state.cart_items.find((item) => item.product_id === action.productId);
    const cart_items = existing
      ? state.cart_items.map((item) =>
          item.product_id === action.productId ? { ...item, qty: item.qty + 1 } : item
        )
      : [...state.cart_items, { product_id: action.productId, qty: 1 }];

    return {
      ...state,
      cart_items,
      total_value: calculateTotal(cart_items)
    };
  }

  const target = state.cart_items.find((item) => item.product_id === action.productId);
  if (!target) {
    return state;
  }

  const cart_items =
    target.qty <= 1
      ? state.cart_items.filter((item) => item.product_id !== action.productId)
      : state.cart_items.map((item) =>
          item.product_id === action.productId ? { ...item, qty: item.qty - 1 } : item
        );

  return {
    ...state,
    cart_items,
    total_value: calculateTotal(cart_items)
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const itemsDetailed = useMemo(
    () =>
      state.cart_items
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.product_id);
          if (!product) {
            return null;
          }

          return {
            product,
            qty: item.qty,
            subtotal: product.currency === "INR" ? product.price * item.qty : 0
          };
        })
        .filter((item): item is { product: Product; qty: number; subtotal: number } => item !== null),
    [state.cart_items]
  );

  const value = useMemo<CartContextType>(
    () => ({
      state,
      addToCart: (productId: string) => dispatch({ type: "add", productId }),
      removeFromCart: (productId: string) => dispatch({ type: "remove", productId }),
      setLocation: (location: string) => dispatch({ type: "set_location", location }),
      itemsDetailed
    }),
    [itemsDetailed, state]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartStore() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartStore must be used within CartProvider");
  }

  return context;
}
