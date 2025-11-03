FactoryBot.define do
  factory :notification do
    user { nil }
    task { nil }
    message { "MyText" }
    read { false }
  end
end
