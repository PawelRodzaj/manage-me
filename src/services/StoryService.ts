import { StoryApi } from "../api/StoryApi"
import { TaskService } from "./TaskService"
import type { Story, Priority } from "../model/Story"

export class StoryService {
  static getStories(projectId: string): Story[] {
    return StoryApi.getByProject(projectId)
  }

  static getStoryById(storyId: string): Story | undefined {
    return StoryApi.getById(storyId)
  }

  static addStory(
    name: string,
    description: string,
    priority: Priority,
    projectId: string,
    ownerId: string
  ): void {
    const newStory: Story = {
      id: crypto.randomUUID(),
      name,
      description,
      priority,
      projectId,
      createdAt: new Date().toISOString(),
      state: "todo",
      ownerId,
    }

    StoryApi.create(newStory)
  }

  static updateStory(story: Story): void {
    StoryApi.update(story)
  }

  static deleteStory(id: string): void {
    TaskService.deleteTasksByStory(id)
    StoryApi.delete(id)
  }
}
