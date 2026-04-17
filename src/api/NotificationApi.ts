import type { Notification } from "../model/Notification"

const STORAGE_KEY = "manage-me-notifications"

export class NotificationApi {
  private static read(): Notification[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private static write(notifications: Notification[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }

  static getAll(): Notification[] {
    return this.read()
  }

  static getByRecipient(recipientId: string): Notification[] {
    return this.read().filter(n => n.recipientId === recipientId)
  }

  static create(notification: Notification): void {
    const notifications = this.read()
    notifications.push(notification)
    this.write(notifications)
  }

  static update(updated: Notification): void {
    const notifications = this.read().map(n =>
      n.id === updated.id ? updated : n
    )
    this.write(notifications)
  }
}
