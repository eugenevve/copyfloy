import { exec } from "node:child_process";

export async function checkIsAdmin(): Promise<boolean> {
  if (process.platform !== "win32") {
    return process.getuid?.() === 0;
  }

  return new Promise((resolve) => {
    exec("net session", (error) => {
      resolve(!error);
    });
  });
}
