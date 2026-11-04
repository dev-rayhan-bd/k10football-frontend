/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getDecodedToken, normalizeRole } from "@/helpers/SessionHelper";

export interface AuthState {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
}

const getInitialAuth = () => {
  if (typeof window === "undefined") return { user: null, accessToken: null, refreshToken: null };
  const token = localStorage.getItem("token");
  const decoded = getDecodedToken(token);
  const userRole = decoded?.role ? normalizeRole(decoded.role) : null;
  const userEmail = decoded?.email || localStorage.getItem("userEmail") || localStorage.getItem("email");
  const fullName = localStorage.getItem("fullName") || "";

  if (token && decoded && userRole) {
    return {
      user: { email: userEmail, role: userRole, fullName },
      accessToken: token,
      refreshToken: null,
    };
  }
  return { user: null, accessToken: null, refreshToken: null };
};

const initialState: AuthState = getInitialAuth();

const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{
        user: any;
      }>,
    ) {
      state.user = action.payload.user;
    },
    setAccessToken(state, action: { payload: string | null }) {
      state.accessToken = action.payload;
    },
    setRefreshToken(state, action: { payload: string | null }) {
      state.refreshToken = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        localStorage.removeItem("role");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("fullName");
      }
      window.location.href = "/login";
    },
  },
});

export const { setUser, setAccessToken, logout, setRefreshToken } =
  authSlice.actions;

export default authSlice.reducer;
