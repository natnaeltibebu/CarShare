Rails.application.routes.draw do
  # Authentication routes
  post '/auth/register', to: 'auth#register'
  post '/auth/login', to: 'auth#login'
  post '/auth/logout', to: 'auth#logout'
  get '/auth/me', to: 'auth#current_user'
  
  # Resource routes
  resources :users, only: [:index, :show, :update]
  resources :cars do
    collection do
      get :my_cars
    end
    member do
      patch :update_status
    end
  end
  resources :bookings do
    member do
      patch :update_status
    end
  end
end