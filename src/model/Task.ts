export type TaskState = "todo" | "doing" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  name: string
  description: string
  priority: TaskPriority
  storyId: string
  projectId: string
  estimatedHours: number
  createdAt: string
  startedAt?: string
  finishedAt?: string
  assigneeId?: string
  state: TaskState
}
