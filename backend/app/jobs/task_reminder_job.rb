class TaskReminderJob < ApplicationJob
  queue_as :default

  def perform
    # Find tasks with reminder dates that match the current time (up to the minute)
    # Using UTC time to avoid timezone issues
    current_time = Time.current.beginning_of_minute
    current_date = current_time.to_date
    
    # More robust query to find tasks with matching date and time
    tasks_with_reminders = Task
      .where("DATE(reminder_date AT TIME ZONE 'UTC') = ?", current_date)
      .where("EXTRACT(hour FROM reminder_date AT TIME ZONE 'UTC') = ?", current_time.hour)
      .where("EXTRACT(minute FROM reminder_date AT TIME ZONE 'UTC') = ?", current_time.min)
      .includes(column: { board: :user })

    Rails.logger.info "Found #{tasks_with_reminders.length} tasks with reminders for #{current_time}"

    tasks_with_reminders.each do |task|
      # Send notification to the user associated with the task's board
      user = task.column.board.user
      send_reminder_notification(user, task)
    end
  end

  private

  def send_reminder_notification(user, task)
    # Create an in-app notification
    due_date_str = task.due_date ? task.due_date.strftime('%B %d, %Y') : 'No due date set'
    message = "Reminder: Task '#{task.title}' has a reminder. Due date: #{due_date_str}"
    
    notification = Notification.create!(
      user: user,
      task: task,
      message: message
    )
    
    Rails.logger.info "Reminder notification created for task '#{task.title}' to user '#{user.email}' at #{Time.current}"
    
    # Broadcast the notification to the user via ActionCable
    NotificationChannel.broadcast_to(user, {
      notification: {
        id: notification.id,
        message: notification.message,
        createdAt: notification.created_at,
        read: notification.read,
        task: {
          id: task.id,
          title: task.title
        }
      }
    })
    
    # In a real implementation, you might also:
    # 1. Send an email reminder
    # UserMailer.task_reminder(user, task).deliver_now
    
    # 2. Send a push notification
    # PushNotificationService.send_reminder(user, task)
  end
end