class Board < ApplicationRecord
  belongs_to :user
  has_many :columns, dependent: :destroy
  validates :name, presence: true

end
