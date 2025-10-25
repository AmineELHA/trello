class AddFieldsToTasks < ActiveRecord::Migration[8.0]
  def change
    add_column :tasks, :due_date, :datetime
    add_column :tasks, :labels, :string, array: true, default: []
    add_column :tasks, :checklists, :json, default: []
    add_column :tasks, :attachments, :string, array: true, default: []
  end
end
