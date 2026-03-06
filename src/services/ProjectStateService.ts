import type { Project } from "../model/Project"
import { ProjectApi } from "../api/ProjectApi"

const STORAGE_KEY = "manage-me-active-project"

export class ProjectStateService {
  static setActiveProject(id: string | null): void {
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, id)
    }
  }

  static getActiveProjectId(): string | null {
    return localStorage.getItem(STORAGE_KEY)
  }

  static getActiveProject(): Project | undefined {
    const id = this.getActiveProjectId()
    return id ? ProjectApi.getById(id) : undefined
  }
}
