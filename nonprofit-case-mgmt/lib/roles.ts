export type UserRole = 'admin' | 'staff'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface RolePermission {
  create_clients: boolean
  read_clients: boolean
  update_clients: boolean
  delete_clients: boolean
  create_services: boolean
  read_services: boolean
  update_services: boolean
  delete_services: boolean
  view_reports: boolean
  manage_users: boolean
  export_data: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  admin: {
    create_clients: true,
    read_clients: true,
    update_clients: true,
    delete_clients: true,
    create_services: true,
    read_services: true,
    update_services: true,
    delete_services: true,
    view_reports: true,
    manage_users: true,
    export_data: true,
  },
  staff: {
    create_clients: true,
    read_clients: true,
    update_clients: false,
    delete_clients: false,
    create_services: true,
    read_services: true,
    update_services: false,
    delete_services: false,
    view_reports: false,
    manage_users: false,
    export_data: false,
  },
}

export const hasPermission = (
  role: UserRole | null | undefined,
  permission: keyof RolePermission
): boolean => {
  if (!role) return false
  return ROLE_PERMISSIONS[role][permission] ?? false
}

export const isAdmin = (role: UserRole | null | undefined): boolean => {
  return role === 'admin'
}

export const isStaff = (role: UserRole | null | undefined): boolean => {
  return role === 'staff' || role === 'admin'
}
