import { NotificationApi } from "../api/NotificationApi"
import type { Notification, NotificationPriority } from "../model/Notification"

export class NotificationService {
  static getNotifications(recipientId: string): Notification[] {
    return NotificationApi.getByRecipient(recipientId).sort((a, b) =>
      b.date.localeCompare(a.date)
    )
  }

  static getUnreadCount(recipientId: string): number {
    return this.getNotifications(recipientId).filter(n => !n.isRead).length
  }

  static createNotification(
    title: string,
    message: string,
    priority: NotificationPriority,
    recipientId: string
  ): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      date: new Date().toISOString(),
      priority,
      isRead: false,
      recipientId,
    }
    NotificationApi.create(notification)
  }

  static markAsRead(notificationId: string): void {
    const notification = NotificationApi.getAll().find(n => n.id === notificationId)
    if (!notification) return
    if (notification.isRead) return
    notification.isRead = true
    NotificationApi.update(notification)
  }
}
