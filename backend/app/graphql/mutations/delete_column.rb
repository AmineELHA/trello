module Mutations
  class DeleteColumn < BaseMutation
    argument :id, ID, required: true

    field :column, Types::ColumnType, null: true
    field :errors, [String], null: false

    def resolve(id:)
      user = context[:current_user]
      return { column: nil, errors: ["Not authorized"] } unless user

      column = Column.find_by(id: id)
      return { column: nil, errors: ["Column not found"] } unless column

      # Check if user has access to this column
      return { column: nil, errors: ["Not authorized"] } unless column.board.user == user

      if column.destroy
        { column: column, errors: [] }
      else
        { column: nil, errors: column.errors.full_messages }
      end
    end
  end
end