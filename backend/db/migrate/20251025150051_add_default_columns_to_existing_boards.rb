class AddDefaultColumnsToExistingBoards < ActiveRecord::Migration[8.0]
  def up
    # Add default columns to existing boards that don't have any columns yet
    Board.includes(:columns).find_each do |board|
      if board.columns.empty?
        default_columns = ["To Do", "Doing", "Done"]
        default_columns.each_with_index do |column_name, index|
          board.columns.create!(name: column_name, position: index + 1)
        end
      end
    end
    
    # Set positions for existing columns that are NULL
    Board.includes(:columns).find_each do |board|
      board.columns.where(position: nil).order(:id).each_with_index do |column, index|
        column.update!(position: board.columns.maximum(:position).to_i + index + 1)
      end
    end
  end

  def down
    # In the down migration, we just remove the position values
    Column.where.not(position: nil).update_all(position: nil)
  end
end
