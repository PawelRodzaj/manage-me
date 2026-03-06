import { UserApi } from "../api/UserApi"
import type { User } from "../model/User"

export class UserService {
  static getCurrentUser(): User {
    return UserApi.getCurrent()
  }
}
