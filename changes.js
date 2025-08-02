const simpleGit = require('simple-git');
const { getPackages } = require('@manypkg/get-packages');
const path = require('path');

async function getChangesSinceLastPush() {
  const git = simpleGit();
  const { packages } = await getPackages(process.cwd());

  // In GitHub Actions, compare against the base branch
  const baseSha = process.env.GITHUB_BASE_REF
    ? `origin/${process.env.GITHUB_BASE_REF}`
    : 'HEAD~1';

  // Get changed files since base
  const diff = await git.diff([baseSha, 'HEAD', '--name-only']);
  const changedFiles = diff.split('\n').filter(Boolean);

  // Get commits since base
  const log = await git.log({
    from: baseSha,
    to: 'HEAD',
    format: {
      hash: '%H',
      message: '%s',
      author_name: '%an',
      author_email: '%ae',
    },
  });

  const changes = {};

  packages.forEach((pkg) => {
    const pkgPath = path.relative(process.cwd(), pkg.dir);
    const pkgChangedFiles = changedFiles.filter(
      (file) => file.startsWith(pkgPath + '/') || file === pkgPath,
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
}

// Usage
getChangesSinceLastPush().then((changes) => {
  console.log('Changes:', changes);
  // Output like: { '@pixpilot/cs1': { files: [...], commits: [...] } }
});
