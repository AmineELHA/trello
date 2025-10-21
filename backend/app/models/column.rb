class Column < ApplicationRecord
  belongs_to :board
  has_many :tasks, dependent: :destroy
  validates :name, presence: true
end
