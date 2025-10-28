module Mutations
  class CreateTask < BaseMutation
    argument :title, String, required: true
    argument :description, String, required: false
    argument :column_id, ID, required: true
    argument :color, String, required: false

    field :task, Types::TaskType, null: true
    field :errors, [String], null: false

    def resolve(title:, description: nil, column_id:, color: nil)
      user = context[:current_user]
      return { task: nil, errors: ["Not authorized"] } unless user

      column = Column.find_by(id: column_id)
      return { task: nil, errors: ["Column not found"] } unless column

      task = column.tasks.build(title:, description:, color:, position: column.tasks.count + 1)

      if task.save
        { task:, errors: [] }
      else
        { task: nil, errors: task.errors.full_messages }
      end
    end
  end
end
