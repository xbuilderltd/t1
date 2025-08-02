const simpleGit = require('simple-git');
const { getPackages } = require('@manypkg/get-packages');
const path = require('path');

async function getChangesSinceLastCommit() {
  const git = simpleGit();
  const { packages } = await getPackages(process.cwd());

  // Compare against the previous commit since we're already on main
  const baseSha = 'HEAD~1';

  try {
    // Get changed files since last commit
    const diff = await git.diff([baseSha, 'HEAD', '--name-only']);
    const changedFiles = diff.split('\n').filter(Boolean);

    console.log('Changed files:', changedFiles); // Debug log

    // Get commits
    const log = await git.log({
      from: baseSha,
      to: 'HEAD',
      maxCount: 1,
    });

    const changes = {};

    packages.forEach((pkg) => {
      const pkgPath = path.relative(process.cwd(), pkg.dir);
      const pkgChangedFiles = changedFiles.filter(
        (file) => file.startsWith(pkgPath + '/') || file === `${pkgPath}/package.json`,
      );

      if (pkgChangedFiles.length > 0) {
        changes[pkg.packageJson.name] = {
          files: pkgChangedFiles,
          commits: log.all,
          version: pkg.packageJson.version,
        };
      }
    });

    return changes;
  } catch (error) {
    console.error('Error getting changes:', error);
    return {};
  }
}

getChangesSinceLastCommit().then((changes) => {
  console.log('Changes:', JSON.stringify(changes, null, 2));
});
