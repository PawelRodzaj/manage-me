import type { Story } from "../model/Story"

const STORAGE_KEY = "manage-me-stories"

export class StoryApi {
  private static read(): Story[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private static write(stories: Story[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
  }

  static getAll(): Story[] {
    return this.read()
  }

  static getById(id: string): Story | undefined {
    return this.read().find(s => s.id === id)
  }

  static getByProject(projectId: string): Story[] {
    return this.read().filter(s => s.projectId === projectId)
  }

  static create(story: Story): void {
    const stories = this.read()
    stories.push(story)
    this.write(stories)
  }

  static update(updated: Story): void {
    const stories = this.read().map(s =>
      s.id === updated.id ? updated : s
    )
    this.write(stories)
  }

  static delete(id: string): void {
    const stories = this.read().filter(s => s.id !== id)
    this.write(stories)
  }
}
