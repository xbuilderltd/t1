const simpleGit = require('simple-git');
const { getPackages } = require('@manypkg/get-packages');
const path = require('path');

async function getChangesSinceLastCommit(options = {}) {
  const {
    branches = ['main'], // Default to main branch
    compareType = 'HEAD~1', // 'HEAD~1', 'branch', or 'merge-base'
  } = options;

  const git = simpleGit();
  const { packages } = await getPackages(process.cwd());

  // Filter out private packages
  const publicPackages = packages.filter((pkg) => !pkg.packageJson.private);

  const results = {};

  try {
    // Get current branch
    const currentBranch = await git.branch();
    const currentBranchName = currentBranch.current;

    console.log(`Current branch: ${currentBranchName}`);
    console.log(`Comparing against branches: ${branches.join(', ')}`);

    for (const branch of branches) {
      let baseSha;

      if (compareType === 'HEAD~1') {
        baseSha = 'HEAD~1';
      } else if (compareType === 'branch') {
        // Compare against the tip of the specified branch
        try {
          baseSha = `origin/${branch}`;
          // Check if remote branch exists
          await git.raw(['rev-parse', '--verify', baseSha]);
        } catch (error) {
          console.log(`Branch origin/${branch} not found, trying ${branch}`);
          baseSha = branch;
        }
      } else if (compareType === 'merge-base') {
        // Find the merge base between current branch and target branch
        try {
          const mergeBase = await git.raw(['merge-base', 'HEAD', `origin/${branch}`]);
          baseSha = mergeBase.trim();
        } catch (error) {
          console.log(
            `Could not find merge-base with origin/${branch}, falling back to HEAD~1`,
          );
          baseSha = 'HEAD~1';
        }
      }

      console.log(`Comparing ${baseSha} to HEAD for branch ${branch}`);

      // Get changed files
      const diff = await git.diff([baseSha, 'HEAD', '--name-only']);
      const changedFiles = diff.split('\n').filter(Boolean);

      // Get commits
      const log = await git.log({
        from: baseSha,
        to: 'HEAD',
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
          };
        }
      });

      results[branch] = {
        baseSha,
        currentBranch: currentBranchName,
        changedFiles: changedFiles.length,
        changes,
      };
    }

    return results;
  } catch (error) {
    console.error('Error getting changes:', error);
    return {};
  }
}

// Usage examples:

// Compare against main branch (default)
// getChangesSinceLastCommit().then(result => {
//   console.log('Changes:', JSON.stringify(result, null, 2));
// });

// Compare against multiple branches
// getChangesSinceLastCommit({
//   branches: ['main', 'next'],
//   compareType: 'branch'
// }).then(result => {
//   console.log('Changes:', JSON.stringify(result, null, 2));
// });

// Compare using merge-base (recommended for feature branches)
getChangesSinceLastCommit({
  branches: ['main', 'next'],
  compareType: 'merge-base',
}).then((result) => {
  console.log('Changes:', JSON.stringify(result, null, 2));
});
