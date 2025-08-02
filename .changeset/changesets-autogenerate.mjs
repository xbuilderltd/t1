import { execSync } from 'child_process';
import fs from 'fs';

// Get the most recent commit message
const commitMessage = execSync('git log -1 --format=%s').toString().trim();

// Define valid scopes and their corresponding package names
const validScopes = {
  'a5': '@pixpilot/cs1',
  'a6': '@pixpilot/cs2'
};

// Define regex patterns
const commitPatterns = {
  major: /^BREAKING CHANGE: (.+)/,
  minor: /^feat\(([^)]+)\): (.+)/,
  patch: /^fix\(([^)]+)\): (.+)/,
};

// Identify type, package, and description
let packageName = null;
let changeType = null;
let description = null;

if (commitPatterns.major.test(commitMessage)) {
  changeType = 'major';
  description = commitMessage.match(commitPatterns.major)?.[1];
} else if (commitPatterns.minor.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.minor)?.[1];
  description = commitMessage.match(commitPatterns.minor)?.[2];
  
  // First try direct scope mapping
  if (validScopes[scope]) {
    packageName = validScopes[scope];
    changeType = 'minor';
  } else {
    // Try to extract package from description
    const packageMatch = description.match(/package\s+(a[56])/i);
    if (packageMatch && validScopes[packageMatch[1]]) {
      packageName = validScopes[packageMatch[1]];
      changeType = 'minor';
    }
  }
} else if (commitPatterns.patch.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.patch)?.[1];
  description = commitMessage.match(commitPatterns.patch)?.[2];
  
  // First try direct scope mapping
  if (validScopes[scope]) {
    packageName = validScopes[scope];
    changeType = 'patch';
  } else {
    // Try to extract package from description
    const packageMatch = description.match(/package\s+(a[56])/i);
    if (packageMatch && validScopes[packageMatch[1]]) {
      packageName = validScopes[packageMatch[1]];
      changeType = 'patch';
    }
  }
}

if (packageName && changeType && description) {
  const changeset = `---\n"${packageName}": ${changeType}\n---\n\n${description}\n`;
  const filename = `${Date.now()}-${packageName.replace(/[@\/]/g, '-')}.md`;
  fs.writeFileSync(`.changeset/${filename}`, changeset);
  console.log(`Created changeset for ${packageName}: ${filename}`);
} else {
  console.log('⚠️ No valid package scope found in commit message. Valid scopes are:', Object.keys(validScopes).join(', '));
}
