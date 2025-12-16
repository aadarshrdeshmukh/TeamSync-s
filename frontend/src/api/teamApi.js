import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/teams',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const teamApi = createApi({
  reducerPath: 'teamApi',
  baseQuery,
  tagTypes: ['Team'],
  endpoints: (builder) => ({
    getMyTeams: builder.query({
      query: () => '/my-teams',
      providesTags: ['Team'],
    }),
    getAllTeams: builder.query({
      query: () => '/',
      providesTags: ['Team'],
    }),
    getTeamById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['Team'],
    }),
    createTeam: builder.mutation({
      query: (newTeam) => ({
        url: '/',
        method: 'POST',
        body: newTeam,
      }),
      invalidatesTags: ['Team'],
    }),
    updateTeam: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Team'],
    }),
    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }),
    addMember: builder.mutation({
      query: ({ teamId, userId, role }) => ({
        url: `/${teamId}/members`,
        method: 'POST',
        body: { userId, role },
      }),
      invalidatesTags: ['Team'],
    }),
    removeMember: builder.mutation({
      query: ({ teamId, userId }) => ({
        url: `/${teamId}/members`,
        method: 'DELETE',
        body: { userId },
      }),
      invalidatesTags: ['Team'],
    }),
  }),
})

export const {
  useGetMyTeamsQuery,
  useGetAllTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
} = teamApi