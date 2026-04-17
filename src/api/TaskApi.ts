import type { Task } from "../model/Task"

const STORAGE_KEY = "manage-me-tasks"

export class TaskApi {
  private static read(): Task[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private static write(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }

  static getAll(): Task[] {
    return this.read()
  }

  static getById(id: string): Task | undefined {
    return this.read().find(t => t.id === id)
  }

  static getByProject(projectId: string): Task[] {
    return this.read().filter(t => t.projectId === projectId)
  }

  static getByStory(storyId: string): Task[] {
    return this.read().filter(t => t.storyId === storyId)
  }

  static create(task: Task): void {
    const tasks = this.read()
    tasks.push(task)
    this.write(tasks)
  }

  static update(updated: Task): void {
    const tasks = this.read().map(t =>
      t.id === updated.id ? updated : t
    )
    this.write(tasks)
  }

  static delete(id: string): void {
    const tasks = this.read().filter(t => t.id !== id)
    this.write(tasks)
  }

  static deleteByStory(storyId: string): void {
    const tasks = this.read().filter(t => t.storyId !== storyId)
    this.write(tasks)
  }
}
