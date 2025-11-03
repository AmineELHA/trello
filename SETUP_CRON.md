# Setting up Cron Job for Task Reminders

## Overview
The Trello clone application includes a task reminder system that requires a scheduled cron job to check for and send notifications at the specified times. This document explains how to set it up.

## Required Cron Job
The application needs a cron job that runs every minute to check for upcoming task reminders.

## Manual Setup
To manually add the cron job, run these commands:

```bash
# Edit your crontab
crontab -e

# Add this line to run the task reminder check every minute:
* * * * * cd /home/amine/projects/trello/backend && bundle exec rake task_reminders:check >/dev/null 2>&1
```

## Using the Setup Script
Alternatively, you can run the provided setup script:

```bash
# Make the script executable
chmod +x /home/amine/projects/trello/set_cron_job.sh

# Run the script (may require sudo depending on your system setup)
sudo /home/amine/projects/trello/set_cron_job.sh
```

## Cron Job Explanation
- `* * * * *` means "every minute"
- `cd /home/amine/projects/trello/backend` changes to the backend directory
- `bundle exec rake task_reminders:check` runs the rake task that checks for reminders
- `>/dev/null 2>&1` redirects output to prevent email notifications from cron

## Verification
To verify the cron job is set up correctly:
```bash
crontab -l
```

## Testing
To test if the system works:
1. Create a task with a reminder set for a few minutes in the future
2. Wait for the specified time
3. Check the notifications section of the application
4. Also check `backend/log/` for log entries from `TaskReminderJob`

## Notes
- The cron job should run with the same user that has access to the application files
- Ensure the Ruby environment and Bundler are properly configured for the cron environment
- In production, this would typically be set up as part of the deployment process