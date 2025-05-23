// src/store/otherCostsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const otherCostsSlice = createSlice({
  name: 'otherCosts',
  initialState: {
    list: [],
    total: 0,
  },
  reducers: {
    setOtherCosts: (state, action) => {
      state.list = action.payload;
      state.total = action.payload.reduce((sum, cost) => sum + cost.amount, 0);
    },
    addOtherCost: (state, action) => {
      state.list.push(action.payload);
      state.total += action.payload.amount;
    },
    deleteOtherCost: (state, action) => {
      state.list = state.list.filter(cost => cost.id !== action.payload);
      state.total = state.list.reduce((sum, cost) => sum + cost.amount, 0);
    },
  },
});

export const { setOtherCosts, addOtherCost, deleteOtherCost } = otherCostsSlice.actions;
export default otherCostsSlice.reducer;