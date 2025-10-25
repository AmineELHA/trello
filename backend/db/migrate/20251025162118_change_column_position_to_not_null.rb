class ChangeColumnPositionToNotNull < ActiveRecord::Migration[8.0]
  def up
    change_column_null :columns, :position, false
  end

  def down
    change_column_null :columns, :position, true
  end
end
