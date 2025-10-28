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

      # Wrap in transaction to ensure consistency
      result = ActiveRecord::Base.transaction do
        # Get the current position and column of the task
        old_position = task.position
        old_column = task.column

        # Handle movement within the same column
        if target_column == old_column && new_position != old_position
          if new_position > old_position
            # Moving to a higher position (e.g., from position 1 to 3)
            # Shift tasks in between down by 1
            target_column.tasks
                    .where('position > ? AND position <= ?', old_position, new_position)
                    .where.not(id: task.id)
                    .update_all('position = position - 1')
          else
            # Moving to a lower position (e.g., from position 3 to 1)
            # Shift tasks in between up by 1
            target_column.tasks
                    .where('position >= ? AND position < ?', new_position, old_position)
                    .where.not(id: task.id)
                    .update_all('position = position + 1')
          end
        # Handle movement to a different column
        elsif new_column_id && new_column_id != task.column_id
          # Shift tasks down in the target column at or after the new position (excluding the task being moved)
          target_column.tasks.where('position >= ?', new_position).where.not(id: task.id).update_all('position = position + 1')
          # Shift tasks down in the old column that were after the old position
          old_column.tasks.where('position > ?', old_position).where.not(id: task.id).update_all('position = position - 1')
          # Update the task's column
          task.column = target_column
        end
        
        # Set new position for the task
        task.position = new_position

        if task.save
          { task: task, errors: [] }
        else
          # This will cause a rollback
          raise ActiveRecord::Rollback, task.errors.full_messages.join(', ')
        end
      end

      # If we get an exception from the transaction, return error
      unless result.is_a?(Hash)
        return { task: nil, errors: [result.to_s] }
      end

      result
    rescue ActiveRecord::Rollback => e
      { task: nil, errors: [e.message] }
    end
  end
end