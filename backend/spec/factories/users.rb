FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { 'password123' }
    password_confirmation { 'password123' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    phone_number { "+1#{Faker::Number.number(digits: 10)}" }
    driver_license_number { Faker::Alphanumeric.alphanumeric(number: 10).upcase }
    role { 'renter' }
    
    trait :admin do
      role { 'admin' }
    end
    
    trait :host do
      role { 'host' }
    end
    
    trait :renter do
      role { 'renter' }
    end
  end
end