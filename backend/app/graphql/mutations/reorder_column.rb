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
      
      # Get the current position of the column
      old_position = column.position

      # If the new position is the same as the old position, return early
      return { column: column, errors: [] } if old_position == new_position

      # Wrap in transaction to ensure consistency
      result = ActiveRecord::Base.transaction do
        if new_position > old_position
          # Moving to a higher position (e.g., from position 1 to 3)
          # Shift columns in between down by 1
          board.columns
               .where('position > ? AND position <= ?', old_position, new_position)
               .where.not(id: column.id)
               .update_all('position = position - 1')
        else
          # Moving to a lower position (e.g., from position 3 to 1)
          # Shift columns in between up by 1
          board.columns
               .where('position >= ? AND position < ?', new_position, old_position)
               .where.not(id: column.id)
               .update_all('position = position + 1')
        end

        # Set new position for the column
        column.position = new_position

        if column.save
          { column: column, errors: [] }
        else
          # This will cause a rollback
          raise ActiveRecord::Rollback, column.errors.full_messages.join(', ')
        end
      end

      # If we get an exception from the transaction, return error
      unless result.is_a?(Hash)
        return { column: nil, errors: [result.to_s] }
      end

      result
    rescue ActiveRecord::Rollback => e
      { column: nil, errors: [e.message] }
    end
  end
end