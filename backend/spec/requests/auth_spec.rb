require 'rails_helper'

RSpec.describe 'Auth', type: :request do
  describe 'POST /auth/register' do
    let(:valid_params) do
      {
        user: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '+1234567890',
          driver_license_number: 'DL123456789',
          role: 'host'
        }
      }
    end
    
    context 'with valid parameters' do
      it 'creates a new user and returns a token' do
        expect {
          post '/auth/register', params: valid_params
        }.to change(User, :count).by(1)
        
        expect(response).to have_http_status(:created)
        response_body = JSON.parse(response.body)
        expect(response_body['token']).to be_present
        expect(response_body['user']['email']).to eq('test@example.com')
        expect(response_body['user']['role']).to eq('host')
      end
      
      it 'defaults to renter role when not specified' do
        params_without_role = valid_params.dup
        params_without_role[:user].delete(:role)
        
        post '/auth/register', params: params_without_role
        
        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['user']['role']).to eq('renter')
      end
    end
    
    context 'with invalid parameters' do
      it 'returns validation errors' do
        invalid_params = valid_params.dup
        invalid_params[:user][:email] = 'invalid_email'
        
        post '/auth/register', params: invalid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to be_present
      end
      
      it 'returns error for invalid role' do
        invalid_params = valid_params.dup
        invalid_params[:user][:role] = 'invalid_role'
        
        post '/auth/register', params: invalid_params
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to include('Role is not included in the list')
      end
    end
  end
  
  describe 'POST /auth/login' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'password123', role: 'host') }
    
    context 'with valid credentials' do
      it 'returns a token' do
        post '/auth/login', params: { email: 'test@example.com', password: 'password123' }
        
        expect(response).to have_http_status(:ok)
        response_body = JSON.parse(response.body)
        expect(response_body['token']).to be_present
        expect(response_body['user']['email']).to eq('test@example.com')
        expect(response_body['user']['role']).to eq('host')
      end
    end
    
    context 'with invalid credentials' do
      it 'returns an error' do
        post '/auth/login', params: { email: 'test@example.com', password: 'wrong_password' }
        
        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('Invalid email or password')
      end
    end
  end
  
  describe 'GET /auth/me' do
    let!(:user) { create(:user, :host) }
    let(:token) { JwtService.encode(user_id: user.id) }
    
    context 'with valid token' do
      it 'returns current user' do
        get '/auth/me', headers: { 'Authorization' => "Bearer #{token}" }
        
        expect(response).to have_http_status(:ok)
        response_body = JSON.parse(response.body)
        expect(response_body['user']['id']).to eq(user.id)
        expect(response_body['user']['role']).to eq('host')
      end
    end
    
    context 'without token' do
      it 'returns unauthorized' do
        get '/auth/me'
        
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end