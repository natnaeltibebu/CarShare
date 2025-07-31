require 'rails_helper'

RSpec.describe Car, type: :model do
  describe 'validations' do
    subject { build(:car) }
    
    it { should validate_presence_of(:make) }
    it { should validate_presence_of(:model) }
    it { should validate_presence_of(:year) }
    it { should validate_presence_of(:license_plate) }
    it { should validate_uniqueness_of(:license_plate) }
    it { should validate_presence_of(:daily_rate) }
    it { should validate_numericality_of(:daily_rate).is_greater_than(0) }
    it { should validate_inclusion_of(:status).in_array(%w[available booked maintenance]) }
    it { should validate_inclusion_of(:category).in_array(%w[economy compact luxury SUV truck convertible]) }
    it { should validate_presence_of(:pickup_location) }
    it { should validate_length_of(:pickup_location).is_at_most(500) }
  end
  
  describe 'associations' do
    it { should belong_to(:owner).class_name('User').with_foreign_key('owner_id') }
    it { should have_many(:bookings).dependent(:destroy) }
    it { should have_many(:users).through(:bookings) }
    it { should have_many_attached(:images) }
  end
  
  describe 'availability date validations' do
    it 'validates available_to is after available_from' do
      car = build(:car, available_from: Date.current, available_to: Date.current - 1.day)
      expect(car).not_to be_valid
      expect(car.errors[:available_to]).to include('must be after available from date')
    end
    
    it 'allows nil dates' do
      car = build(:car, available_from: nil, available_to: nil)
      expect(car).to be_valid
    end
  end
  
  describe 'image validations' do
    let(:car) { create(:car) }
    
    it 'allows up to 10 images' do
      11.times do |i|
        car.images.attach(
          io: StringIO.new("fake image content #{i}"),
          filename: "test_#{i}.jpg",
          content_type: "image/jpeg"
        )
      end
      
      expect(car).not_to be_valid
      expect(car.errors[:images]).to include('cannot have more than 10 images')
    end
    
    it 'validates file type' do
      car.images.attach(
        io: StringIO.new("fake text content"),
        filename: "test.txt",
        content_type: "text/plain"
      )
      
      expect(car).not_to be_valid
      expect(car.errors[:images]).to include('must be an image file')
    end
  end
  
  describe 'scopes' do
    let!(:available_car) { create(:car, status: 'available') }
    let!(:booked_car) { create(:car, status: 'booked') }
    let!(:economy_car) { create(:car, category: 'economy') }
    let!(:luxury_car) { create(:car, category: 'luxury') }
    let!(:la_car) { create(:car, pickup_location: 'Los Angeles, CA') }
    let!(:ny_car) { create(:car, pickup_location: 'New York, NY') }
    
    it 'filters available cars' do
      expect(Car.available).to include(available_car)
      expect(Car.available).not_to include(booked_car)
    end
    
    it 'filters by category' do
      expect(Car.by_category('economy')).to include(economy_car)
      expect(Car.by_category('economy')).not_to include(luxury_car)
    end
    
    it 'filters by location' do
      expect(Car.by_location('Los Angeles')).to include(la_car)
      expect(Car.by_location('Los Angeles')).not_to include(ny_car)
    end
    
    it 'filters by price range' do
      cheap_car = create(:car, daily_rate: 25.00)
      expensive_car = create(:car, daily_rate: 100.00)
      
      expect(Car.by_price_range(20, 50)).to include(cheap_car)
      expect(Car.by_price_range(20, 50)).not_to include(expensive_car)
    end
    
    it 'searches by text' do
      toyota_car = create(:car, make: 'Toyota', model: 'Camry')
      honda_car = create(:car, make: 'Honda', model: 'Civic')
      
      expect(Car.search('Toyota')).to include(toyota_car)
      expect(Car.search('Toyota')).not_to include(honda_car)
    end
  end
  
  describe 'availability methods' do
    let(:car) { create(:car, available_from: Date.current, available_to: Date.current + 1.month) }
    
    it 'checks availability on dates' do
      expect(car.available_on_dates?(Date.current + 1.week, Date.current + 2.weeks)).to be true
      expect(car.available_on_dates?(Date.current - 1.week, Date.current + 1.week)).to be false
      expect(car.available_on_dates?(Date.current + 2.months, Date.current + 3.months)).to be false
    end
    
    it 'handles nil availability dates' do
      unlimited_car = create(:car, available_from: nil, available_to: nil)
      expect(unlimited_car.available_on_dates?(Date.current, Date.current + 1.year)).to be true
    end
  end
  
  describe 'status methods' do
    it 'identifies car status correctly' do
      available_car = create(:car, status: 'available')
      booked_car = create(:car, status: 'booked')
      maintenance_car = create(:car, status: 'maintenance')
      
      expect(available_car.available?).to be true
      expect(booked_car.booked?).to be true
      expect(maintenance_car.in_maintenance?).to be true
    end
  end
  
  describe 'image methods' do
    let(:car) { create(:car, :with_images) }
    
    it 'returns image URLs' do
      expect(car.image_urls).to be_an(Array)
      expect(car.image_urls.length).to eq(2)
      expect(car.image_urls.first).to include('/rails/active_storage/blobs/')
    end
    
    it 'returns primary image URL' do
      expect(car.primary_image_url).to be_present
      expect(car.primary_image_url).to include('/rails/active_storage/blobs/')
    end
    
    it 'returns empty array when no images' do
      car_without_images = create(:car)
      expect(car_without_images.image_urls).to eq([])
      expect(car_without_images.primary_image_url).to be_nil
    end
  end
end