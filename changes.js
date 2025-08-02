import { getPackages } from '@manypkg/get-packages';
import getReleasePlan from '@changesets/get-release-plan';

const allPackages = await getPackages(process.cwd());
const releasePlan = await getReleasePlan(process.cwd(), 'origin/main');

console.log(releasePlan.releases); // list of packages to be released
