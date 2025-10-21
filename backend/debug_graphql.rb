#!/usr/bin/env ruby
require_relative 'config/environment'

# Create test data
user = User.find_or_create_by!(email: 'user@example.com') do |u|
  u.password = 'password123'
end

board = Board.find_or_create_by!(name: 'myboard', user: user)

# Generate token
token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, 'HS256')

query = <<~GRAPHQL
  mutation {
    createColumn(input: { board_id: #{board.id}, name: "My Test Column" }) {
      column {
        id
        name
        board {
          name
        }
      }
      errors
    }
  }
GRAPHQL

# Create a request object to simulate the GraphQL call
require 'action_controller'
require 'action_dispatch'

# Create a mock request
request = ActionDispatch::Request.new({
  "REQUEST_METHOD" => "POST",
  "CONTENT_TYPE" => "application/json",
  "HTTP_AUTHORIZATION" => "Bearer #{token}",
  "HTTP_CONTENT_TYPE" => "application/json",
  "PATH_INFO" => "/graphql",
  "rack.input" => StringIO.new({ query: query }.to_json)
})

# Simulate the request
app = Rails.application
response = nil
begin
  env = request.env
  # Add body manually
  env['action_dispatch.request.request_parameters'] = {}
  env['action_dispatch.request.body'] = StringIO.new({ query: query }.to_json)
  
  status, headers, body = app.call(env)
  response_body = body.respond_to?(:body) ? body.body : body.join
  
  puts "Status: #{status}"
  puts "Response: #{response_body}"
  
  # Parse the response
  result = JSON.parse(response_body)
  puts "\nParsed result:"
  puts JSON.pretty_generate(result)
rescue => e
  puts "Error occurred: #{e.message}"
  puts e.backtrace
end