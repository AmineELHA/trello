FactoryBot.define do
  factory :column do
    name { "Test Column" }
    association :board
  end
end
