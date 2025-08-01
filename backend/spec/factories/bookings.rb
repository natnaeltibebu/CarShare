FactoryBot.define do
  factory :booking do
    association :user
    association :car
    start_date { Date.current + 1.day }
    end_date { Date.current + 3.days }
    status { 'pending' }
    
    trait :confirmed do
      status { 'confirmed' }
    end
    
    trait :completed do
      status { 'completed' }
    end
    
    trait :cancelled do
      status { 'cancelled' }
    end
  end
end