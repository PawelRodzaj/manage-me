import { UserApi } from "../api/UserApi"
import type { User, UserRole } from "../model/User"

export class UserService {
  static getCurrentUser(): User {
    return UserApi.getCurrent()
  }

  static getUsers(): User[] {
    return UserApi.getAll()
  }

  static updateUser(user: User): void {
    UserApi.updateUser(user)
  }

  static blockUser(userId: string): void {
    const user = UserApi.getById(userId)
    if (!user) return
    user.blocked = true
    UserApi.updateUser(user)
  }

  static changeRole(userId: string, role: UserRole): void {
    const user = UserApi.getById(userId)
    if (!user) return
    user.role = role
    UserApi.updateUser(user)
  }

  static loginByEmail(email: string): User {
    const normalizedEmail = email.trim().toLowerCase()
    const superAdminEmail = UserApi.getSuperAdminEmail().toLowerCase()
    let user = UserApi.getByEmail(normalizedEmail)
    if (!user) {
      const role: UserRole = normalizedEmail === superAdminEmail ? "admin" : "guest"
      user = {
        id: crypto.randomUUID(),
        firstName: normalizedEmail.split("@")[0] || "Nowy",
        lastName: "Użytkownik",
        email: normalizedEmail,
        role,
        blocked: false,
      }
      UserApi.addUser(user)
    } else if (user.email.toLowerCase() === superAdminEmail) {
      user.role = "admin"
      UserApi.updateUser(user)
    }
    UserApi.saveCurrent(user)
    return user
  }

  static loginWithGoogleProfile(profile: {
    sub: string
    email: string
    given_name?: string
    family_name?: string
  }): User {
    const normalizedEmail = profile.email.trim().toLowerCase()
    const superAdminEmail = UserApi.getSuperAdminEmail().toLowerCase()
    let user = UserApi.getByEmail(normalizedEmail)
    if (!user) {
      const role: UserRole = normalizedEmail === superAdminEmail ? "admin" : "guest"
      user = {
        id: profile.sub,
        firstName: profile.given_name || normalizedEmail.split("@")[0] || "Nowy",
        lastName: profile.family_name || "Użytkownik",
        email: normalizedEmail,
        role,
        blocked: false,
      }
      UserApi.addUser(user)
    } else if (user.email.toLowerCase() === superAdminEmail) {
      user.role = "admin"
      UserApi.updateUser(user)
    }
    UserApi.saveCurrent(user)
    return user
  }

  static logout(): void {
    UserApi.logout()
  }
}
