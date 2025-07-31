class Booking < ApplicationRecord
  belongs_to :user
  belongs_to :car
  
  validates :start_date, :end_date, presence: true
  validates :total_price, presence: true, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: %w[pending confirmed completed cancelled] }
  validate :end_date_after_start_date
  validate :start_date_not_in_past
  validate :car_available_for_booking, on: :create
  validate :no_overlapping_bookings, on: :create
  
  before_validation :calculate_total_price
  before_validation :set_default_status
  after_create :update_car_status_to_booked
  after_update :update_car_status_based_on_booking_status
  
  scope :active, -> { where(status: ['pending', 'confirmed']) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_date_range, ->(start_date, end_date) { where('start_date <= ? AND end_date >= ?', end_date, start_date) }
  
  def duration_in_days
    (end_date - start_date).to_i
  end
  
  def pending?
    status == 'pending'
  end
  
  def confirmed?
    status == 'confirmed'
  end
  
  def completed?
    status == 'completed'
  end
  
  def cancelled?
    status == 'cancelled'
  end
  
  private
  
  def end_date_after_start_date
    return unless start_date && end_date
    
    errors.add(:end_date, 'must be after start date') if end_date <= start_date
  end
  
  def start_date_not_in_past
    return unless start_date
    
    errors.add(:start_date, 'cannot be in the past') if start_date < Date.current
  end
  
  def car_available_for_booking
    return unless car
    
    unless car.available?
      errors.add(:car, 'is not available for booking')
    end
  end
  
  def no_overlapping_bookings
    return unless car && start_date && end_date
    
    overlapping_bookings = car.bookings.active.by_date_range(start_date, end_date)
    overlapping_bookings = overlapping_bookings.where.not(id: id) if persisted?
    
    if overlapping_bookings.exists?
      errors.add(:base, 'Car is already booked for the selected dates')
    end
  end
  
  def calculate_total_price
    return unless car && start_date && end_date && duration_in_days > 0
    
    self.total_price = car.daily_rate * duration_in_days
  end
  
  def set_default_status
    self.status ||= 'pending'
  end
  
  def update_car_status_to_booked
    car.update(status: 'booked') if car.available?
  end
  
  def update_car_status_based_on_booking_status
    return unless saved_change_to_status?
    
    case status
    when 'cancelled', 'completed'
      # Check if there are other active bookings for this car
      other_active_bookings = car.bookings.active.where.not(id: id)
      car.update(status: 'available') unless other_active_bookings.exists?
    when 'confirmed'
      car.update(status: 'booked')
    end
  end
end