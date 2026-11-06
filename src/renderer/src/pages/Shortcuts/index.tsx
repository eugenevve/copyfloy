import { PageWrapper } from "@app/components/PageWrapper";
import stylesGlobal from "@app/styles/page.module.css";
import { FC } from "react";

import styles from "./Shortcuts.module.css";

const shortcutGroups = [
  {
    title: "Application",
    shortcuts: [
      { keys: ["Ctrl / Cmd", "1"], action: "Open Home", description: "Show the task list." },
      { keys: ["Ctrl / Cmd", "2"], action: "Open Labels", description: "Manage task labels." },
      { keys: ["Ctrl / Cmd", "3"], action: "Open Settings", description: "Change application settings." },
      { keys: ["Ctrl / Cmd", "4"], action: "Open Report", description: "View task reports." },
      { keys: ["Ctrl / Cmd", "5"], action: "Open Shortcuts", description: "Show this shortcut reference." },
      { keys: ["Ctrl / Cmd", "6"], action: "Open About", description: "View application information." },
      { keys: ["Ctrl / Cmd", "+"], action: "Zoom in", description: "Increase the interface scale." },
      { keys: ["Ctrl / Cmd", "-"], action: "Zoom out", description: "Decrease the interface scale." },
      { keys: ["Ctrl / Cmd", "0"], action: "Reset zoom", description: "Restore the default interface scale." },
    ],
  },
  {
    title: "Tasks",
    shortcuts: [
      { keys: ["Ctrl / Cmd", "N"], action: "Create a task", description: "Open the task creation form." },
      { keys: ["Ctrl / Cmd", "F"], action: "Search tasks", description: "Focus the task search field." },
      { keys: ["↑", "↓"], action: "Select a task", description: "Focus the task list, then move the selection." },
      { keys: ["Enter"], action: "Run or stop", description: "Run the selected task, or stop it if already running." },
      { keys: ["Ctrl / Cmd", "E"], action: "Edit task", description: "Open the selected task for editing." },
      { keys: ["Ctrl / Cmd", "S"], action: "Set schedule", description: "Open the schedule for the selected task." },
      { keys: ["Delete"], action: "Delete task", description: "Ask for confirmation before deleting the selected task." },
    ],
  },
  {
    title: "Labels",
    shortcuts: [
      { keys: ["Ctrl / Cmd", "N"], action: "Create a label", description: "Open the label creation form." },
      { keys: ["Ctrl / Cmd", "F"], action: "Search labels", description: "Focus the label search field." },
      { keys: ["↑", "↓"], action: "Select a label", description: "Focus the label list, then move the selection." },
      { keys: ["Ctrl / Cmd", "E"], action: "Edit label", description: "Open the selected label for editing." },
      { keys: ["Delete"], action: "Delete label", description: "Ask for confirmation before deleting the selected label." },
    ],
  },
];

export const Shortcuts: FC = () => {
  return (
    <PageWrapper>
      <div className={`${stylesGlobal.container} ${styles.page}`}>
        <h1 className={styles.title}>Keyboard shortcuts</h1>
        {shortcutGroups.map(({ title, shortcuts }) => (
          <section className={styles.group} key={title}>
            <h2 className={styles.groupTitle}>{title}</h2>
            <table className={styles.table}>
              <thead>
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
                      <span className={styles.keys}>
                        {keys.map((key) => (
                          <kbd key={key}>{key}</kbd>
                        ))}
                      </span>
                    </td>
                    <td className={styles.action}>{action}</td>
                    <td className={styles.description}>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </PageWrapper>
  );
};
