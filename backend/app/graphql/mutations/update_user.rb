module Mutations
  class UpdateUser < BaseMutation
    argument :first_name, String, required: false
    argument :last_name, String, required: false
    argument :username, String, required: false
    argument :avatar, String, required: false

    field :user, Types::UserType, null: true
    field :errors, [String], null: false

    def resolve(**args)
      user = context[:current_user]
      return { user: nil, errors: ["Not authenticated"] } unless user

      Rails.logger.info "UpdateUser mutation called with raw args: #{args.inspect}"
      Rails.logger.info "Current user before update: #{user.inspect}"

      # Extract the arguments (GraphQL-Ruby should handle camelCase to snake_case conversion)
      first_name = args[:first_name]
      last_name = args[:last_name]
      username = args[:username]
      avatar = args[:avatar]

      Rails.logger.info "Extracted values - first_name: #{first_name}, last_name: #{last_name}, username: #{username}, avatar: #{avatar}"

      # Build update parameters hash
      update_params = {}
      update_params[:first_name] = first_name if first_name
      update_params[:last_name] = last_name if last_name
      update_params[:username] = username if username
      update_params[:avatar] = avatar if avatar

      # Debug: print what will be updated
      Rails.logger.info "UpdateUser will update with params: #{update_params.inspect}"

      # If there are attributes to update
      if update_params.any?
        # Use update method which allows for validation but only updates provided fields
        if user.update(update_params)
          Rails.logger.info "User updated successfully: #{user.inspect}"
          { user: user, errors: [] }
        else
          Rails.logger.info "User updated failed with errors: #{user.errors.full_messages.inspect}"
          { user: nil, errors: user.errors.full_messages }
        end
      else
        # If no attributes provided, return the current user
        Rails.logger.info "No attributes provided for update, returning current user"
        { user: user, errors: [] }
      end
    end
  end
end