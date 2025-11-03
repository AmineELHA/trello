# lib/tasks/task_reminders.rake
namespace :task_reminders do
  desc "Check for and send task reminders"
  task check: :environment do
    TaskReminderJob.perform_now
  end
end