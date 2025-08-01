require 'rails_helper'

RSpec.describe 'Bookings', type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:customer) { create(:user) }
  let!(:other_customer) { create(:user) }
  let!(:admin_token) { JwtService.encode(user_id: admin.id) }
  let!(:customer_token) { JwtService.encode(user_id: customer.id) }
  let!(:other_customer_token) { JwtService.encode(user_id: other_customer.id) }
  let!(:car) { create(:car, status: 'available') }
  let!(:booking) { create(:booking, user: customer, car: car) }
  
  describe 'GET /bookings' do
    context 'as admin' do
      it 'returns all bookings' do
        create(:booking, user: other_customer)
        
        get '/bookings', headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['bookings'].length).to eq(2)
      end
    end
    
    context 'as customer' do
      it 'returns only user bookings' do
        create(:booking, user: other_customer)
        
        get '/bookings', headers: { 'Authorization' => "Bearer #{customer_token}" }
        
        expect(response).to have_http_status(:ok)
        bookings = JSON.parse(response.body)['bookings']
        expect(bookings.length).to eq(1)
        expect(bookings.first['user']['id']).to eq(customer.id)
      end
    end
  end
  
  describe 'POST /bookings' do
    let(:valid_params) do
      {
        booking: {
          car_id: car.id,
          start_date: Date.current + 1.day,
          end_date: Date.current + 3.days
        }
      }
    end
    
    context 'with valid parameters' do
      it 'creates a new booking' do
        available_car = create(:car, status: 'available')
        params = valid_params.dup
        params[:booking][:car_id] = available_car.id
        
        expect {
          post '/bookings', params: params, headers: { 'Authorization' => "Bearer #{customer_token}" }
        }.to change(Booking, :count).by(1)
        
        expect(response).to have_http_status(:created)
        expect(available_car.reload.status).to eq('booked')
      end
    end
    
    context 'with unavailable car' do
      it 'returns validation error' do
        booked_car = create(:car, status: 'booked')
        params = valid_params.dup
        params[:booking][:car_id] = booked_car.id
        
        post '/bookings', params: params, headers: { 'Authorization' => "Bearer #{customer_token}" }
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to include('Car is not available for booking')
      end
    end
  end
  
  describe 'PATCH /bookings/:id' do
    let(:update_params) { { booking: { end_date: Date.current + 5.days } } }
    
    context 'as booking owner with pending booking' do
      it 'updates the booking' do
        patch "/bookings/#{booking.id}", params: update_params, headers: { 'Authorization' => "Bearer #{customer_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(booking.reload.end_date).to eq(Date.current + 5.days)
      end
    end
    
    context 'as other customer' do
      it 'returns forbidden' do
        patch "/bookings/#{booking.id}", params: update_params, headers: { 'Authorization' => "Bearer #{other_customer_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
    
    context 'with confirmed booking' do
      it 'returns error' do
        booking.update(status: 'confirmed')
        
        patch "/bookings/#{booking.id}", params: update_params, headers: { 'Authorization' => "Bearer #{customer_token}" }
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to include('Only pending bookings can be updated')
      end
    end
  end
  
  describe 'DELETE /bookings/:id' do
    context 'as booking owner with pending booking' do
      it 'cancels the booking' do
        expect {
          delete "/bookings/#{booking.id}", headers: { 'Authorization' => "Bearer #{customer_token}" }
        }.to change(Booking, :count).by(-1)
        
        expect(response).to have_http_status(:ok)
      end
    end
    
    context 'with confirmed booking' do
      it 'returns error' do
        booking.update(status: 'confirmed')
        
        delete "/bookings/#{booking.id}", headers: { 'Authorization' => "Bearer #{customer_token}" }
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to include('Only pending bookings can be cancelled')
      end
    end
  end
  
  describe 'PATCH /bookings/:id/update_status' do
    context 'as admin' do
      it 'updates booking status' do
        patch "/bookings/#{booking.id}/update_status", 
              params: { status: 'confirmed' }, 
              headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(booking.reload.status).to eq('confirmed')
      end
    end
    
    context 'as customer' do
      it 'returns forbidden' do
        patch "/bookings/#{booking.id}/update_status", 
              params: { status: 'confirmed' }, 
              headers: { 'Authorization' => "Bearer #{customer_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end