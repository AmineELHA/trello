module Types
  class BoardType < Types::BaseObject
    field :id, ID, null: false
    field :name, String, null: false
    field :user, Types::UserType, null: true
    field :columns, [Types::ColumnType], null: true
  end
end
