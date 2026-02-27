import type { Project } from "../model/Project"

const STORAGE_KEY = "manage-me-projects"

export class ProjectApi {
  private static read(): Project[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private static write(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }

  static getAll(): Project[] {
    return this.read()
  }

  static getById(id: string): Project | undefined {
    return this.read().find(p => p.id === id)
  }

  static create(project: Project): void {
    const projects = this.read()
    projects.push(project)
    this.write(projects)
  }

  static update(updatedProject: Project): void {
    const projects = this.read().map(p =>
      p.id === updatedProject.id ? updatedProject : p
    )
    this.write(projects)
  }

  static delete(id: string): void {
    const projects = this.read().filter(p => p.id !== id)
    this.write(projects)
  }
}