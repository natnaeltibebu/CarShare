require 'rails_helper'

RSpec.describe 'Users', type: :request do
  let!(:admin) { create(:user, :admin) }
  let!(:user) { create(:user) }
  let!(:other_user) { create(:user) }
  let!(:admin_token) { JwtService.encode(user_id: admin.id) }
  let!(:user_token) { JwtService.encode(user_id: user.id) }
  let!(:other_user_token) { JwtService.encode(user_id: other_user.id) }
  
  describe 'GET /users' do
    context 'as admin' do
      it 'returns all users' do
        get '/users', headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['users'].length).to eq(3)
      end
    end
    
    context 'as regular user' do
      it 'returns forbidden' do
        get '/users', headers: { 'Authorization' => "Bearer #{user_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
  
  describe 'GET /users/:id' do
    context 'as admin' do
      it 'returns any user' do
        get "/users/#{user.id}", headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['user']['id']).to eq(user.id)
      end
    end
    
    context 'as user accessing own profile' do
      it 'returns user profile' do
        get "/users/#{user.id}", headers: { 'Authorization' => "Bearer #{user_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['user']['id']).to eq(user.id)
      end
    end
    
    context 'as user accessing other profile' do
      it 'returns forbidden' do
        get "/users/#{other_user.id}", headers: { 'Authorization' => "Bearer #{user_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
  
  describe 'PATCH /users/:id' do
    let(:update_params) { { user: { first_name: 'Updated' } } }
    
    context 'as admin' do
      it 'updates any user' do
        patch "/users/#{user.id}", params: update_params, headers: { 'Authorization' => "Bearer #{admin_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(user.reload.first_name).to eq('Updated')
      end
    end
    
    context 'as user updating own profile' do
      it 'updates user profile' do
        patch "/users/#{user.id}", params: update_params, headers: { 'Authorization' => "Bearer #{user_token}" }
        
        expect(response).to have_http_status(:ok)
        expect(user.reload.first_name).to eq('Updated')
      end
    end
    
    context 'as user updating other profile' do
      it 'returns forbidden' do
        patch "/users/#{other_user.id}", params: update_params, headers: { 'Authorization' => "Bearer #{user_token}" }
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end