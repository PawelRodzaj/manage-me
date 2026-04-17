import type { User } from "../model/User"

const STORAGE_KEY_USERS = "manage-me-users"
const STORAGE_KEY_CURRENT_USER = "manage-me-current-user"
const SUPER_ADMIN_EMAIL = "superadmin@example.com"

const defaultUsers: User[] = [
  {
    id: "user-admin",
    firstName: "Super",
    lastName: "Admin",
    email: SUPER_ADMIN_EMAIL,
    role: "admin",
    blocked: false,
  },
  {
    id: "user-devops",
    firstName: "Anna",
    lastName: "Nowak",
    email: "anna.nowak@example.com",
    role: "devops",
    blocked: false,
  },
  {
    id: "user-developer",
    firstName: "Marek",
    lastName: "Wiśniewski",
    email: "marek.wisniewski@example.com",
    role: "developer",
    blocked: false,
  },
]

function initUsers(): void {
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(defaultUsers))
  }
}

function getGuestUser(): User {
  return {
    id: "guest",
    firstName: "Gość",
    lastName: "Użytkownik",
    email: "guest@manage.me",
    role: "guest",
    blocked: false,
  }
}

export class UserApi {
  private static read(): User[] {
    initUsers()
    const data = localStorage.getItem(STORAGE_KEY_USERS)
    return data ? JSON.parse(data) : []
  }

  private static write(users: User[]): void {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users))
  }

  static getAll(): User[] {
    return this.read()
  }

  static getById(id: string): User | undefined {
    return this.read().find(u => u.id === id)
  }

  static getByEmail(email: string): User | undefined {
    return this.read().find(u => u.email.toLowerCase() === email.toLowerCase())
  }

  static getAdmins(): User[] {
    return this.read().filter(u => u.role === "admin")
  }

  static saveCurrent(user: User): void {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user))
  }

  static getCurrent(): User {
    const data = localStorage.getItem(STORAGE_KEY_CURRENT_USER)
    if (data) {
      return JSON.parse(data)
    }
    const guestUser = getGuestUser()
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(guestUser))
    return guestUser
  }

  static logout(): void {
    this.saveCurrent(getGuestUser())
  }

  static updateUser(user: User): void {
    const users = this.read().map(u =>
      u.id === user.id ? user : u
    )
    this.write(users)
    const currentData = localStorage.getItem(STORAGE_KEY_CURRENT_USER)
    if (currentData) {
      const currentUser = JSON.parse(currentData) as User
      if (currentUser.id === user.id) {
        this.saveCurrent(user)
      }
    }
  }

  static addUser(user: User): void {
    const users = this.read()
    users.push(user)
    this.write(users)
  }

  static getSuperAdminEmail(): string {
    return SUPER_ADMIN_EMAIL
  }
}
