import { exec } from "node:child_process";

export async function checkIsAdmin() {
  if (process.platform !== "win32") {
    return process.getuid?.() === 0;
  }

  return new Promise<boolean>((resolve) => {
    exec("net session", (error) => {
      resolve(!error);
    });
  });
}
