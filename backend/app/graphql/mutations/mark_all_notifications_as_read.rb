module Mutations
  class MarkAllNotificationsAsRead < BaseMutation
    field :success, Boolean, null: false
    field :errors, [String], null: false

    def resolve
      user = context[:current_user]
      return { success: false, errors: ["Not authorized"] } unless user

      user.notifications.update_all(read: true)

      { success: true, errors: [] }
    end
  end
end