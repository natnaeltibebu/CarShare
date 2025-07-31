class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :car, null: false, foreign_key: true
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      t.string :status, default: 'pending'
      
      t.timestamps
    end
    
    add_index :bookings, :status
    add_index :bookings, [:start_date, :end_date]
  end
end