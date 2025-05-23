import { createSlice } from '@reduxjs/toolkit';

const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    list: [],
    totalCost: 0,
  },
  reducers: {
    setItems: (state, action) => {
      state.list = action.payload;
      state.totalCost = action.payload.reduce((total, item) => total + item.cost, 0);
    },
    addItem: (state, action) => {
      state.list.push(action.payload);
      state.totalCost += action.payload.cost;
    },
    deleteItem: (state, action) => {
      const index = state.list.findIndex(item => item.id === action.payload);
      if (index >= 0) {
        state.totalCost -= state.list[index].cost;
        state.list.splice(index, 1);
      }
    }
  }
});

export const { setItems, addItem, deleteItem } = itemsSlice.actions;
export default itemsSlice.reducer;