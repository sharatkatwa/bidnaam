import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../shared/store/authSlice'
import watchlistReducer from '../shared/store/watchlistSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    watchlist: watchlistReducer,
  },
})
