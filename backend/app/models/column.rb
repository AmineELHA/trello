class Column < ApplicationRecord
  belongs_to :board
  has_many :tasks, dependent: :destroy
  validates :name, presence: true
  validates :position, presence: true

  before_validation :assign_position, on: :create

  private

  def assign_position
    return if position.present?

    # Find the highest position in the associated board and increment by 1
    max_position = board.columns.maximum(:position) || 0
    self.position = max_position + 1
  end
end
