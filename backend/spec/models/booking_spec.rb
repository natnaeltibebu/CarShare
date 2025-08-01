require 'rails_helper'

RSpec.describe Booking, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:start_date) }
    it { should validate_presence_of(:end_date) }
    it { should validate_presence_of(:total_price) }
    it { should validate_numericality_of(:total_price).is_greater_than(0) }
    it { should validate_inclusion_of(:status).in_array(%w[pending confirmed completed cancelled]) }
    
    it 'validates end_date is after start_date' do
      booking = build(:booking, start_date: Date.current, end_date: Date.current - 1.day)
      expect(booking).not_to be_valid
      expect(booking.errors[:end_date]).to include('must be after start date')
    end
    
    it 'validates start_date is not in the past' do
      booking = build(:booking, start_date: Date.current - 1.day)
      expect(booking).not_to be_valid
      expect(booking.errors[:start_date]).to include('cannot be in the past')
    end
  end
  
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:car) }
  end
  
  describe 'callbacks' do
    it 'calculates total price before validation' do
      car = create(:car, daily_rate: 50.00)
      booking = build(:booking, car: car, start_date: Date.current, end_date: Date.current + 2.days)
      booking.valid?
      expect(booking.total_price).to eq(100.00)
    end
    
    it 'updates car status to booked after creation' do
      car = create(:car, status: 'available')
      create(:booking, car: car)
      expect(car.reload.status).to eq('booked')
    end
  end
  
  describe 'methods' do
    let(:booking) { create(:booking, start_date: Date.current, end_date: Date.current + 3.days) }
    
    it 'calculates duration in days' do
      expect(booking.duration_in_days).to eq(3)
    end
    
    it 'identifies booking status correctly' do
      pending_booking = create(:booking, status: 'pending')
      confirmed_booking = create(:booking, status: 'confirmed')
      
      expect(pending_booking.pending?).to be true
      expect(confirmed_booking.confirmed?).to be true
    end
  end
end