class Task < ApplicationRecord
  belongs_to :column

  validates :title, presence: true

  before_create :set_position

  private

  def set_position
    # If tasks already exist in the column, position will be last + 1
    self.position ||= (column.tasks.maximum(:position) || 0) + 1
  end
end
