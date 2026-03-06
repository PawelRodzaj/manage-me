import { ProjectService } from "./services/ProjectService"
import { ProjectStateService } from "./services/ProjectStateService"
import { StoryService } from "./services/StoryService"
import { UserService } from "./services/UserService"

import type { Project } from "./model/Project"
import type { Story, StoryState, Priority } from "./model/Story"
import type { User } from "./model/User"

// project elements
const projectForm = document.querySelector("#project-form") as HTMLFormElement
const projectList = document.querySelector("#project-list") as HTMLUListElement
const nameInput = document.querySelector("#name") as HTMLInputElement
const descInput = document.querySelector("#description") as HTMLInputElement

// user / active project display
const userInfo = document.querySelector("#user-info") as HTMLElement
const activeProjectInfo = document.querySelector("#active-project-info") as HTMLElement

// story elements
const storiesSection = document.querySelector("#stories-section") as HTMLElement
const storyForm = document.querySelector("#story-form") as HTMLFormElement
const storyNameInput = document.querySelector("#story-name") as HTMLInputElement
const storyDescInput = document.querySelector("#story-description") as HTMLInputElement
const storyPrioritySelect = document.querySelector("#story-priority") as HTMLSelectElement
const storyListsContainer = document.querySelector("#story-lists") as HTMLElement

function renderUser(): void {
  const user: User = UserService.getCurrentUser()
  userInfo.textContent = `Zalogowany użytkownik: ${user.firstName} ${user.lastName}`
}

function renderProjects(): void {
  projectList.innerHTML = ""
  const projects = ProjectService.getProjects()
  const activeId = ProjectStateService.getActiveProjectId()

  projects.forEach((project: Project) => {
    const li = document.createElement("li")
    const isActive = project.id === activeId

    li.innerHTML = `
      <strong>${project.name}</strong> - ${project.description}
      <button data-id="${project.id}" class="delete">Usuń</button>
      <button data-id="${project.id}" class="activate">
        ${isActive ? "Aktywny" : "Ustaw aktywny"}
      </button>
    `

    projectList.appendChild(li)
  })
}

function renderActiveProject(): void {
  const project = ProjectStateService.getActiveProject()
  if (project) {
    activeProjectInfo.textContent = `Aktualny projekt: ${project.name}`
  } else {
    activeProjectInfo.textContent = "Brak aktywnego projektu"
  }
}

function renderStories(): void {
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) {
    storiesSection.style.display = "none"
    return
  }

  storiesSection.style.display = "block"
  const stories = StoryService.getStories(projectId)
  // clear lists
  ;["todo", "doing", "done"].forEach(state => {
    const ul = document.querySelector(`#stories-${state}`) as HTMLUListElement
    ul.innerHTML = ""
  })

  stories.forEach((s: Story) => {
    const li = document.createElement("li")
    li.innerHTML = `
      <strong>${s.name}</strong> (${s.priority}) - ${s.description} <em>owner:${s.ownerId}</em>
      <button data-id="${s.id}" class="delete-story">Usuń</button>
      <button data-id="${s.id}" class="edit-story">Edytuj</button>
      ${s.state !== "todo" ? `<button data-id="${s.id}" class="state" data-state="todo">Przenieś do todo</button>` : ""}
      ${s.state !== "doing" ? `<button data-id="${s.id}" class="state" data-state="doing">Przenieś do doing</button>` : ""}
      ${s.state !== "done" ? `<button data-id="${s.id}" class="state" data-state="done">Przenieś do done</button>` : ""}
    `

    const parent = document.querySelector(`#stories-${s.state}`) as HTMLUListElement
    parent.appendChild(li)
  })
}

// event listeners
projectForm.addEventListener("submit", e => {
  e.preventDefault()
  ProjectService.addProject(nameInput.value, descInput.value)
  projectForm.reset()
  renderProjects()
})

projectList.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const id = target.dataset.id
  if (!id) return

  if (target.classList.contains("delete")) {
    ProjectService.deleteProject(id)
    // if deleted project was active, clear
    if (ProjectStateService.getActiveProjectId() === id) {
      ProjectStateService.setActiveProject(null)
    }
    renderProjects()
    renderActiveProject()
    renderStories()
  }

  if (target.classList.contains("activate")) {
    ProjectStateService.setActiveProject(id)
    renderProjects()
    renderActiveProject()
    renderStories()
  }
})

storyForm.addEventListener("submit", e => {
  e.preventDefault()
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) return

  const user = UserService.getCurrentUser()
  StoryService.addStory(
    storyNameInput.value,
    storyDescInput.value,
    storyPrioritySelect.value as Priority,
    projectId,
    user.id
  )
  storyForm.reset()
  renderStories()
})

storyListsContainer.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const id = target.dataset.id
  if (!id) return

  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) return

  // helper to find story
  const stories = StoryService.getStories(projectId)
  const story = stories.find(s => s.id === id)
  if (!story) return

  if (target.classList.contains("delete-story")) {
    StoryService.deleteStory(id)
    renderStories()
    return
  }

  if (target.classList.contains("edit-story")) {
    const newName = prompt("Nowa nazwa", story.name)
    const newDesc = prompt("Nowy opis", story.description)
    const newPriority = prompt("Priorytet (low/medium/high)", story.priority)
    if (newName) story.name = newName
    if (newDesc) story.description = newDesc
    if (newPriority === "low" || newPriority === "medium" || newPriority === "high") {
      story.priority = newPriority as Priority
    }
    StoryService.updateStory(story)
    renderStories()
    return
  }

  if (target.classList.contains("state")) {
    const newState = target.dataset.state as StoryState
    if (newState) {
      story.state = newState
      StoryService.updateStory(story)
      renderStories()
    }
  }
})

// initial render
renderUser()
renderProjects()
renderActiveProject()
renderStories()