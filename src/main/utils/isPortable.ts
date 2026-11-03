import fs from "fs";
import path from "path";

import { app } from "electron";

// The NSIS installer puts "Uninstall <name>.exe" next to the executable, the ZIP (portable) build has none
export function isPortable(): boolean {
  if (!app.isPackaged) {
    return false;
  }

  try {
    const appDir = path.dirname(process.execPath);

    return !fs.readdirSync(appDir).some((file) => /^Uninstall .+\.exe$/i.test(file));
  } catch {
    // If the folder cannot be read, keep the default behavior (treat the build as installed)
    return false;
  }
}
