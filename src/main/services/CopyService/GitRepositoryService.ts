import { spawn } from "node:child_process";
import path from "node:path";

import { RepositoryProvider, ITask } from "@shared/types/tasks";
import fs from "fs-extra";

export async function isGitAvailable(): Promise<boolean> {
  try {
    await runGit(["--version"], process.env);
    return true;
  } catch {
    return false;
  }
}

// Clones a Git repository specified in the task, handling private repositories and existing clones
export async function cloneRepository(
  task: ITask,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<string> {
  if (!(await isGitAvailable())) {
    throw new Error("Git is not installed or is not available in PATH");
  }

  if (task.repositoryProvider !== RepositoryProvider.GITHUB && task.repositoryProvider !== RepositoryProvider.GITLAB) {
    throw new Error("Unsupported repository provider");
  }

  const repositoryUrl = new URL(task.source);
  const expectedHost = task.repositoryProvider === RepositoryProvider.GITHUB ? "github.com" : "gitlab.com";

  if (
    repositoryUrl.protocol !== "https:" ||
    repositoryUrl.hostname.toLowerCase() !== expectedHost ||
    repositoryUrl.username ||
    repositoryUrl.password
  ) {
    throw new Error(`Repository URL must be an HTTPS ${expectedHost} URL`);
  }

  const repositoryPath = repositoryUrl.pathname.replace(/\/+$/, "");
  const repositoryParts = repositoryPath.split("/").filter(Boolean);
  const repositoryName = repositoryParts.at(-1)?.replace(/\.git$/i, "");
  if (repositoryParts.length < 2 || !repositoryName) {
    throw new Error("Repository URL does not contain a repository name");
  }

  repositoryUrl.search = "";
  repositoryUrl.hash = "";
  const destination = path.join(task.target, repositoryName);
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0" };

  if (task.isPrivate && task.accessToken) {
    const username = task.repositoryProvider === RepositoryProvider.GITHUB ? "x-access-token" : "oauth2";
    const authorization = Buffer.from(`${username}:${task.accessToken}`).toString("base64");
    env.GIT_CONFIG_COUNT = "1";
    env.GIT_CONFIG_KEY_0 = "http.extraheader";
    env.GIT_CONFIG_VALUE_0 = `Authorization: Basic ${authorization}`;
  }

  const gitDirectory = path.join(destination, ".git");
  if (await fs.pathExists(gitDirectory)) {
    const currentRemote = await runGit(["-C", destination, "remote", "get-url", "origin"], env);
    if (currentRemote.trim() !== repositoryUrl.toString()) {
      throw new Error("The destination already contains a different repository");
    }

    await runGit(["-C", destination, "pull", "--ff-only", "--progress"], env, onProgress, signal);
    return destination;
  }

  const destinationExisted = await fs.pathExists(destination);

  try {
    await runGit(["clone", "--progress", "--", repositoryUrl.toString(), destination], env, onProgress, signal);
  } catch (error) {
    // Remove only a partial clone created by this run, never a pre-existing folder
    if (signal?.aborted && !destinationExisted) {
      await fs.remove(destination).catch(() => undefined);
    }

    throw error;
  }

  return destination;
}

// Extracts overall percent (0-100) from git's stderr progress lines
function parseGitProgress(chunk: string): number | null {
  let result: number | null = null;

  for (const match of chunk.matchAll(/(Receiving objects|Resolving deltas):\s+(\d+)%/g)) {
    const value = Number(match[2]);
    result = match[1] === "Receiving objects" ? Math.floor(value * 0.9) : 90 + Math.floor(value * 0.1);
  }

  return result;
}

function runGit(
  args: string[],
  env: NodeJS.ProcessEnv,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    const git = spawn("git", args, {
      env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    let errorOutput = "";

    // Kill git on abort; the "close" handler rejects after git has exited
    const onAbort = (): void => {
      git.kill();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
    }

    git.stdout?.setEncoding("utf8");
    git.stdout?.on("data", (chunk: string) => {
      output = `${output}${chunk}`.slice(-4000);
    });
    git.stderr?.setEncoding("utf8");
    git.stderr?.on("data", (chunk: string) => {
      errorOutput = `${errorOutput}${chunk}`.slice(-4000);

      const percent = onProgress ? parseGitProgress(chunk) : null;
      if (percent !== null) {
        onProgress?.(percent);
      }
    });
    git.on("error", reject);
    git.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(errorOutput.trim() || `git command exited with code ${code}`));
      }
    });
  });
}
