import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserPermissions } from "../types/index.ts";

export interface AuthState {
  permissions: UserPermissions | null;
}

const initialState: AuthState = {
  permissions: null, // Redux Persist sẽ xử lý lưu trữ
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<UserPermissions>) => {
      state.permissions = action.payload;
    },
    logout: (state) => {
      state.permissions = null;
    },
  },
});

export const { setPermissions, logout } = authSlice.actions;
export default authSlice.reducer;
