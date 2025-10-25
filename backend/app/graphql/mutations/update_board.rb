module Mutations
  class UpdateBoard < BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false

    field :board, Types::BoardType, null: true
    field :errors, [String], null: false

    def resolve(id:, **args)
      user = context[:current_user]
      return { board: nil, errors: ["Not authorized"] } unless user

      board = Board.find_by(id: id)
      return { board: nil, errors: ["Board not found"] } unless board

      # Check if user owns the board
      return { board: nil, errors: ["Not authorized"] } unless board.user == user

      # Update attributes if provided
      if args[:name]
        board.name = args[:name]
      end

      if board.save
        { board: board, errors: [] }
      else
        { board: nil, errors: board.errors.full_messages }
      end
    end
  end
end