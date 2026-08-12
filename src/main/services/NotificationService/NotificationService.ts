import { iconPath } from "@main/utils/iconPath";
import { Notification } from "electron";

export class NotificationService {
  static show(title: string, body: string, silent = false): void {
    // Native notification instance
    const notification = new Notification({
      icon: iconPath,
      title,
      body,
      silent,
    });

    notification.show();
  }

  // Wrapper for displaying error notifications
  static error(message: string): void {
    this.show("Error", message);
  }

  // Wrapper for displaying successful notifications
  static success(message: string): void {
    this.show("Successfully", message);
  }
}
