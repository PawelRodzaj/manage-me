import { ProjectService } from "./services/ProjectService"
import type { Project } from "./model/Project"

const form = document.querySelector("#project-form") as HTMLFormElement
const list = document.querySelector("#project-list") as HTMLUListElement
const nameInput = document.querySelector("#name") as HTMLInputElement
const descInput = document.querySelector("#description") as HTMLInputElement

function render(): void {
  list.innerHTML = ""
  const projects = ProjectService.getProjects()

  projects.forEach((project: Project) => {
    const li = document.createElement("li")

    li.innerHTML = `
      <strong>${project.name}</strong> - ${project.description}
      <button data-id="${project.id}" class="delete">Usuń</button>
    `

    list.appendChild(li)
  })
}

form.addEventListener("submit", (e) => {
  e.preventDefault()

  ProjectService.addProject(nameInput.value, descInput.value)

  form.reset()
  render()
})

list.addEventListener("click", (e) => {
  const target = e.target as HTMLElement

  if (target.classList.contains("delete")) {
    const id = target.dataset.id
    if (id) {
      ProjectService.deleteProject(id)
      render()
    }
  }
})

render()