import { syncGithubActivity } from '../src/services/github-sync-service';
async function main() {
  const result = await syncGithubActivity();
  console.log(result);
}
main().catch(console.error);
