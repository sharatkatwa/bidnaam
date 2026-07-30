import { createSlice } from "@reduxjs/toolkit";

const stored = localStorage.getItem("watchlist");

const initialState = {
  ids: stored ? JSON.parse(stored) : [],
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    toggleWatch: (state, action) => {
      const id = action.payload;
      state.ids = state.ids.includes(id)
        ? state.ids.filter((watchedId) => watchedId !== id)
        : [...state.ids, id];
      localStorage.setItem("watchlist", JSON.stringify(state.ids));
    },
  },
});

export const { toggleWatch } = watchlistSlice.actions;
export default watchlistSlice.reducer;
