/* eslint-disable no-param-reassign */
import { createAction, createReducer } from '@reduxjs/toolkit';

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

export default createReducer(initialState, (builder) => {
  builder.addCase(createAction('PLAY'), (state) => { state.playing = true; });
  builder.addCase(createAction('PAUSE'), (state) => { state.playing = false; });
  builder.addCase(createAction('TOGGLE_PLAYING'), (state) => {
    state.playing = !state.playing;
  });

  // Play a specific file from the queue.
  builder.addCase(createAction('SET_TRACK'), (state, action) => {
    if (action.payload >= state.queue.length || action.payload < 0) {
      return; // Invalid index, bail.
    }

    state.queueIndex = action.payload;
    state.progress = 0;
    state.playing = true;
  });

  builder.addCase(createAction('NEXT_TRACK'), (state) => {
    if (state.queueIndex < state.queue.length - 1) {
      // Go to next track only if it exists.
      state.queueIndex += 1;
      state.progress = 0;
      state.playing = true;
    }
  });

  builder.addCase(createAction('PREVIOUS_TRACK'), (state) => {
    if (state.queueIndex > 0) {
      // Go to previous track only if it exists.
      state.queueIndex -= 1;
      state.progress = 0;
      state.playing = true;
    }
  });

  // Seek audio element to desired value (from 0 to 100).
  builder.addCase(createAction('SEEK'), (state, action) => {
    state.seek = action.payload;
  });

  // Update UI progress bars.
  builder.addCase(createAction('TIME_UPDATE'), (state, action) => {
    state.progress = action.payload;
  });

  // Replace entire queue and play specified file.
  builder.addCase(createAction('SET_QUEUE'), (state, action) => {
    state.queue = action.payload.queue;
    state.queueIndex = action.payload.index;
    state.progress = 0;
    state.playing = true;
  });

  builder.addCase(createAction('EMPTY_QUEUE'), (state) => {
    state.playing = false;
    state.queue = [];
    state.queueIndex = 0;
  });

  builder.addCase(createAction('ADD_TO_QUEUE'), (state, action) => {
    state.queue.push(action.payload.file);
  });

  builder.addCase(createAction('REMOVE_FROM_QUEUE'), (state, action) => {
    state.queue.splice(action.payload.index, 1);

    if (action.payload.index === state.queueIndex) {
      state.playing = false;
      state.queueIndex = 0;
      state.progress = 0;
    }
  });

  // builder.addCase(createAction('TODO'), refactor move up/down in queue to reuse code
  builder.addCase(createAction('MOVE_UP_IN_QUEUE'), (state, action) => {
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
  });

  builder.addCase(createAction('MOVE_DOWN_IN_QUEUE'), (state, action) => {
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
  });

  // Add a file after the currently playing item in the queue.
  builder.addCase(createAction('PLAY_NEXT'), (state, action) => {
    state.queue.splice(state.queueIndex + 1, 0, action.payload.file);
  });
});
