import { TaskApi } from "../api/TaskApi"
import type { Task, TaskPriority } from "../model/Task"

export class TaskService {
  static getTasksByProject(projectId: string): Task[] {
    return TaskApi.getByProject(projectId)
  }

  static getTasksByStory(storyId: string): Task[] {
    return TaskApi.getByStory(storyId)
  }

  static getTaskById(id: string): Task | undefined {
    return TaskApi.getById(id)
  }

  static addTask(
    name: string,
    description: string,
    priority: TaskPriority,
    projectId: string,
    storyId: string,
    estimatedHours: number
  ): void {
    const task: Task = {
      id: crypto.randomUUID(),
      name,
      description,
      priority,
      projectId,
      storyId,
      estimatedHours,
      createdAt: new Date().toISOString(),
      state: "todo",
    }
    TaskApi.create(task)
  }

  static updateTask(task: Task): void {
    TaskApi.update(task)
  }

  static deleteTask(id: string): void {
    TaskApi.delete(id)
  }

  static deleteTasksByStory(storyId: string): void {
    TaskApi.deleteByStory(storyId)
  }

  static assignTask(task: Task, assigneeId: string): Task {
    task.assigneeId = assigneeId
    task.state = "doing"
    task.startedAt = task.startedAt ?? new Date().toISOString()
    TaskApi.update(task)
    return task
  }

  static finishTask(task: Task): Task {
    task.state = "done"
    task.finishedAt = task.finishedAt ?? new Date().toISOString()
    if (!task.assigneeId) {
      task.assigneeId = task.assigneeId || undefined
    }
    TaskApi.update(task)
    return task
  }
}
