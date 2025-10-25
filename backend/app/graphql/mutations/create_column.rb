module Mutations
  class CreateColumn < BaseMutation
    argument :name, String, required: true
    argument :board_id, Int, required: true

    field :column, Types::ColumnType, null:true
    field :errors,[String], null: false

    def resolve(name:, board_id:)
      user = context[:current_user]
      return { column: nil, errors: ["Unauthorized"] } unless user
      board = Board.find(board_id)
      return { column: nil, errors: ["Unauthorized"] } unless board.user == user
      
      # Determine the position for the new column
      max_position = board.columns.maximum(:position) || 0
      column = board.columns.build(name: name, position: max_position + 1)

      if column.save
        { column: column, errors: [] }
      else
        { column: nil, errors: column.errors.full_messages }
      end
    end
  end
end
