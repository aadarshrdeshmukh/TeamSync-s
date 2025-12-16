import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../api/authApi'
import { taskApi } from '../api/taskApi'
import { teamApi } from '../api/teamApi'
import { activityApi } from '../api/activityApi'
import { userApi, generalUserApi } from '../api/userApi'
import { meetingApi } from '../api/meetingApi'
import { fileApi } from '../api/fileApi'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [teamApi.reducerPath]: teamApi.reducer,
    [activityApi.reducerPath]: activityApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [generalUserApi.reducerPath]: generalUserApi.reducer,
    [meetingApi.reducerPath]: meetingApi.reducer,
    [fileApi.reducerPath]: fileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      taskApi.middleware,
      teamApi.middleware,
      activityApi.middleware,
      userApi.middleware,
      generalUserApi.middleware,
      meetingApi.middleware,
      fileApi.middleware
    ),
})