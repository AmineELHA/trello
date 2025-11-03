module Mutations
  class MarkNotificationAsRead < BaseMutation
    argument :id, ID, required: true

    field :notification, Types::NotificationType, null: true
    field :errors, [String], null: false

    def resolve(id:)
      user = context[:current_user]
      return { notification: nil, errors: ["Not authorized"] } unless user

      notification = user.notifications.find_by(id: id)
      return { notification: nil, errors: ["Notification not found"] } unless notification

      notification.update!(read: true)

      { notification: notification, errors: [] }
    end
  end
end