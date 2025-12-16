import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Admin-specific user API
const adminBaseQuery = fetchBaseQuery({
  baseUrl: '/api/admin',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// General user API (accessible by leads and members)
const userBaseQuery = fetchBaseQuery({
  baseUrl: '/api/users',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: adminBaseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    activateUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// General user API for task assignment (accessible by leads)
export const generalUserApi = createApi({
  reducerPath: 'generalUserApi',
  baseQuery: userBaseQuery,
  tagTypes: ['AssignableUser'],
  endpoints: (builder) => ({
    getAssignableUsers: builder.query({
      query: () => '/assignable',
      providesTags: ['AssignableUser'],
    }),
    getUserProfile: builder.query({
      query: () => '/profile',
      providesTags: ['AssignableUser'],
    }),
  }),
})

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useDeactivateUserMutation,
  useActivateUserMutation,
  useCreateUserMutation,
} = userApi

export const {
  useGetAssignableUsersQuery,
  useGetUserProfileQuery,
} = generalUserApi