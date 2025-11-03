module Types
  class NotificationType < Types::BaseObject
    field :id, ID, null: false
    field :message, String, null: false
    field :read, Boolean, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :task, Types::TaskType, null: true
  end
end