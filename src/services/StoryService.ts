import { StoryApi } from "../api/StoryApi"
import type { Story, Priority, } from "../model/Story"

export class StoryService {
  static getStories(projectId: string): Story[] {
    return StoryApi.getByProject(projectId)
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
    StoryApi.delete(id)
  }
}
