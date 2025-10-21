FactoryBot.define do
  factory :board do
    name { "Test Board" }
    association :user
  end
end
