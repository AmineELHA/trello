class Board < ApplicationRecord
  belongs_to :user
  has_many :columns, -> { order(:position) }, dependent: :destroy
  validates :name, presence: true

end
