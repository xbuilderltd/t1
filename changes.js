import { getPackages } from '@manypkg/get-packages';
import { getChangedPackagesSinceRef } from '@changesets/git';

const allPackages = await getPackages(process.cwd());
const changed = await getChangedPackagesSinceRef({
  ref: 'origin/main',
  packages: allPackages.packages,
});

console.log(changed); // list of packages with changes
