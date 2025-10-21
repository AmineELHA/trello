module Types
  class ColumnType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :board, Types::BoardType, null: true
    field :tasks, [Types::TaskType], null: true
  end
end
