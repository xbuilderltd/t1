const fs = require('fs');

function createChangesetFile(packageName, changeType, description) {
  const trimmedName = packageName.trim();
  const trimmedDesc = description?.trim() || 'No description provided.';
  const changesetContent = `---\n'${trimmedName}': ${changeType}\n---\n${trimmedDesc}\n`;
  const changesetDir = '.changeset';
  if (!fs.existsSync(changesetDir)) {
    fs.mkdirSync(changesetDir);
  }
  const filePath = `${changesetDir}/auto-${Date.now()}.md`;
  fs.writeFileSync(filePath, changesetContent);
  return filePath;
}

module.exports = { createChangesetFile };
