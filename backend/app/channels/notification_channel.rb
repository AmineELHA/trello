class NotificationChannel < ApplicationCable::Channel
  def subscribed
    # Subscribe to a stream for the current user's notifications
    stream_for current_user
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end