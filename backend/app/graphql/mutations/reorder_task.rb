module Mutations
  class ReorderTask < BaseMutation
    argument :task_id, ID, required: true
    argument :new_column_id, ID, required: false  # Optional - if moving to different column
    argument :new_position, Integer, required: true  # New position in the target column

    field :task, Types::TaskType, null: true
    field :errors, [String], null: false

    def resolve(task_id:, new_position:, new_column_id: nil)
      user = context[:current_user]
      return { task: nil, errors: ["Not authorized"] } unless user

      task = Task.find_by(id: task_id)
      return { task: nil, errors: ["Task not found"] } unless task

      # Check if user has access to the current task
      return { task: nil, errors: ["Not authorized"] } unless task.column.board.user == user

      target_column = if new_column_id
                        Column.find_by(id: new_column_id)
                      else
                        task.column
                      end

      # Check if user has access to the target column if it's different
      if target_column && target_column != task.column
        return { task: nil, errors: ["Not authorized to move to target column"] } unless target_column.board.user == user
      elsif !target_column
        return { task: nil, errors: ["Target column not found"] }
      end

      # Move task to new column if needed
      if new_column_id && new_column_id != task.column_id
        task.column = target_column
      end

      # Update position - need to handle repositioning existing tasks
      # First, shift other tasks down in the target column if they were at or after the new position
      target_column.tasks.where('position >= ?', new_position).where.not(id: task.id).update_all('position = position + 1')
      
      # Set new position for the task
      task.position = new_position

      if task.save
        { task: task, errors: [] }
      else
        # Rollback position changes if save fails
        { task: nil, errors: task.errors.full_messages }
      end
    end
  end
end