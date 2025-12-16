import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/activities',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const activityApi = createApi({
  reducerPath: 'activityApi',
  baseQuery,
  tagTypes: ['Activity'],
  endpoints: (builder) => ({
    getAllActivities: builder.query({
      query: () => '/',
      providesTags: ['Activity'],
    }),
    getMyActivities: builder.query({
      query: () => '/my-activities',
      providesTags: ['Activity'],
    }),
    getActivitiesByTeam: builder.query({
      query: (teamId) => `/team/${teamId}`,
      providesTags: ['Activity'],
    }),
    getTeamReport: builder.query({
      query: (teamId) => `/report/${teamId}`,
      providesTags: ['Activity'],
    }),
  }),
})

export const {
  useGetAllActivitiesQuery,
  useGetMyActivitiesQuery,
  useGetActivitiesByTeamQuery,
  useGetTeamReportQuery,
} = activityApi