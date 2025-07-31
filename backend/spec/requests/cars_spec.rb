require 'rails_helper'

RSpec.describe 'Cars', type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:host) { create(:user, :host) }
  let!(:renter) { create(:user, :renter) }
  let!(:admin_token) { JwtService.encode(user_id: admin.id) }
  let!(:host_token) { JwtService.encode(user_id: host.id) }
  let!(:renter_token) { JwtService.encode(user_id: renter.id) }
  let!(:cars) { create_list(:car, 3, owner: host) }
  
  describe 'GET /cars' do
    it 'returns all cars without authentication' do
      get '/cars'
      
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['cars'].length).to eq(3)
    end
    
    it 'filters available cars when requested' do
      cars.first.update(status: 'booked')
      
      get '/cars?available=true'
      
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['cars'].length).to eq(2)
    end
    
    it 'filters by location' do
      cars.first.update(pickup_location: 'Los Angeles, CA')
      cars.second.update(pickup_location: 'New York, NY')
      
      get '/cars?location=Los Angeles'
      
      expect(response).to have_http_status(:ok)
      cars_response = JSON.parse(response.body)['cars']
      expect(cars_response.length).to eq(1)
      expect(cars_response.first['pickup_location']).to include('Los Angeles')
    end
    
    it 'filters by date availability' do
      available_car = cars.first
      available_car.update(available_from: Date.current, available_to: Date.current + 1.month)
      
      unavailable_car = cars.second
      unavailable_car.update(available_from: Date.current + 2.months, available_to: Date.current + 3.months)
      
      get "/cars?start_date=#{Date.current + 1.week}&end_date=#{Date.current + 2.weeks}"
      
      expect(response).to have_http_status(:ok)
      cars_response = JSON.parse(response.body)['cars']
      car_ids = cars_response.map { |car| car['id'] }
      expect(car_ids).to include(available_car.id)
      expect(car_ids).not_to include(unavailable_car.id)
    end
  end
  
  describe 'POST /cars' do
    let(:valid_params) do
      {
        car: {
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          color: 'Silver',
          license_plate: 'NEW123',
          daily_rate: 45.00,
          category: 'economy',
          pickup_location: 'Downtown Los Angeles, CA'
        }
      }
    end
    
    context 'as admin' do
      it 'creates a new car' do
        expect {
          post '/cars', params: valid_params, headers: { 'Authorization' => "Bearer #{admin_token}" }
        }.to change(Car, :count).by(1)
        
        expect(response).to have_http_status(:created)
        car_response = JSON.parse(response.body)['car']
        expect(car_response['make']).to eq('Toyota')
        expect(car_response['owner']['id']).to eq(admin.id)
      end
    end
    
    context 'as host' do
      it 'creates a new car' do
        expect {
          post '/cars', params: valid_params, headers: { 'Authorization' => "Bearer #{host_token}" }
        }.to change(Car, :count).by(1)
        
        expect(response).to have_http_status(:created)
        car_response = JSON.parse(response.body)['car']
        expect(car_response['make']).to eq('Toyota')
        expect(car_response['owner']['id']).to eq(host.id)
      end
    end
    
    context 'as renter' do
      it 'returns forbidden' do
        post '/cars', params: valid_params, headers: { 'Authorization' => "Bearer #{renter_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
    
    context 'without authentication' do
      it 'returns unauthorized' do
        post '/cars', params: valid_params
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
  
  describe 'GET /cars/my_cars' do
    let!(:host_cars) { create_list(:car, 2, owner: host) }
    let!(:admin_cars) { create_list(:car, 1, owner: admin) }
    
    context 'as host' do
      it 'returns only host cars' do
        get '/cars/my_cars', headers: { 'Authorization' => "Bearer #{host_token}" }
        
        expect(response).to have_http_status(:ok)
        cars_response = JSON.parse(response.body)['cars']
        expect(cars_response.length).to eq(5)
        cars_response.each do |car|
          expect(car['owner']['id']).to eq(host.id)
        end
      end
    end
  end
  
  describe 'PATCH /cars/:id' do
    let!(:car) { create(:car, owner: host) }
    let(:update_params) { { car: { daily_rate: 55.00 } } }
    
    context 'as car owner' do
      it 'updates the car' do
        patch "/cars/#{car.id}", params: update_params, headers: { 'Authorization' => "Bearer #{host_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(car.reload.daily_rate).to eq(55.00)
      end
    end
    
    context 'as admin' do
      it 'updates any car' do
        patch "/cars/#{car.id}", params: update_params, headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(car.reload.daily_rate).to eq(55.00)
      end
    end
    
    context 'as different host' do
      let(:other_host) { create(:user, :host) }
      let(:other_host_token) { JwtService.encode(user_id: other_host.id) }
      
      it 'returns forbidden' do
        patch "/cars/#{car.id}", params: update_params, headers: { 'Authorization' => "Bearer #{other_host_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
    
    context 'as renter' do
      it 'returns forbidden' do
        patch "/cars/#{car.id}", params: update_params, headers: { 'Authorization' => "Bearer #{renter_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
  
  describe 'DELETE /cars/:id' do
    let!(:car) { create(:car, owner: host) }
    
    context 'as car owner with no active bookings' do
      it 'deletes the car' do
        expect {
          delete "/cars/#{car.id}", headers: { 'Authorization' => "Bearer #{host_token}" }
        }.to change(Car, :count).by(-1)
        
        expect(response).to have_http_status(:ok)
      end
    end
    
    context 'as admin with active bookings' do
      it 'returns conflict error' do
        create(:booking, car: car, status: 'confirmed')
        
        delete "/cars/#{car.id}", headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:conflict)
        expect(JSON.parse(response.body)['error']).to include('active bookings')
      end
    end
  end
  
  describe 'PATCH /cars/:id/update_status' do
    let!(:car) { create(:car, owner: host) }
    
    context 'as admin' do
      it 'updates car status' do
        patch "/cars/#{car.id}/update_status", 
              params: { status: 'maintenance' }, 
              headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(car.reload.status).to eq('maintenance')
      end
    end
    
    context 'as host' do
      it 'returns forbidden' do
        patch "/cars/#{car.id}/update_status", 
              params: { status: 'maintenance' }, 
              headers: { 'Authorization' => "Bearer #{host_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end