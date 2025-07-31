class Car < ApplicationRecord
  belongs_to :owner, class_name: 'User', foreign_key: 'owner_id'
  has_many :bookings, dependent: :destroy
  has_many :users, through: :bookings
  has_many_attached :images
  
  validates :make, :model, presence: true
  validates :year, presence: true, numericality: { greater_than: 1900, less_than_or_equal_to: Date.current.year + 1 }
  validates :license_plate, presence: true, uniqueness: true
  validates :daily_rate, presence: true, numericality: { greater_than: 0 }
  validates :status, inclusion: { in: %w[available booked maintenance] }
  validates :category, inclusion: { in: %w[economy compact luxury SUV truck convertible] }
  validates :pickup_location, presence: true, length: { maximum: 500 }
  validate :acceptable_images
  validate :availability_date_range
  
  before_validation :set_default_status
  
  scope :available, -> { where(status: 'available') }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_price_range, ->(min, max) { where(daily_rate: min..max) }
  scope :by_location, ->(location) { where("LOWER(pickup_location) LIKE ?", "%#{location.downcase}%") }
  scope :available_between, ->(start_date, end_date) do
    where(
      '(available_from IS NULL OR available_from <= ?) AND (available_to IS NULL OR available_to >= ?)',
      start_date, end_date
    )
  end
  scope :search, ->(query) do
    where(
    'LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?',
    "%#{query.downcase}%", "%#{query.downcase}%", "%#{query.downcase}%", "%#{query.downcase}%"
  )
  end
  
  def available?
    status == 'available'
  end
  
  def booked?
    status == 'booked'
  end
  
  def in_maintenance?
    status == 'maintenance'
  end
  
  def available_on_dates?(start_date, end_date)
    return false unless available?
    return true if available_from.nil? && available_to.nil?
    
    start_date = Date.parse(start_date) if start_date.is_a?(String)
    end_date = Date.parse(end_date) if end_date.is_a?(String)
    
    (available_from.nil? || available_from <= start_date) &&
    (available_to.nil? || available_to >= end_date)
  end
  
  def image_urls
    return [] unless images.attached?
    
    images.map do |image|
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: false)
    end
  end
  
  def primary_image_url
    return nil unless images.attached?
    
    Rails.application.routes.url_helpers.rails_blob_url(images.first, only_path: false)
  end
  
  private
  
  def set_default_status
    self.status ||= 'available'
  end
  
  def acceptable_images
    return unless images.attached?
    
    if images.length > 10
      errors.add(:images, 'cannot have more than 10 images')
    end
    
    images.each do |image|
      unless image.blob.content_type.starts_with?('image/')
        errors.add(:images, 'must be an image file')
      end
      
      if image.blob.byte_size > 5.megabytes
        errors.add(:images, 'must be less than 5MB each')
      end
    end
  end
  
  def availability_date_range
    return unless available_from && available_to
    
    if available_to < available_from
      errors.add(:available_to, 'must be after available from date')
    end
  end
end