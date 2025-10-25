module Mutations
  class DeleteTask < BaseMutation
    argument :id, ID, required: true

    field :task, Types::TaskType, null: true
    field :errors, [String], null: false

    def resolve(id:)
      user = context[:current_user]
      return { task: nil, errors: ["Not authorized"] } unless user

      task = Task.find_by(id: id)
      return { task: nil, errors: ["Task not found"] } unless task

      # Check if user has access to this task
      return { task: nil, errors: ["Not authorized"] } unless task.column.board.user == user

      if task.destroy
        { task: task, errors: [] }
      else
        { task: nil, errors: task.errors.full_messages }
      end
    end
  end
end