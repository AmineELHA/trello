FactoryBot.define do
  factory :task do
    title { "Test Task" }
    association :column
  end
end
