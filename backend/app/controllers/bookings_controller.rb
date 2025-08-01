class BookingsController < ApplicationController
  before_action :set_booking, only: [:show, :update, :destroy, :update_status]
  before_action :authorize_booking_access!, only: [:show, :update, :destroy]
  before_action :admin_required!, only: [:update_status]
  
  def index
    if current_user.admin?
      bookings = Booking.all
      bookings = bookings.by_status(params[:status]) if params[:status].present?
    else
      bookings = current_user.bookings
    end
    
    bookings = bookings.includes(:user, :car).order(created_at: :desc)
    
    render json: { bookings: bookings.map { |booking| booking_response(booking) } }
  end
  
  def show
    render json: { booking: booking_response(@booking) }
  end
  
  def create
    booking = current_user.bookings.build(booking_params)
    
    if booking.save
      render json: {
        message: 'Booking created successfully',
        booking: booking_response(booking)
      }, status: :created
    else
      render_errors(booking.errors.full_messages)
    end
  end
  
  def update
    if @booking.pending? && @booking.update(booking_update_params)
      render json: {
        message: 'Booking updated successfully',
        booking: booking_response(@booking)
      }
    elsif !@booking.pending?
      render_error('Only pending bookings can be updated')
    else
      render_errors(@booking.errors.full_messages)
    end
  end
  
  def destroy
    if @booking.pending?
      @booking.destroy
      render json: { message: 'Booking cancelled successfully' }
    else
      render_error('Only pending bookings can be cancelled')
    end
  end
  
  def update_status
    if @booking.update(status: params[:status])
      render json: {
        message: 'Booking status updated successfully',
        booking: booking_response(@booking)
      }
    else
      render_errors(@booking.errors.full_messages)
    end
  end
  
  private
  
  def set_booking
    @booking = Booking.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error('Booking not found', :not_found)
  end
  
  def authorize_booking_access!
    unless current_user.admin? || @booking.user_id == current_user.id
      render_error('Access denied', :forbidden)
    end
  end
  
  def booking_params
    params.require(:booking).permit(:car_id, :start_date, :end_date)
  end
  
  def booking_update_params
    params.require(:booking).permit(:start_date, :end_date)
  end
  
  def booking_response(booking)
    {
      id: booking.id,
      user: {
        id: booking.user.id,
        full_name: booking.user.full_name,
        email: booking.user.email
      },
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        license_plate: booking.car.license_plate,
        daily_rate: booking.car.daily_rate
      },
      start_date: booking.start_date,
      end_date: booking.end_date,
      duration_in_days: booking.duration_in_days,
      total_price: booking.total_price,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }
  end
end