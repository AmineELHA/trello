# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :node, Types::NodeType, null: true, description: "Fetches an object given its ID." do
      argument :id, ID, required: true, description: "ID of the object."
    end

    def node(id:)
      context.schema.object_from_id(id, context)
    end

    field :nodes, [Types::NodeType, null: true], null: true, description: "Fetches a list of objects given a list of IDs." do
      argument :ids, [ID], required: true, description: "IDs of the objects."
    end

    def nodes(ids:)
      ids.map { |id| context.schema.object_from_id(id, context) }
    end

    # 🔹 Fetch all boards for the logged-in user
    field :boards, [Types::BoardType], null: false, description: "All boards for the current user"

    def boards
      user = context[:current_user]
      raise GraphQL::ExecutionError, "Not authenticated" unless user

      user.boards.includes(columns: :tasks)
    end

    # 🔹 Fetch a single board by ID
    field :board, Types::BoardType, null: true do
      description "Find a board by ID"
      argument :id, ID, required: true
    end

    def board(id:)
      user = context[:current_user]
      raise GraphQL::ExecutionError, "Not authenticated" unless user

      user.boards.find_by(id: id)
    end

    # 🔹 Fetch the current user
    field :current_user, Types::UserType, null: true, description: "The currently authenticated user"

    def current_user
      context[:current_user]
    end

    # 🔹 Fetch notifications for the current user
    field :notifications, [Types::NotificationType], null: false, description: "All notifications for the current user"

    def notifications
      user = context[:current_user]
      raise GraphQL::ExecutionError, "Not authenticated" unless user

      user.notifications.includes(:task).order(created_at: :desc)
    end

    # TODO: remove me (generated example)
    field :test_field, String, null: false, description: "An example field added by the generator"
    def test_field
      "Hello World!"
    end
  end
end
