class FixNullColumnPositions < ActiveRecord::Migration[8.0]
  def up
    # Update all columns that have NULL position with proper sequential positions
    # Group by board and assign positions sequentially
    Board.includes(:columns).find_each do |board|
      columns_with_null_position = board.columns.where(position: nil).order(:id)
      columns_with_null_position.each_with_index do |column, index|
        # Calculate the next position based on existing max position or start from 1
        next_position = (board.columns.where.not(position: nil).maximum(:position) || 0) + index + 1
        column.update_column(:position, next_position)
      end
    end
  end

  def down
    # Revert all positions back to NULL for columns that were originally NULL
    # This is a simplified approach - in a real scenario, you might want to track original state
    Column.where("position > 0").update_all(position: nil)
  end
end
