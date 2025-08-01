// This script wraps pnpm publish and outputs a valid JSON result for Nx compatibility
// Usage: pnpm run custom-publish

const { execSync } = require('child_process');

try {
  const output = execSync('pnpm publish', { stdio: 'pipe' }).toString();
  // Output as JSON for Nx compatibility
  console.log(JSON.stringify({ success: true, output }));
} catch (err) {
  console.log(JSON.stringify({ success: false, error: err.message }));
  process.exit(1);
}
