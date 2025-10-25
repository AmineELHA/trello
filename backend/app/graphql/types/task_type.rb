module Types
  class TaskType < Types::BaseObject
    field :id, ID, null: false
    field :title, String, null: false
    field :description, String, null: true
    field :position, Int, null: false
    field :due_date, GraphQL::Types::ISO8601DateTime, null: true
    field :labels, [String], null: false, description: "Array of labels for the task"
    field :checklists, GraphQL::Types::JSON, null: false, description: "Array of checklist items"
    field :attachments, [String], null: false, description: "Array of attachment URLs or IDs"
    field :column, Types::ColumnType, null: true
  end
end
