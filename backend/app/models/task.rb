class Task < ApplicationRecord
  belongs_to :column
  has_many :notifications, dependent: :destroy

  validates :title, presence: true
  validate :due_date_cannot_be_in_the_past, if: :due_date
  validate :reminder_date_cannot_be_in_the_past, if: :reminder_date
  validate :reminder_date_cannot_be_after_due_date

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

  def reminder_date_cannot_be_in_the_past
    if reminder_date.present? && reminder_date < Time.current
      errors.add(:reminder_date, "can't be in the past")
    end
  end

  def reminder_date_cannot_be_after_due_date
    if due_date.present? && reminder_date.present? && reminder_date > due_date
      errors.add(:reminder_date, "can't be after the due date")
    end
  end
end
