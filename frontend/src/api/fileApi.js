import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/files',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const fileApi = createApi({
  reducerPath: 'fileApi',
  baseQuery,
  tagTypes: ['File'],
  endpoints: (builder) => ({
    getAllFiles: builder.query({
      query: () => '/',
      providesTags: ['File'],
    }),
    getFilesByTeam: builder.query({
      query: (teamId) => `/team/${teamId}`,
      providesTags: ['File'],
    }),
    getFileById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ['File'],
    }),
    uploadFile: builder.mutation({
      query: (fileData) => ({
        url: '/',
        method: 'POST',
        body: fileData,
      }),
      invalidatesTags: ['File'],
    }),
    updateFile: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['File'],
    }),
    deleteFile: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['File'],
    }),
  }),
})

export const {
  useGetAllFilesQuery,
  useGetFilesByTeamQuery,
  useGetFileByIdQuery,
  useUploadFileMutation,
  useUpdateFileMutation,
  useDeleteFileMutation,
} = fileApi