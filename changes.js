const simpleGit = require('simple-git');
const { getPackages } = require('@manypkg/get-packages');
const path = require('path');
const { createChangesetFile } = require('./createChangesetFile');
const { getChangeTypeAndDescription } = require('./getChangeTypeAndDescription');

async function getChangesSinceLastCommit() {
  const git = simpleGit();
  const { packages } = await getPackages(process.cwd());

  // Filter out private packages
  const publicPackages = packages.filter((pkg) => !pkg.packageJson.private);

  const baseSha = 'HEAD~1';

  try {
    // Get changed files since last commit
    const diff = await git.diff([baseSha, 'HEAD', '--name-only']);
    const changedFiles = diff.split('\n').filter(Boolean);

    console.log('Changed files:', changedFiles); // Debug log
    console.log(
      'Public packages:',
      publicPackages.map((p) => p.packageJson.name),
    ); // Debug log

    // Get commits
    const log = await git.log({
      from: baseSha,
      to: 'HEAD',
      maxCount: 1,
    });

    const changes = {};

    // Only process public packages
    publicPackages.forEach((pkg) => {
      const pkgPath = path.relative(process.cwd(), pkg.dir);
      const pkgChangedFiles = changedFiles.filter(
        (file) => file.startsWith(pkgPath + '/') || file === `${pkgPath}/package.json`,
      );

      if (pkgChangedFiles.length > 0) {
        changes[pkg.packageJson.name] = {
          files: pkgChangedFiles,
          commits: log.all,
          version: pkg.packageJson.version,
          private: pkg.packageJson.private || false, // For clarity
        };
      }
    });

    return changes;
  } catch (error) {
    console.error('Error getting changes:', error);
    return {};
  }
}

// Commit message patterns for change type detection
const commitPatterns = {
  major: /^BREAKING CHANGE: (.+)/,
  minor: /^feat\(([^)]+)\): (.+)/,
  patch: /^fix\(([^)]+)\): (.+)/,
};

getChangesSinceLastCommit().then((changes) => {
  console.log('Changes (public packages only):', JSON.stringify(changes, null, 2));
  Object.entries(changes).forEach(([packageName, info]) => {
    if (info.commits && info.commits.length > 0) {
      const commit = info.commits[0];
      const { changeType, scope, description } = getChangeTypeAndDescription(
        commit.message,
      );
      // Map scope to package name if possible
      const validScopes = ['core', 'react', 'web-component'];
      if (!scope || validScopes.includes(scope)) {
        // If scope matches part of packageName, allow changeset creation
        if (!scope || packageName.includes(scope)) {
          createChangesetFile(packageName, changeType, description);
        } else {
          console.log(
            `⚠️ Commit scope '${scope}' does not match package name '${packageName}'.`,
          );
        }
      } else {
        console.log(
          `⚠️ No valid package scope found in commit message. Valid scopes are: ${validScopes.join(', ')}`,
        );
      }
    }
  });
});
