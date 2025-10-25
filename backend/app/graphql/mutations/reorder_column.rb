module Mutations
  class ReorderColumn < BaseMutation
    argument :column_id, ID, required: true
    argument :new_position, Integer, required: true

    field :column, Types::ColumnType, null: true
    field :errors, [String], null: false

    def resolve(column_id:, new_position:)
      user = context[:current_user]
      return { column: nil, errors: ["Not authorized"] } unless user

      column = Column.find_by(id: column_id)
      return { column: nil, errors: ["Column not found"] } unless column

      # Check if user has access to this column
      return { column: nil, errors: ["Not authorized"] } unless column.board.user == user

      # Get the board for this column
      board = column.board

      # Shift other columns down if they were at or after the new position
      board.columns.where('position >= ?', new_position).where.not(id: column.id).update_all('position = position + 1')

      # Set new position for the column
      column.position = new_position

      if column.save
        { column: column, errors: [] }
      else
        # Rollback position changes if save fails
        { column: nil, errors: column.errors.full_messages }
      end
    end
  end
end