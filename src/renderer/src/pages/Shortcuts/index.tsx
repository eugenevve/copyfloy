import { PageWrapper } from "@app/components/PageWrapper";
import stylesGlobal from "@app/styles/page.module.css";
import { FC } from "react";

import styles from "./Shortcuts.module.css";

const groups = [
  {
    title: "Application",
    shortcuts: [
      { keys: ["Ctrl", "1"], action: "Open Home", description: "Show the task list." },
      { keys: ["Ctrl", "2"], action: "Open Labels", description: "Manage task labels." },
      { keys: ["Ctrl", "3"], action: "Open Settings", description: "Change application settings." },
      { keys: ["Ctrl", "4"], action: "Open Report", description: "View task reports." },
      { keys: ["Ctrl", "5"], action: "Open Shortcuts", description: "Show this shortcut reference." },
      { keys: ["Ctrl", "6"], action: "Open About", description: "View application information." },
      { keys: ["Ctrl", "+"], action: "Zoom in", description: "Increase the interface scale." },
      { keys: ["Ctrl", "-"], action: "Zoom out", description: "Decrease the interface scale." },
      { keys: ["Ctrl", "0"], action: "Reset zoom", description: "Restore the default interface scale." },
    ],
  },
  {
    title: "Tasks",
    shortcuts: [
      { keys: ["Ctrl", "N"], action: "Create a task", description: "Open the task creation form." },
      { keys: ["Ctrl", "F"], action: "Search tasks", description: "Focus the task search field." },
      { keys: ["↑", "↓"], action: "Select a task", description: "Focus the task list, then move the selection." },
      { keys: ["Enter"], action: "Run or stop", description: "Run the selected task, or stop it if already running." },
      { keys: ["Ctrl", "E"], action: "Edit task", description: "Open the selected task for editing." },
      { keys: ["Ctrl", "S"], action: "Set schedule", description: "Open the schedule for the selected task." },
      {
        keys: ["Delete"],
        action: "Delete task",
        description: "Ask for confirmation before deleting the selected task.",
      },
    ],
  },
  {
    title: "Labels",
    shortcuts: [
      { keys: ["Ctrl", "N"], action: "Create a label", description: "Open the label creation form." },
      { keys: ["Ctrl", "F"], action: "Search labels", description: "Focus the label search field." },
      { keys: ["↑", "↓"], action: "Select a label", description: "Focus the label list, then move the selection." },
      { keys: ["Ctrl", "E"], action: "Edit label", description: "Open the selected label for editing." },
      {
        keys: ["Delete"],
        action: "Delete label",
        description: "Ask for confirmation before deleting the selected label.",
      },
    ],
  },
];

export const Shortcuts: FC = () => {
  return (
    <PageWrapper>
      <div className={stylesGlobal.container}>
        <div className={styles.title}>Keyboard shortcuts</div>

        <div className={styles.container}>
          {groups.map(({ title, shortcuts }) => (
            <table key={title}>
              <thead>
                <tr>
                  <th colSpan={3}>{title}</th>
                </tr>
                <tr>
                  <th scope="col">Shortcut</th>
                  <th scope="col">Action</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map(({ keys, action, description }) => (
                  <tr key={action}>
                    <td>
                      <div className={styles.keys}>
                        {keys.map((key) => (
                          <div key={key}>{key}</div>
                        ))}
                      </div>
                    </td>
                    <td>{action}</td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};
