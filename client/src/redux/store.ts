// store.ts
import { configureStore } from '@reduxjs/toolkit';
import storySlice from './slice';

export const store = configureStore({
  reducer: {
    story: storySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
