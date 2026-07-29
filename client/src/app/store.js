import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../shared/store/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})
