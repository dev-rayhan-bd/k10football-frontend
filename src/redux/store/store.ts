import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import { cvApi } from "@/redux/features/cv/cvApi";
import { playerSlice } from "@/redux/features/player/playerSlice";
import { coachSlice } from "@/redux/features/coach/coachSlice";
import authReducer from "../features/auth";
import evaluationReducer from "@/redux/features/evaluation/evaluationSlice";
import reportsReducer from "@/redux/features/reports/reportsSlice";
import { parentSlice } from "@/redux/features/parent/parentSlice";
import faqSliceReducer from "../features/faq/faqSlice";
import contentSliceReducer from "../features/content/contentSlice";
import chatReducer from "../features/chat/chatSlice";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

// Use localStorage for persistence — guard against SSR (window is undefined on server)
const getStorage = () => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("redux-persist/lib/storage").default;
  }
  // Minimal no-op storage for SSR (values are never actually stored server-side)
  return {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  };
};

const evaluationPersistConfig = {
  key: "k10-evaluation-v1",
  storage: getStorage(),
  version: 1,
};

const persistedEvaluationReducer = persistReducer(
  evaluationPersistConfig,
  evaluationReducer
);

const reportsPersistConfig = {
  key: "k10-reports-v1",
  storage: getStorage(),
  version: 1,
};

const persistedReportsReducer = persistReducer(
  reportsPersistConfig,
  reportsReducer
);

const parentPersistConfig = {
  key: "k10-parent-v1",
  storage: getStorage(),
  version: 1,
};

const persistedParentReducer = persistReducer(
  parentPersistConfig,
  parentSlice.reducer
);

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [cvApi.reducerPath]: cvApi.reducer,
  player: playerSlice.reducer,
  coach: coachSlice.reducer,
  auth: authReducer,
  evaluation: persistedEvaluationReducer,
  reports: persistedReportsReducer,
  parent: persistedParentReducer,
  faq: faqSliceReducer,
  content: contentSliceReducer,
  chat: chatReducer,
});

// Single store instance — main store in redux folder
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware, cvApi.middleware),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;