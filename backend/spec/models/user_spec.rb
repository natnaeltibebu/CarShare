require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }
    
    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }
    it { should allow_value('user@example.com').for(:email) }
    it { should_not allow_value('invalid_email').for(:email) }
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it { should validate_presence_of(:phone_number) }
    it { should validate_presence_of(:driver_license_number) }
    it { should validate_uniqueness_of(:driver_license_number) }
    it { should validate_inclusion_of(:role).in_array(%w[admin host renter]) }
  end
  
  describe 'associations' do
    it { should have_many(:bookings).dependent(:destroy) }
    it { should have_many(:rented_cars).through(:bookings).source(:car) }
    it { should have_many(:owned_cars).class_name('Car').with_foreign_key('owner_id').dependent(:destroy) }
  end
  
  describe 'methods' do
    let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }
    
    it 'returns full name' do
      expect(user.full_name).to eq('John Doe')
    end
    
    it 'identifies admin users' do
      admin = create(:user, :admin)
      renter = create(:user, :renter)
      
      expect(admin.admin?).to be true
      expect(renter.admin?).to be false
    end
    
    it 'identifies host users' do
      host = create(:user, :host)
      renter = create(:user, :renter)
      
      expect(host.host?).to be true
      expect(renter.host?).to be false
    end
    
    it 'identifies renter users' do
      renter = create(:user, :renter)
      admin = create(:user, :admin)
      
      expect(renter.renter?).to be true
      expect(admin.renter?).to be false
    end
    
    it 'identifies users who can list cars' do
      admin = create(:user, :admin)
      host = create(:user, :host)
      renter = create(:user, :renter)
      
      expect(admin.can_list_cars?).to be true
      expect(host.can_list_cars?).to be true
      expect(renter.can_list_cars?).to be false
    end
  end
  
  describe 'default role' do
    it 'sets default role to renter' do
      user = create(:user)
      expect(user.role).to eq('renter')
    end
  end
end