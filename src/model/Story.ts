export type Priority = "low" | "medium" | "high"
export type StoryState = "todo" | "doing" | "done"

export interface Story {
  id: string
  name: string
  description: string
  priority: Priority
  projectId: string
  createdAt: string // ISO timestamp
  state: StoryState
  ownerId: string
}
