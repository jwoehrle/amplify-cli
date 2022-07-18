import * as fs from 'fs-extra';
import * as path from 'path';
import * as which from 'which';

/**
 * The type of package manager. Supported values are 'yarn' and 'npm
 */
export type PackageManagerType = 'yarn' | 'npm';

const packageJson = 'package.json';

/**
 * Representation of a package manager (including lock file and executable name)
 */
export type PackageManager = {
  packageManager: PackageManagerType;
  lockFile: string;
  executable: string;
};

const isWindows = process.platform === 'win32';

const packageManagers: Record<string, PackageManager> = {
  npm: {
    packageManager: 'npm',
    lockFile: 'package-lock.json',
    executable: isWindows ? 'npm.cmd' : 'npm',
  },
  yarn: {
    packageManager: 'yarn',
    lockFile: 'yarn.lock',
    executable: isWindows ? 'yarn.cmd' : 'yarn',
  },
};

/**
  * Detect the package manager in the passed in directory or process.cwd, with a preference to yarn over npm
  * 1. Check if the given directory exists, if not throw an error
  * 2. Check if a package.json file present in the directory as it is mandatory, if not return null
  * 3. Check if yarn.lock is present and yarn is present on the system
  * 4. Check if package-lock.json is present
  * 5. Check if yarn present on the system
  * 6. Fallback to npm

  @throws Will throw an error if the given rootPath does not exist.
  @returns {PackageManager | null} instance for the package manager that was detected or null if not found.

 */
export const getPackageManager = (rootPath?: string): PackageManager | null => {
  const effectiveRootPath = rootPath ?? process.cwd();

  if (!fs.existsSync(effectiveRootPath)) {
    throw new Error(`The provided root path ${rootPath} does not exist.`);
  }

  // eslint-disable-next-line spellcheck/spell-checker
  const checkExecutable = (executable: string): string | null => which.sync(executable, { nothrow: true });

  let tempFilePath = path.join(effectiveRootPath, packageJson);

  if (!fs.existsSync(tempFilePath)) {
    return null;
  }

  tempFilePath = path.join(effectiveRootPath, packageManagers.yarn.lockFile);

  if (fs.existsSync(tempFilePath) && checkExecutable(packageManagers.yarn.executable)) {
    return packageManagers.yarn;
  }

  tempFilePath = path.join(effectiveRootPath, packageManagers.npm.lockFile);

  if (fs.existsSync(tempFilePath)) {
    return packageManagers.npm;
  }

  // No lock files present at this point

  if (checkExecutable(packageManagers.yarn.executable)) {
    return packageManagers.yarn;
  }

  return packageManagers.npm;
};
