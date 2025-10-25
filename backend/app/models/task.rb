class Task < ApplicationRecord
  belongs_to :column

  validates :title, presence: true
  validate :due_date_cannot_be_in_the_past, if: :due_date

  before_create :set_position

  private

  def set_position
    # If tasks already exist in the column, position will be last + 1
    self.position ||= (column.tasks.maximum(:position) || 0) + 1
  end

  def due_date_cannot_be_in_the_past
    if due_date.present? && due_date < Date.current
      errors.add(:due_date, "can't be in the past")
    end
  end
end
