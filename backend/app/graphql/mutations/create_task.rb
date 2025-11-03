module Mutations
  class CreateTask < BaseMutation
    argument :title, String, required: true
    argument :description, String, required: false
    argument :due_date, GraphQL::Types::ISO8601DateTime, required: false
    argument :reminder_date, GraphQL::Types::ISO8601DateTime, required: false
    argument :column_id, ID, required: true
    argument :color, String, required: false
    argument :completed, Boolean, required: false

    field :task, Types::TaskType, null: true
    field :errors, [String], null: false

    def resolve(title:, description: nil, due_date: nil, reminder_date: nil, column_id:, color: nil, completed: nil)
      user = context[:current_user]
      return { task: nil, errors: ["Not authorized"] } unless user

      column = Column.find_by(id: column_id)
      return { task: nil, errors: ["Column not found"] } unless column

      task_attributes = {
        title: title,
        description: description,
        due_date: due_date,
        reminder_date: reminder_date,
        color: color,
        completed: completed || false,
        position: column.tasks.count + 1
      }

      task = column.tasks.build(task_attributes)

      if task.save
        { task: task, errors: [] }
      else
        { task: nil, errors: task.errors.full_messages }
      end
    end
  end
end
