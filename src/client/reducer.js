/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit';

const initialState = {
  playing: false, // playing or paused
  progress: 0, // track progress (0-100)
  seek: false, // where to seek to (0-100)
  queueIndex: 0, // which track in the queue is currently selected
  queue: [
    // list of tracks. object format:
    /*
      title: null, // title to show in UI
      subtitle: null, // subtitle to show in UI
      hash: null, // unique identifier for the file
     */
  ],
};

export default createReducer(initialState, {
  PLAY: (state) => { state.playing = true; },
  PAUSE: (state) => { state.playing = false; },
  TOGGLE_PLAYING: (state) => {
    state.playing = !state.playing;
  },

  // Play a specific file from the queue.
  SET_TRACK: (state, action) => {
    if (action.payload >= state.queue.length || action.payload < 0) {
      return; // Invalid index, bail.
    }

    state.queueIndex = action.payload;
    state.progress = 0;
    state.playing = true;
  },
  NEXT_TRACK: (state) => {
    if (state.queueIndex < state.queue.length - 1) {
      // Go to next track only if it exists.
      state.queueIndex += 1;
      state.progress = 0;
      state.playing = true;
    }
  },
  PREVIOUS_TRACK: (state) => {
    if (state.queueIndex > 0) {
      // Go to previous track only if it exists.
      state.queueIndex -= 1;
      state.progress = 0;
      state.playing = true;
    }
  },

  // Seek audio element to desired value (from 0 to 100).
  SEEK: (state, action) => {
    state.seek = action.payload;
  },

  // Update UI progress bars.
  TIME_UPDATE: (state, action) => {
    state.progress = action.payload;
  },

  // Replace entire queue and play specified file.
  SET_QUEUE: (state, action) => {
    state.queue = action.payload.queue;
    state.queueIndex = action.payload.index;
    state.progress = 0;
    state.playing = true;
  },
  EMPTY_QUEUE: (state) => {
    state.playing = false;
    state.queue = [];
    state.queueIndex = 0;
  },

  ADD_TO_QUEUE: (state, action) => {
    state.queue.push(action.payload.file);
  },
  REMOVE_FROM_QUEUE: (state, action) => {
    state.queue.splice(action.payload.index, 1);

    if (action.payload.index === state.queueIndex) {
      state.playing = false;
      state.queueIndex = 0;
      state.progress = 0;
    }
  },

  // TODO: refactor move up/down in queue to reuse code
  MOVE_UP_IN_QUEUE: (state, action) => {
    if (action.payload.index - 1 < 0) {
      return; // Invalid index, bail
    }

    const aux = state.queue[action.payload.index - 1];
    state.queue[action.payload.index - 1] = state.queue[action.payload.index];
    state.queue[action.payload.index] = aux;

    if (action.payload.index === state.queueIndex) {
      state.queueIndex -= 1;
    } else if (action.payload.index === state.queueIndex + 1) {
      state.queueIndex += 1;
    }
  },
  MOVE_DOWN_IN_QUEUE: (state, action) => {
    if (action.payload.index + 1 >= state.queue.length) {
      return; // Invalid index, bail
    }

    const aux = state.queue[action.payload.index + 1];
    state.queue[action.payload.index + 1] = state.queue[action.payload.index];
    state.queue[action.payload.index] = aux;

    if (action.payload.index === state.queueIndex) {
      state.queueIndex += 1;
    } else if (action.payload.index === state.queueIndex - 1) {
      state.queueIndex -= 1;
    }
  },

  // Add a file after the currently playing item in the queue.
  PLAY_NEXT: (state, action) => {
    state.queue.splice(state.queueIndex + 1, 0, action.payload.file);
  },
});
