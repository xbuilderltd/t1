export default {
  branches: [
    // Production branch for stable releases (e.g., 1.5.0)
    'main',
    // Pre-release branch for release candidates (e.g., 1.6.0-rc.1)
    {
      name: 'next',
      prerelease: 'rc',
      channel: 'next',
    },
  ],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'pnpm version ${nextRelease.version} --git-tag-version=false',
        publishCmd: 'pnpm publish --no-git-checks',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'CHANGELOG.md'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
