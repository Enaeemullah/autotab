import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PosCartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  taxRate: number;
  discountRate: number;
}

interface Payment {
  paymentTypeId: string;
  amount: number;
  reference?: string;
}

interface PosState {
  cart: PosCartItem[];
  payments: Payment[];
  notes: string;
}

const initialState: PosState = {
  cart: [],
  payments: [],
  notes: ''
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<PosCartItem>) {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.cart.find((cartItem) => cartItem.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    resetCart() {
      return initialState;
    },
    addPayment(state, action: PayloadAction<Payment>) {
      state.payments.push(action.payload);
    },
    clearPayments(state) {
      state.payments = [];
    },
    removePayment(state, action: PayloadAction<number>) {
      state.payments.splice(action.payload, 1);
    },
    setNotes(state, action: PayloadAction<string>) {
      state.notes = action.payload;
    }
  }
});

export const { addItem, updateQuantity, removeItem, resetCart, addPayment, clearPayments, removePayment, setNotes } =
  posSlice.actions;
export default posSlice.reducer;
