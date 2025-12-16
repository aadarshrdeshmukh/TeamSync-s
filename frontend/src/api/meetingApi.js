import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/meetings',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const meetingApi = createApi({
  reducerPath: 'meetingApi',
  baseQuery,
  tagTypes: ['Meeting'],
  endpoints: (builder) => ({
    getMyMeetings: builder.query({
      query: () => '/my-meetings',
      providesTags: ['Meeting'],
    }),
    getMeetingById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Meeting'],
    }),
    getTeamMeetings: builder.query({
      query: (teamId) => `/team/${teamId}`,
      providesTags: ['Meeting'],
    }),
    getAllMeetings: builder.query({
      query: () => '/',
      providesTags: ['Meeting'],
    }),
    createMeeting: builder.mutation({
      query: (newMeeting) => ({
        url: '/',
        method: 'POST',
        body: newMeeting,
      }),
      invalidatesTags: ['Meeting'],
    }),
    updateMeeting: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Meeting'],
    }),
    deleteMeeting: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Meeting'],
    }),
    joinMeeting: builder.mutation({
      query: (id) => ({
        url: `/${id}/join`,
        method: 'POST',
      }),
      invalidatesTags: ['Meeting'],
    }),
  }),
})

export const {
  useGetMyMeetingsQuery,
  useGetMeetingByIdQuery,
  useGetTeamMeetingsQuery,
  useGetAllMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useJoinMeetingMutation,
} = meetingApi