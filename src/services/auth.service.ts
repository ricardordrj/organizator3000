import { apiClient } from './apiClient'

export type UserRole = 'admin' | 'guest'

export interface CurrentUser {
  email: string
  role: UserRole
}

export const authService = {
  me: () => apiClient.get<CurrentUser>('/me'),
}
