// selectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

const selectStoryState = (state: RootState) => state.story;

export const selectIsLoading = createSelector(
  [selectStoryState],
  (story) => story.isLoading
);

export const selectResponse = createSelector(
  [selectStoryState],
  (story) => story.response
);

export const selectUserPrompt = createSelector(
  [selectStoryState],
  (story) => story.userPrompt
);

export const selectChatHistory = createSelector(
  [selectStoryState],
  (story) => story.chatHistory
);
