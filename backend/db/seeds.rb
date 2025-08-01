# Create admin user
admin = User.create!(
  email: 'admin@carrental.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'Admin',
  last_name: 'User',
  phone_number: '+1234567890',
  driver_license_number: 'ADMIN123456',
  role: 'admin'
)

# Create host user
host = User.create!(
  email: 'host@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'Car',
  last_name: 'Host',
  phone_number: '+1234567891',
  driver_license_number: 'HOST123456',
  role: 'host'
)

# Create renter users
renter1 = User.create!(
  email: 'john.doe@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  phone_number: '+1234567892',
  driver_license_number: 'DL123456789',
  role: 'renter'
)

renter2 = User.create!(
  email: 'jane.smith@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  first_name: 'Jane',
  last_name: 'Smith',
  phone_number: '+1234567893',
  driver_license_number: 'DL987654321',
  role: 'renter'
)

# Create cars
cars_data = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Silver',
    license_plate: 'ABC123',
    daily_rate: 45.00,
    category: 'economy',
    description: 'Reliable and fuel-efficient sedan perfect for city driving.',
    pickup_location: 'Downtown Los Angeles, CA',
    available_from: Date.current,
    available_to: Date.current + 6.months,
    owner: host
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Blue',
    license_plate: 'DEF456',
    daily_rate: 40.00,
    category: 'compact',
    description: 'Compact car with excellent fuel economy.',
    pickup_location: 'Santa Monica, CA',
    available_from: Date.current,
    available_to: Date.current + 3.months,
    owner: host
  },
  {
    make: 'BMW',
    model: 'X5',
    year: 2022,
    color: 'Black',
    license_plate: 'GHI789',
    daily_rate: 120.00,
    category: 'luxury',
    description: 'Luxury SUV with premium features and comfort.',
    pickup_location: 'Beverly Hills, CA',
    available_from: Date.current + 1.week,
    available_to: Date.current + 4.months,
    owner: admin
  },
  {
    make: 'Ford',
    model: 'Explorer',
    year: 2021,
    color: 'White',
    license_plate: 'JKL012',
    daily_rate: 85.00,
    category: 'SUV',
    description: 'Spacious SUV perfect for family trips.',
    pickup_location: 'Hollywood, CA',
    available_from: Date.current,
    available_to: Date.current + 2.months,
    owner: host
  }
]

cars = cars_data.map { |car_data| Car.create!(car_data) }

# Create some bookings
Booking.create!(
  user: renter1,
  car: cars[0],
  start_date: Date.current + 1.day,
  end_date: Date.current + 3.days,
  status: 'confirmed'
)

Booking.create!(
  user: renter2,
  car: cars[2],
  start_date: Date.current + 5.days,
  end_date: Date.current + 7.days,
  status: 'pending'
)

puts "Seeded #{User.count} users, #{Car.count} cars, and #{Booking.count} bookings"