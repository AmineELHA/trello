class Notification < ApplicationRecord
  belongs_to :user
  belongs_to :task

  after_create :trigger_notification_subscription

  private

  def trigger_notification_subscription
    # Trigger the GraphQL subscription for the user
    BackendSchema.subscriptions.trigger(
      :notification_added, 
      { user_id: self.user_id.to_s }, 
      self
    )
  end
end
