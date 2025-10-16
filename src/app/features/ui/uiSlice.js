import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    pendingRequests: 0,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        incrementPendingRequests(state) {
            state.pendingRequests += 1;
        },
        decrementPendingRequests(state) {
            if (state.pendingRequests > 0) state.pendingRequests -= 1;
        },
        resetPendingRequests(state) {
            state.pendingRequests = 0;
        }
    }
});

export const { incrementPendingRequests, decrementPendingRequests, resetPendingRequests } = uiSlice.actions;
export default uiSlice.reducer;


