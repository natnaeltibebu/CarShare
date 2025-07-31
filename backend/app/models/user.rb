class User < ApplicationRecord
  has_secure_password
  
  has_many :bookings, dependent: :destroy
  has_many :rented_cars, through: :bookings, source: :car
  has_many :owned_cars, class_name: 'Car', foreign_key: 'owner_id', dependent: :destroy
  
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, :last_name, presence: true
  validates :phone_number, presence: true, format: { with: /\A[\+]?[1-9][\d]{0,15}\z/ }
  validates :driver_license_number, presence: true, uniqueness: true
  validates :role, inclusion: { 
    in: %w[admin host renter], 
    message: "is not included in the list" 
  }
  
  before_validation :set_default_role, on: :create
  
  def full_name
    "#{first_name} #{last_name}"
  end
  
  def admin?
    role == 'admin'
  end
  
  def host?
    role == 'host'
  end
  
  def renter?
    role == 'renter'
  end
  
  def can_list_cars?
    admin? || host?
  end
  
  private
  
  def set_default_role
    self.role ||= 'renter' if role.blank?
  end
end