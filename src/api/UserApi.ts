import type { User } from "../model/User"

// mock implementation of authentication/user data
const MOCK_USER: User = {
  id: "user-1",
  firstName: "Jan",
  lastName: "Kowalski",
}

export class UserApi {
  static getCurrent(): User {
    // in the future this could call a real backend
    return MOCK_USER
  }
}
