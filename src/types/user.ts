export type UserRole = 'student' | 'teacher' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  documentId: string
  role: UserRole
  active: boolean
  formation: string
  groupNumber: string
  createdAt: Date
  updatedAt: Date
  phone: string
  status: 'active' | 'inactive'
}