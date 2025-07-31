class CreateCars < ActiveRecord::Migration[8.0]
  def change
    create_table :cars do |t|
      t.string :make, null: false
      t.string :model, null: false
      t.integer :year, null: false
      t.string :color
      t.string :license_plate, null: false
      t.decimal :daily_rate, precision: 10, scale: 2, null: false
      t.string :status, default: 'available'
      t.text :description
      t.string :category
      t.string :pickup_location, limit: 500
      t.date :available_from
      t.date :available_to
      t.references :owner, null: false, foreign_key: { to_table: :users }
      
      t.timestamps
    end
    
    add_index :cars, :license_plate, unique: true
    add_index :cars, :status
    add_index :cars, :category
  end
end