module Mutations
  class CreateBoard < BaseMutation
    argument :name, String, required: true

    field :board, Types::BoardType, null:true
    field :errors,[String], null: false

    def resolve(name:)
      user = context[:current_user]
      return { board: nil, errors: ["Unauthorized"] } unless user

      board = user.boards.build(name: name)

      if board.save
        # Create default columns
        default_columns = ["To Do", "Doing", "Done"]
        default_columns.each do |column_name|
          board.columns.create!(name: column_name)
        end
        
        { board: board, errors: [] }
      else
        { board: nil, errors: board.errors.full_messages }
      end
    end
  end
end
