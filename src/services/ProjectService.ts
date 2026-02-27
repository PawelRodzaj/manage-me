import { ProjectApi } from "../api/ProjectApi"
import type { Project } from "../model/Project"

export class ProjectService {

  static getProjects(): Project[] {
    return ProjectApi.getAll()
  }

  static addProject(name: string, description: string): void {
    const newProject: Project = {
      id: crypto.randomUUID(), // ✅ tutaj generujesz ID
      name,
      description
    }

    ProjectApi.create(newProject)
  }

  static updateProject(project: Project): void {
    ProjectApi.update(project)
  }

  static deleteProject(id: string): void {
    ProjectApi.delete(id)
  }
}