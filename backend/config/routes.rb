Rails.application.routes.draw do
  # Authentication routes
  post '/auth/register', to: 'auth#register'
  post '/auth/login', to: 'auth#login'
  post '/auth/logout', to: 'auth#logout'
  get '/auth/me', to: 'auth#current_user'
  
  # Resource routes
  resources :users, only: [:index, :show, :update]
end