module Mutations
  class UpdateColumn < BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false
    argument :position, Integer, required: false

    field :column, Types::ColumnType, null: true
    field :errors, [String], null: false

    def resolve(id:, **args)
      user = context[:current_user]
      return { column: nil, errors: ["Not authorized"] } unless user

      column = Column.find_by(id: id)
      return { column: nil, errors: ["Column not found"] } unless column

      # Check if user has access to this column
      return { column: nil, errors: ["Not authorized"] } unless column.board.user == user

      # Update attributes if provided
      if args[:name]
        column.name = args[:name]
      end

      if args[:position]
        column.position = args[:position]
      end

      if column.save
        { column: column, errors: [] }
      else
        { column: nil, errors: column.errors.full_messages }
      end
    end
  end
end