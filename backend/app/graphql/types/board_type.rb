module Types
  class BoardType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :user, Types::UserType, null: true
    field :columns, [Types::ColumnType], null: true
    field :tasks, [Types::TaskType], null: true

    def tasks
      object.columns.includes(:tasks).flat_map(&:tasks).sort_by(&:position)
    end
  end
end
