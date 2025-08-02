const commitPatterns = {
  major: /^BREAKING CHANGE: (.+)/,
  minor: /^feat\(([^)]+)\): (.+)/,
  patch: /^fix\(([^)]+)\): (.+)/,
};

function getChangeTypeAndDescription(message) {
  for (const [type, pattern] of Object.entries(commitPatterns)) {
    const match = message.match(pattern);
    if (match) {
      return {
        changeType: type,
        scope: match[2] || null,
        description: match[3] || match[1] || '',
      };
    }
  }
  return { changeType: 'patch', scope: null, description: message };
}

module.exports = { getChangeTypeAndDescription };
