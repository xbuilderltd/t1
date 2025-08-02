const simpleGit = require('simple-git');
const { getPackages } = require('@manypkg/get-packages');
const path = require('path');

async function getChangesSinceLastCommit(branches = ['main']) {
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

      try {
        // Try origin/branch first
        baseSha = `origin/${branch}`;
        await git.raw(['rev-parse', '--verify', baseSha]);
      } catch (error) {
        // Fallback to local branch
        console.log(`Branch origin/${branch} not found, trying ${branch}`);
        baseSha = branch;
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

// Single branch (default main)
getChangesSinceLastCommit().then((result) => {
  console.log('Changes:', JSON.stringify(result, null, 2));
});

// Multiple branches
getChangesSinceLastCommit(['main', 'next']).then((result) => {
  console.log('Changes:', JSON.stringify(result, null, 2));
});
