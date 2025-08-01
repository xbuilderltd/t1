// This script wraps pnpm publish and outputs a valid JSON result for Nx compatibility
// Usage: pnpm run custom-publish

const { execSync } = require('child_process');

try {
  const output = execSync('pnpm publish -r --no-git-checks --access public', {
    stdio: 'pipe',
  }).toString();
  // Output as JSON for Nx compatibility
  console.log(JSON.stringify({ success: true, output }));
} catch (err) {
  // Print full error output for CI visibility
  if (err.stderr) {
    console.error('STDERR:', err.stderr.toString());
  }
  if (err.stdout) {
    console.error('STDOUT:', err.stdout.toString());
  }
  console.log(
    JSON.stringify({
      success: false,
      error: err.message,
      stderr: err.stderr?.toString(),
      stdout: err.stdout?.toString(),
    }),
  );
  process.exit(1);
}
