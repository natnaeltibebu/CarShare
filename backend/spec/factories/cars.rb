FactoryBot.define do
  factory :car do
    association :owner, factory: :user, strategy: :build
    make { Faker::Vehicle.make }
    model { Faker::Vehicle.model }
    year { Faker::Vehicle.year }
    color { Faker::Vehicle.color }
    license_plate { Faker::Alphanumeric.alphanumeric(number: 7).upcase }
    daily_rate { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    status { 'available' }
    category { %w[economy compact luxury SUV truck convertible].sample }
    description { Faker::Lorem.paragraph }
    pickup_location { "#{Faker::Address.city}, #{Faker::Address.state_abbr}" }
    available_from { Date.current }
    available_to { Date.current + 6.months }
    
    trait :with_images do
      after(:create) do |car|
        car.images.attach(
          io: StringIO.new("fake image content"),
          filename: "test_car_1.jpg",
          content_type: "image/jpeg"
        )
        car.images.attach(
          io: StringIO.new("fake image content 2"),
          filename: "test_car_2.jpg",
          content_type: "image/jpeg"
        )
      end
    end
    
    trait :hosted_car do
      association :owner, factory: [:user, :host]
    end
    
    trait :admin_car do
      association :owner, factory: [:user, :admin]
    end
  end
end