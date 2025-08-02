import { execSync } from 'child_process';
import fs from 'fs';

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

// Get recent commits that might need changesets (last 10 commits, excluding merge and chore commits)
const recentCommits = execSync('git log -10 --format=%s --no-merges')
  .toString()
  .trim()
  .split('\n')
  .filter(msg => !msg.startsWith('chore:') && !msg.startsWith('chore(') && msg.trim());

console.log(`Found ${recentCommits.length} potential commits to process`);

let changesetCreated = false;

for (const commitMessage of recentCommits) {
  console.log(`Checking: ${commitMessage}`);
  
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
    // Check if a changeset already exists for this package with similar content
    const existingChangesets = fs.readdirSync('.changeset')
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => fs.readFileSync(`.changeset/${file}`, 'utf8'));
    
    const isDuplicate = existingChangesets.some(content => 
      content.includes(`"${packageName}": ${changeType}`) && 
      content.includes(description)
    );
    
    if (isDuplicate) {
      console.log(`⚠️ Changeset for ${packageName} with similar content already exists, skipping.`);
    } else {
      const changeset = `---\n"${packageName}": ${changeType}\n---\n\n${description}\n`;
      const filename = `${Date.now()}-${packageName.replace(/[@\/]/g, '-')}.md`;
      fs.writeFileSync(`.changeset/${filename}`, changeset);
      console.log(`✅ Created changeset for ${packageName}: ${filename}`);
      changesetCreated = true;
    }
  } else {
    console.log(`⚠️ No valid package scope found for: ${commitMessage}`);
  }
}

if (changesetCreated) {
  console.log('✅ Changeset generation completed successfully');
} else {
  console.log('⚠️ No new changesets created. Valid scopes are:', Object.keys(validScopes).join(', '));
}
