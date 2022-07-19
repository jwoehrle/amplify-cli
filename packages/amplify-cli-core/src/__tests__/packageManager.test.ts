import * as path from 'path';
import which from 'which';
import { getPackageManager } from '../utils';

jest.mock('which');

describe('packageManager tests', () => {
  const baseDirectory = path.join(__dirname, 'testFiles');
  const whichMock = which as jest.Mocked<typeof which>;

  beforeEach(() => jest.clearAllMocks());

  test('throw error when rootPath does not exist', () => {
    const testDirectory = path.join(baseDirectory, 'packageManager-this-directory-should-not-exist');
    expect(() => getPackageManager(testDirectory))
      .toThrowError(`The provided root path ${testDirectory} does not exist.`);
  });

  test('accept undefined rootPath without error', () => {
    const mockCwd = jest.spyOn(process, 'cwd').mockImplementation(() => '/');
    const packageManager = getPackageManager();
    expect(mockCwd).toHaveBeenCalled();
    expect(packageManager).toBeNull();
  });

  test('returns null when no package.json found', () => {
    const testDirectory = path.join(baseDirectory, 'packageManager-null');

    const packageManager = getPackageManager(testDirectory);

    expect(packageManager).toBeNull();
  });

  test('detects yarn correctly', () => {
    whichMock.sync.mockReturnValue('/path/to/yarn');

    const testDirectory = path.join(baseDirectory, 'packageManager-yarn');

    const packageManager = getPackageManager(testDirectory);

    expect(whichMock.sync).toBeCalledTimes(1);
    expect(packageManager).toBeDefined();
    expect(packageManager!.packageManager).toEqual('yarn');
  });

  test('detects npm correctly', () => {
    const testDirectory = path.join(baseDirectory, 'packageManager-npm');

    const packageManager = getPackageManager(testDirectory);

    expect(packageManager).toBeDefined();
    expect(packageManager!.packageManager).toEqual('npm');
  });

  test('detects yarn fallback correctly when yarn in path', () => {
    whichMock.sync.mockReturnValue('/path/to/yarn');

    const testDirectory = path.join(baseDirectory, 'packageManager-fallback');

    const packageManager = getPackageManager(testDirectory);

    expect(whichMock.sync).toBeCalledTimes(1);
    expect(packageManager).toBeDefined();
    expect(packageManager!.packageManager).toEqual('yarn');
  });

  test('detects npm fallback correctly when yarn is not in path', () => {
    (whichMock.sync as any).mockReturnValue(undefined);

    const testDirectory = path.join(baseDirectory, 'packageManager-fallback');

    const packageManager = getPackageManager(testDirectory);

    expect(whichMock.sync).toBeCalledTimes(1);
    expect(packageManager).toBeDefined();
    expect(packageManager!.packageManager).toEqual('npm');
  });
});
