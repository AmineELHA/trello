#!/bin/bash
# Script to set up cron job for task reminders

# This script will add the necessary cron job to check for task reminders every minute
# Usage: Run this script with sudo privileges or have your system administrator run it

# Define the cron job entry
CRON_JOB="* * * * * cd /home/amine/projects/trello/backend && bundle exec rake task_reminders:check >/dev/null 2>&1"

# Check if the cron job already exists
if crontab -l | grep -Fq "task_reminders:check"; then
    echo "Cron job for task reminders already exists."
else
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "Cron job for task reminders has been added."
fi

echo "Current cron jobs:"
crontab -l