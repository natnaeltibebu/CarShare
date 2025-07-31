class UsersController < ApplicationController
  before_action :admin_required!, only: [:index]
  before_action :set_user, only: [:show, :update]
  before_action :authorize_user_access!, only: [:show, :update]
  
  def index
    users = User.all.order(:created_at)
    render json: { users: users.map { |user| user_response(user) } }
  end
  
  def show
    render json: { user: user_response(@user) }
  end
  
  def update
    if @user.update(user_update_params)
      render json: {
        message: 'User updated successfully',
        user: user_response(@user)
      }
    else
      render_errors(@user.errors.full_messages)
    end
  end
  
  private
  
  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('User not found', :not_found)
  end
  
  def authorize_user_access!
    unless current_user.admin? || current_user.id == @user.id
      render_error('Access denied', :forbidden)
    end
  end
  
  def user_update_params
    allowed_params = [:first_name, :last_name, :phone_number, :driver_license_number]
    allowed_params << :role if current_user.admin?
    params.require(:user).permit(allowed_params)
  end
  
  def user_response(user)
    {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.full_name,
      phone_number: user.phone_number,
      driver_license_number: user.driver_license_number,
      role: user.role,
      created_at: user.created_at
    }
  end
end