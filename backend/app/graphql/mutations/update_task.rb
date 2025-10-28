module Mutations
  class UpdateTask < BaseMutation
    argument :id, ID, required: true
    argument :title, String, required: false
    argument :description, String, required: false
    argument :due_date, GraphQL::Types::ISO8601DateTime, required: false
    argument :labels, [String], required: false
    argument :checklists, GraphQL::Types::JSON, required: false
    argument :attachments, [String], required: false
    argument :color, String, required: false
    argument :column_id, ID, required: false
    argument :position, Integer, required: false

    field :task, Types::TaskType, null: true
    field :errors, [String], null: false

    def resolve(id:, **args)
      user = context[:current_user]
      return { task: nil, errors: ["Not authorized"] } unless user

      task = Task.find_by(id: id)
      return { task: nil, errors: ["Task not found"] } unless task

      # Check if user has access to this task by checking the board ownership
      return { task: nil, errors: ["Not authorized"] } unless task.column.board.user == user

      # Handle column change if provided
      if args[:column_id]
        new_column = Column.find_by(id: args[:column_id])
        if new_column && new_column.board.user == user
          task.column = new_column
        else
          return { task: nil, errors: ["Invalid column"] }
        end
      end

      # Update attributes if provided
      task.attributes = {
        title: args[:title] || task.title,
        description: args[:description] || task.description,
        due_date: args[:due_date] || task.due_date,
        labels: args[:labels] || task.labels,
        checklists: args[:checklists] || task.checklists,
        attachments: args[:attachments] || task.attachments,
        color: args[:color] || task.color,
        position: args[:position] || task.position
      }

      if task.save
        { task: task, errors: [] }
      else
        { task: nil, errors: task.errors.full_messages }
      end
    end
  end
end