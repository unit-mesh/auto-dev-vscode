import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export const configSlice = createSlice({
  name: "config",
  initialState: {
    vscMachineId: '11',
  },
  reducers: {
    setVscMachineId: (state, action: PayloadAction<string>) => {
      state.vscMachineId = action.payload;
    },
  },
});

export const { setVscMachineId } = configSlice.actions;
export default configSlice.reducer;
