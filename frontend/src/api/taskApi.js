import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/tasks',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery,
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getMyTasks: builder.query({
      query: () => '/my-tasks',
      providesTags: ['Task'],
    }),
    getTasksByTeam: builder.query({
      query: (teamId) => `/team/${teamId}`,
      providesTags: ['Task'],
    }),
    getAllTasks: builder.query({
      query: () => '/',
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (newTask) => ({
        url: '/',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
})

export const {
  useGetMyTasksQuery,
  useGetTasksByTeamQuery,
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi