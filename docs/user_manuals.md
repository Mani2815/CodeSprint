# User Manuals & Runbook

This document provides operational instructions for Admins, Judges, and Event Organizers.

## 1. Admin User Manual

Admins have full access to the backend system to manage teams and enter scores.

### Provisioning an Admin Account
There is intentionally no registration UI. Admins must be provisioned via the CLI by a developer with database access:
```bash
npx tsx scripts/create-admin.ts <username> <password> "<Display Name>"
```

### Managing Teams
1. Navigate to `https://<domain>/admin/teams`.
2. Click **Add Team**.
3. Teams can only be added to the Active Event. Team names must be unique.
4. If a team withdraws, you can delete them from this view. *Warning: This cascades and deletes their scores and participant links.*

## 2. Judge User Manual

Judges use the same interface as Admins but focus on the Scores tab.

### Entering Scores
1. Start at `https://<domain>/login` and choose the organizer flow.
2. Navigate to the **Scores** tab in the sidebar.
3. Select the appropriate **Checkpoint** from the grid.
4. Input the score (0-1000) for each team. Changes are saved automatically (or upon submitting the row, depending on the UI flow).

### Understanding Tie-Breakers
If two teams have the same Total Score, the system automatically breaks the tie using the following logic:
1. Higher score in Checkpoint 2.
2. Higher score in Checkpoint 1.
3. The team that was registered earlier in the system.

## 3. CodeSprint Event Runbook

Follow this timeline to ensure a smooth event execution:

### Pre-Event (T-Minus 7 Days)
1. **Deploy Application**: Complete the deployment checklist (see `deployment_guide.md`).
2. **Seed Database**: Run `npm run db:seed`.
3. **Provision Admins**: Run `scripts/create-admin.ts` for every judge/organizer.
4. **Configure GitHub**: Create the GitHub OAuth App and generate the Fine-Grained PAT.

### Event Kickoff (Day 1)
1. **Register Teams**: As teams finalize their rosters, enter all Team Names into the Admin Dashboard.
2. **Participant Onboarding**: Instruct participants to visit the site, click "Continue with GitHub", accept the Ethics Agreement, and view their dashboard.
3. **Assign Participants**: Ensure participants are manually assigned to their respective teams (if applicable in the admin UI).

### Daily Operations (During the Sprint)
1. **Monitor GitHub Sync**: Ensure the cron job runs nightly at 2:00 AM. 
2. **Troubleshooting**: If a repo fails to sync, check the Vercel Logs for the specific repository error.

### Checkpoint Evaluation
1. **Judging**: Judges review code and presentations.
2. **Score Entry**: Judges log in and enter scores for the current checkpoint.
3. **Leaderboard Refresh**: The public leaderboard will automatically reflect the new rankings based on total scores.

### Post-Event
1. **Final Tally**: Enter Checkpoint 2 scores. The system will automatically calculate the final winners.
2. **Database Backup**: Take a definitive snapshot of the database.
3. **Deactivate Event**: (Optional) Modify the database to set the Event to `isActive: false` to freeze the leaderboard.
