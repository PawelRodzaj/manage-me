import { ProjectService } from "./services/ProjectService"
import { ProjectStateService } from "./services/ProjectStateService"
import { StoryService } from "./services/StoryService"
import { UserService } from "./services/UserService"
import { NotificationService } from "./services/NotificationService"
import { TaskService } from "./services/TaskService"
import { AuthService, type GoogleProfile } from "./services/AuthService"

import type { Project } from "./model/Project"
import type { Story, StoryState, Priority } from "./model/Story"
import type { User } from "./model/User"
import type { Task, TaskPriority } from "./model/Task"
import type { Notification } from "./model/Notification"

const themeToggle = document.querySelector("#theme-toggle") as HTMLButtonElement
const loginButton = document.querySelector("#login-button") as HTMLButtonElement
const logoutButton = document.querySelector("#logout-button") as HTMLButtonElement
const notificationsToggle = document.querySelector("#notifications-toggle") as HTMLButtonElement
const loginPanel = document.querySelector("#login-panel") as HTMLElement
const loginForm = document.querySelector("#login-form") as HTMLFormElement
const loginEmail = document.querySelector("#login-email") as HTMLInputElement
const googleSignInButton = document.querySelector("#google-signin-button") as HTMLElement
const userInfo = document.querySelector("#user-info") as HTMLElement
const accountStatus = document.querySelector("#account-status") as HTMLElement
const activeProjectInfo = document.querySelector("#active-project-info") as HTMLElement
const usersSection = document.querySelector("#users-section") as HTMLElement
const userList = document.querySelector("#user-list") as HTMLUListElement
const projectForm = document.querySelector("#project-form") as HTMLFormElement
const projectSection = document.querySelector("#projects-section") as HTMLElement
const projectList = document.querySelector("#project-list") as HTMLUListElement
const nameInput = document.querySelector("#name") as HTMLInputElement
const descInput = document.querySelector("#description") as HTMLInputElement
const storiesSection = document.querySelector("#stories-section") as HTMLElement
const storyForm = document.querySelector("#story-form") as HTMLFormElement
const storyNameInput = document.querySelector("#story-name") as HTMLInputElement
const storyDescInput = document.querySelector("#story-description") as HTMLInputElement
const storyPrioritySelect = document.querySelector("#story-priority") as HTMLSelectElement
const storyListsContainer = document.querySelector("#story-lists") as HTMLElement
const taskForm = document.querySelector("#task-form") as HTMLFormElement
const taskNameInput = document.querySelector("#task-name") as HTMLInputElement
const taskDescInput = document.querySelector("#task-description") as HTMLInputElement
const taskPrioritySelect = document.querySelector("#task-priority") as HTMLSelectElement
const taskEstimateInput = document.querySelector("#task-estimate") as HTMLInputElement
const taskStorySelect = document.querySelector("#task-story") as HTMLSelectElement
const tasksSection = document.querySelector("#tasks-section") as HTMLElement
const notificationsPanel = document.querySelector("#notifications-panel") as HTMLElement
const notificationBadge = document.querySelector("#notification-badge") as HTMLElement
const notificationList = document.querySelector("#notification-list") as HTMLUListElement
const notificationDialog = document.querySelector("#notification-dialog") as HTMLElement
const notificationDialogContent = document.querySelector("#notification-dialog-content") as HTMLElement
const closeNotificationDialog = document.querySelector("#close-notification-dialog") as HTMLButtonElement

let currentUser: User = UserService.getCurrentUser()

function setTheme(theme: "light" | "dark") {
  document.body.classList.toggle("dark", theme === "dark")
  localStorage.setItem("manage-me-theme", theme)
  themeToggle.textContent = theme === "dark" ? "Tryb jasny" : "Tryb ciemny"
}

function initTheme() {
  const stored = localStorage.getItem("manage-me-theme") as "light" | "dark" | null
  setTheme(stored === "dark" ? "dark" : "light")
}

function refreshCurrentUser() {
  currentUser = UserService.getCurrentUser()
}

function isAdmin(): boolean {
  return currentUser.role === "admin"
}

function isGuest(): boolean {
  return currentUser.role === "guest"
}

function canUseApp(): boolean {
  return !currentUser.blocked && !isGuest()
}

function notifyAdmins(title: string, message: string, priority: "low" | "medium" | "high") {
  UserService.getUsers()
    .filter(user => user.role === "admin")
    .forEach(admin => {
      NotificationService.createNotification(title, message, priority, admin.id)
    })
}

function showDialog(notification: Notification) {
  notificationDialogContent.innerHTML = `
    <p><strong>${notification.title}</strong></p>
    <p>${notification.message}</p>
    <p class="small-text">${new Date(notification.date).toLocaleString()}</p>
    <span class="badge ${notification.priority}">${notification.priority}</span>
  `
  notificationDialog.classList.remove("hidden")
}

function renderUserInfo() {
  const userRole = currentUser.role === "guest" ? "gość" : currentUser.role
  userInfo.textContent = `Zalogowany użytkownik: ${currentUser.firstName} ${currentUser.lastName} (${userRole})`
  accountStatus.textContent = currentUser.blocked ? "Konto zablokowane" : isGuest() ? "Oczekiwanie na zatwierdzenie konta" : "Dostęp przydzielony"
  logoutButton.classList.toggle("hidden", currentUser.role === "guest")
}

function initGoogleLogin() {
  const clientId = AuthService.getClientId()
  if (!clientId || !googleSignInButton) {
    googleSignInButton?.classList.add("hidden")
    return
  }
  AuthService.initGoogleSignIn((profile: GoogleProfile) => {
    UserService.loginWithGoogleProfile(profile)
    refreshCurrentUser()
    renderAll()
    loginPanel.classList.add("hidden")
  })
}

function renderUserList() {
  if (!isAdmin() || !canUseApp()) {
    usersSection.classList.add("hidden")
    return
  }

  usersSection.classList.remove("hidden")
  userList.innerHTML = ""
  UserService.getUsers().forEach(user => {
    const li = document.createElement("li")
    li.className = "user-card"
    const blockedText = user.blocked ? "(zablokowany)" : ""
    li.innerHTML = `
      <strong>${user.firstName} ${user.lastName}</strong> ${blockedText}
      <p class="small-text">${user.email}</p>
      <label>Rola:
        <select data-id="${user.id}" class="user-role-select">
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
          <option value="devops" ${user.role === "devops" ? "selected" : ""}>devops</option>
          <option value="developer" ${user.role === "developer" ? "selected" : ""}>developer</option>
          <option value="guest" ${user.role === "guest" ? "selected" : ""}>gość</option>
        </select>
      </label>
      <button data-id="${user.id}" class="small secondary block-toggle">${user.blocked ? "Odblokuj" : "Zablokuj"}</button>
    `
    userList.appendChild(li)
  })
}

function renderProjects() {
  if (!canUseApp()) {
    projectSection.classList.add("hidden")
    return
  }

  projectSection.classList.remove("hidden")
  projectList.innerHTML = ""
  const projects = ProjectService.getProjects()
  const activeId = ProjectStateService.getActiveProjectId()

  projects.forEach((project: Project) => {
    const li = document.createElement("li")
    li.className = "project-card"
    const isActive = project.id === activeId
    li.innerHTML = `
      <strong>${project.name}</strong> - ${project.description}
      <div>
        <button data-id="${project.id}" class="small ${isActive ? "secondary" : ""} activate">${isActive ? "Aktywny" : "Ustaw aktywny"}</button>
        <button data-id="${project.id}" class="small danger delete">Usuń</button>
      </div>
    `
    projectList.appendChild(li)
  })
}

function renderActiveProject() {
  const project = ProjectStateService.getActiveProject()
  if (project) {
    activeProjectInfo.textContent = `Aktualny projekt: ${project.name}`
  } else {
    activeProjectInfo.textContent = "Brak aktywnego projektu"
  }
}

function renderStoryOptions() {
  taskStorySelect.innerHTML = ""
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) {
    return
  }

  StoryService.getStories(projectId).forEach(story => {
    const option = document.createElement("option")
    option.value = story.id
    option.textContent = story.name
    taskStorySelect.appendChild(option)
  })
}

function renderStories() {
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId || !canUseApp()) {
    storiesSection.classList.add("hidden")
    return
  }

  storiesSection.classList.remove("hidden")
  renderStoryOptions()

  ;["todo", "doing", "done"].forEach(state => {
    const ul = document.querySelector(`#stories-${state}`) as HTMLUListElement
    ul.innerHTML = ""
  })

  StoryService.getStories(projectId).forEach((story: Story) => {
    const li = document.createElement("li")
    li.className = "story-card"
    const storyState = story.state
    li.innerHTML = `
      <strong>${story.name}</strong> <span class="badge ${story.priority}">${story.priority}</span>
      <p>${story.description}</p>
      <p class="small-text">Właściciel: ${story.ownerId}</p>
      <p class="small-text">Stan: ${storyState}</p>
      <div>
        <button data-id="${story.id}" class="small edit-story">Edytuj</button>
        <button data-id="${story.id}" class="small danger delete-story">Usuń</button>
        ${storyState !== "todo" ? `<button data-id="${story.id}" data-state="todo" class="small state">todo</button>` : ""}
        ${storyState !== "doing" ? `<button data-id="${story.id}" data-state="doing" class="small state">doing</button>` : ""}
        ${storyState !== "done" ? `<button data-id="${story.id}" data-state="done" class="small state">done</button>` : ""}
      </div>
    `
    const parent = document.querySelector(`#stories-${storyState}`) as HTMLUListElement
    parent.appendChild(li)
  })
}

function ensureStoryState(storyId: string) {
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) return
  const story = StoryService.getStories(projectId).find(s => s.id === storyId)
  if (!story) return
  const tasks = TaskService.getTasksByStory(storyId)
  const allDone = tasks.length > 0 && tasks.every(task => task.state === "done")
  const anyDoing = tasks.some(task => task.state === "doing")
  const newState: StoryState = allDone ? "done" : anyDoing ? "doing" : "todo"
  if (story.state !== newState) {
    story.state = newState
    StoryService.updateStory(story)
  }
}

function renderTasks() {
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId || !canUseApp()) {
    tasksSection.classList.add("hidden")
    return
  }

  tasksSection.classList.remove("hidden")
  ;["todo", "doing", "done"].forEach(state => {
    const ul = document.querySelector(`#tasks-${state}`) as HTMLUListElement
    ul.innerHTML = ""
  })

  const tasks = TaskService.getTasksByProject(projectId)
  const users = UserService.getUsers()

  tasks.forEach((task: Task) => {
    const li = document.createElement("li")
    li.className = "task-card"
    const assignee = task.assigneeId ? users.find(user => user.id === task.assigneeId) : undefined
    const assigneeText = assignee ? `${assignee.firstName} ${assignee.lastName}` : "brak"
    const story = StoryService.getStoryById(task.storyId)
    const storyLabel = story ? story.name : task.storyId
    li.innerHTML = `
      <strong>${task.name}</strong> <span class="badge ${task.priority}">${task.priority}</span>
      <p>${task.description}</p>
      <p class="small-text">Historyjka: ${storyLabel}</p>
      <p class="small-text">Przewidywany czas: ${task.estimatedHours}h</p>
      <p class="small-text">Odpowiedzialny: ${assigneeText}</p>
      <p class="small-text">Dodano: ${new Date(task.createdAt).toLocaleDateString()}</p>
      ${task.startedAt ? `<p class="small-text">Start: ${new Date(task.startedAt).toLocaleDateString()}</p>` : ""}
      ${task.finishedAt ? `<p class="small-text">Zakończono: ${new Date(task.finishedAt).toLocaleDateString()}</p>` : ""}
      <div>
        ${task.state === "todo" ? `<button data-id="${task.id}" class="small assign-task">Przypisz</button>` : ""}
        ${task.state !== "done" ? `<button data-id="${task.id}" class="small finish-task">Zakończ</button>` : ""}
        <button data-id="${task.id}" class="small danger delete-task">Usuń</button>
      </div>
    `
    const parent = document.querySelector(`#tasks-${task.state}`) as HTMLUListElement
    parent.appendChild(li)
  })
}

function renderNotifications() {
  notificationBadge.textContent = String(NotificationService.getUnreadCount(currentUser.id))
  notificationList.innerHTML = ""
  const notifications = NotificationService.getNotifications(currentUser.id)
  if (notifications.length === 0) {
    notificationList.innerHTML = "<li>Brak powiadomień</li>"
    return
  }

  notifications.forEach(notification => {
    const li = document.createElement("li")
    li.className = "notification-card"
    li.dataset.id = notification.id
    li.innerHTML = `
      <strong>${notification.title}</strong>
      <p>${notification.message}</p>
      <p class="small-text">${new Date(notification.date).toLocaleString()} ${notification.isRead ? "" : "(nieprzeczytane)"}</p>
      <span class="badge ${notification.priority}">${notification.priority}</span>
    `
    notificationList.appendChild(li)
  })
}

function renderAll() {
  refreshCurrentUser()
  renderUserInfo()
  renderUserList()
  renderProjects()
  renderActiveProject()
  renderStories()
  renderTasks()
  renderNotifications()
}

themeToggle.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark") ? "light" : "dark")
})

loginButton.addEventListener("click", () => {
  loginPanel.classList.toggle("hidden")
})

logoutButton.addEventListener("click", () => {
  AuthService.signOut()
  UserService.logout()
  refreshCurrentUser()
  renderAll()
})

notificationsToggle.addEventListener("click", () => {
  notificationsPanel.classList.toggle("hidden")
})

closeNotificationDialog.addEventListener("click", () => {
  notificationDialog.classList.add("hidden")
})

loginForm.addEventListener("submit", e => {
  e.preventDefault()
  const email = loginEmail.value.trim()
  if (!email) return

  const existingUser = UserService.getUsers().find(user => user.email.toLowerCase() === email.toLowerCase())
  const isNewUser = !existingUser
  const user = UserService.loginByEmail(email)
  refreshCurrentUser()
  renderAll()
  loginPanel.classList.add("hidden")
  if (isNewUser && user.role === "guest") {
    notifyAdmins(
      "Nowe konto w systemie",
      `Użytkownik ${user.firstName} ${user.lastName} poprosił o dostęp.`,
      "high"
    )
  }
})

projectForm.addEventListener("submit", e => {
  e.preventDefault()
  if (!canUseApp()) return
  ProjectService.addProject(nameInput.value, descInput.value)
  notifyAdmins(
    "Utworzono nowy projekt",
    `${currentUser.firstName} ${currentUser.lastName} utworzył projekt ${nameInput.value}.`,
    "high"
  )
  projectForm.reset()
  renderAll()
})

projectList.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const id = target.dataset.id
  if (!id) return

  if (target.classList.contains("delete")) {
    ProjectService.deleteProject(id)
    if (ProjectStateService.getActiveProjectId() === id) {
      ProjectStateService.setActiveProject(null)
    }
    renderAll()
  }

  if (target.classList.contains("activate")) {
    ProjectStateService.setActiveProject(id)
    renderAll()
  }
})

storyForm.addEventListener("submit", e => {
  e.preventDefault()
  if (!canUseApp()) return
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) return

  StoryService.addStory(
    storyNameInput.value,
    storyDescInput.value,
    storyPrioritySelect.value as Priority,
    projectId,
    currentUser.id
  )
  storyForm.reset()
  renderAll()
})

storyListsContainer.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const id = target.dataset.id
  if (!id) return
  const projectId = ProjectStateService.getActiveProjectId()
  if (!projectId) return

  const story = StoryService.getStories(projectId).find(s => s.id === id)
  if (!story) return

  if (target.classList.contains("delete-story")) {
    StoryService.deleteStory(id)
    renderAll()
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
    renderAll()
    return
  }

  if (target.classList.contains("state")) {
    const newState = target.dataset.state as StoryState
    if (newState) {
      story.state = newState
      StoryService.updateStory(story)
      renderAll()
    }
  }
})

userList.addEventListener("change", e => {
  const target = e.target as HTMLSelectElement
  if (!target.classList.contains("user-role-select")) return
  const id = target.dataset.id
  if (!id) return
  const role = target.value as User["role"]
  UserService.changeRole(id, role)
  renderAll()
})

userList.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const id = target.dataset.id
  if (!id || !target.classList.contains("block-toggle")) return
  const user = UserService.getUsers().find(u => u.id === id)
  if (!user) return
  user.blocked = !user.blocked
  UserService.updateUser(user)
  renderAll()
})

taskForm.addEventListener("submit", e => {
  e.preventDefault()
  if (!canUseApp()) return
  const projectId = ProjectStateService.getActiveProjectId()
  const storyId = taskStorySelect.value
  if (!projectId || !storyId) return

  TaskService.addTask(
    taskNameInput.value,
    taskDescInput.value,
    taskPrioritySelect.value as TaskPriority,
    projectId,
    storyId,
    Number(taskEstimateInput.value)
  )
  taskForm.reset()
  renderAll()
  const story = StoryService.getStories(projectId).find(s => s.id === storyId)
  if (story) {
    NotificationService.createNotification(
      "Nowe zadanie w historyjce",
      `Dodano nowe zadanie do historyjki ${story.name}.`,
      "medium",
      story.ownerId
    )
  }
})

document.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const id = target.dataset.id
  if (!id) return

  if (target.classList.contains("assign-task")) {
    const task = TaskService.getTaskById(id)
    if (!task) return
    const assignees = UserService.getUsers().filter(user => user.role === "developer" || user.role === "devops")
    if (assignees.length === 0) {
      alert("Brak dostępnych developerów/devopsów")
      return
    }
    let assigneeId = currentUser.role === "developer" || currentUser.role === "devops" ? currentUser.id : ""
    if (!assigneeId) {
      const selection = prompt(
        `Wybierz użytkownika: ${assignees.map(user => `${user.id}:${user.firstName} ${user.lastName}`).join(", ")}`
      )
      assigneeId = selection ? selection.split(":")[0] : ""
    }
    const assignee = UserService.getUsers().find(user => user.id === assigneeId)
    if (!assignee) return
    TaskService.assignTask(task, assignee.id)
    const story = StoryService.getStories(task.projectId).find(s => s.id === task.storyId)
    if (story) {
      if (story.state === "todo") {
        story.state = "doing"
        StoryService.updateStory(story)
      }
      NotificationService.createNotification(
        "Przypisano osobę do zadania",
        `Zadanie ${task.name} zostało przypisane do ${assignee.firstName} ${assignee.lastName}.`,
        "high",
        story.ownerId
      )
    }
    renderAll()
    return
  }

  if (target.classList.contains("finish-task")) {
    const task = TaskService.getTaskById(id)
    if (!task) return
    TaskService.finishTask(task)
    ensureStoryState(task.storyId)
    const story = StoryService.getStories(task.projectId).find(s => s.id === task.storyId)
    if (story) {
      NotificationService.createNotification(
        "Zadanie zakończone",
        `Zadanie ${task.name} zostało zakończone.`,
        "medium",
        story.ownerId
      )
    }
    renderAll()
    return
  }

  if (target.classList.contains("delete-task")) {
    const task = TaskService.getTaskById(id)
    if (!task) return
    TaskService.deleteTask(id)
    ensureStoryState(task.storyId)
    const story = StoryService.getStories(task.projectId).find(s => s.id === task.storyId)
    if (story) {
      NotificationService.createNotification(
        "Usunięto zadanie",
        `Zadanie ${task.name} zostało usunięte z historyjki ${story.name}.`,
        "medium",
        story.ownerId
      )
    }
    renderAll()
    return
  }
})

notificationList.addEventListener("click", e => {
  const target = e.target as HTMLElement
  const li = target.closest("li") as HTMLLIElement | null
  if (!li) return
  const notificationId = li.dataset.id
  if (!notificationId) return
  const notification = NotificationService.getNotifications(currentUser.id).find(n => n.id === notificationId)
  if (!notification) return
  NotificationService.markAsRead(notificationId)
  renderNotifications()
  showDialog(notification)
})

initTheme()
initGoogleLogin()
renderAll()
