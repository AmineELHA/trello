class AddReminderDateToTasks < ActiveRecord::Migration[8.0]
  def change
    add_column :tasks, :reminder_date, :datetime
  end
end
