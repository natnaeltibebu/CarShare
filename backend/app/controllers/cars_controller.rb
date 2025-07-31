class CarsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_car, only: [:show, :update, :destroy, :update_status]
  before_action :check_car_ownership, only: [:update, :destroy]
  
  def index
    cars = Car.includes(:owner, images_attachments: :blob)
    
    # Apply filters
    cars = cars.available if params[:available] == 'true'
    cars = cars.by_category(params[:category]) if params[:category].present?
    cars = cars.by_price_range(params[:min_price], params[:max_price]) if params[:min_price] && params[:max_price]
    cars = cars.by_location(params[:location]) if params[:location].present?
    cars = cars.search(params[:search]) if params[:search].present?
    
    # Date availability filter
    if params[:start_date] && params[:end_date]
      cars = cars.available_between(params[:start_date], params[:end_date])
    end
    
    # Sorting
    case params[:sort]
    when 'price_low'
      cars = cars.order(:daily_rate)
    when 'price_high'
      cars = cars.order(daily_rate: :desc)
    when 'newest'
      cars = cars.order(created_at: :desc)
    else
      cars = cars.order(:created_at)
    end
    
    # Pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 9
    per_page = [per_page, 50].min # Limit max per_page to 50
    
    total_count = cars.count
    total_pages = (total_count.to_f / per_page).ceil
    offset = (page - 1) * per_page
    
    paginated_cars = cars.limit(per_page).offset(offset)
    
    render json: {
      cars: paginated_cars.map { |car| car_response(car) },
      pagination: {
        current_page: page,
        per_page: per_page,
        total_pages: total_pages,
        total_count: total_count,
        has_next_page: page < total_pages,
        has_prev_page: page > 1
      }
    }
  end
  
  def show
    render json: { car: car_response(@car) }
  end
  
  def create
    unless current_user.can_list_cars?
      return render_error('Only hosts and admins can list cars', :forbidden)
    end
    
    car = current_user.owned_cars.build(car_params)
    
    if car.save
      attach_images(car) if params[:images].present?
      render json: {
        message: 'Car created successfully',
        car: car_response(car)
      }, status: :created
    else
      render_errors(car.errors.full_messages)
    end
  end
  
  def update
    if @car.update(car_params)
      handle_image_updates if params[:images].present? || params[:remove_images].present?
      render json: {
        message: 'Car updated successfully',
        car: car_response(@car)
      }
    else
      render_errors(@car.errors.full_messages)
    end
  end
  
  def destroy
    if @car.bookings.active.exists?
      render_error('Cannot delete car with active bookings', :conflict)
    else
      @car.destroy
      render json: { message: 'Car deleted successfully' }
    end
  end
  
  def update_status
    unless current_user.admin?
      return render_error('Admin access required', :forbidden)
    end
    
    if @car.update(status: params[:status])
      render json: {
        message: 'Car status updated successfully',
        car: car_response(@car)
      }
    else
      render_errors(@car.errors.full_messages)
    end
  end
  
  def my_cars
    unless current_user.can_list_cars?
      return render_error('Access denied', :forbidden)
    end
    
    cars = current_user.owned_cars.includes(images_attachments: :blob).order(:created_at)
    render json: { cars: cars.map { |car| car_response(car) } }
  end
  
  private
  
  def set_car
    @car = Car.includes(:owner, images_attachments: :blob).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('Car not found', :not_found)
  end
  
  def check_car_ownership
    unless current_user.admin? || @car.owner_id == current_user.id
      render_error('Access denied', :forbidden)
    end
  end
  
  def car_params
    params.require(:car).permit(:make, :model, :year, :color, :license_plate, :daily_rate, 
                                :status, :description, :category, :pickup_location, 
                                :available_from, :available_to)
  end
  
  def attach_images(car)
    return unless params[:images].is_a?(Array)
    
    params[:images].each do |image|
      car.images.attach(image) if image.present?
    end
  end
  
  def handle_image_updates
    # Remove specific images if requested
    if params[:remove_images].present?
      remove_image_ids = Array(params[:remove_images])
      @car.images.where(id: remove_image_ids).each(&:purge)
    end
    
    # Add new images if provided
    attach_images(@car) if params[:images].present?
  end
  
  def car_response(car)
    {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      color: car.color,
      license_plate: car.license_plate,
      daily_rate: car.daily_rate,
      status: car.status,
      description: car.description,
      category: car.category,
      pickup_location: car.pickup_location,
      available_from: car.available_from,
      available_to: car.available_to,
      owner: {
        id: car.owner.id,
        full_name: car.owner.full_name,
        email: car.owner.email
      },
      images: car.image_urls,
      primary_image: car.primary_image_url,
      images_count: car.images.count,
      created_at: car.created_at,
      updated_at: car.updated_at
    }
  end
end