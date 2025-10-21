require 'rails_helper'

RSpec.describe 'Boards', type: :request do
  let(:user) { User.create!(email: 'user@example.com', password: 'password123') }

  def graphql_query(query, variables = {}, headers = {})
    post '/graphql',
         params: { query: query, variables: variables }.to_json,
         headers: headers.merge({ 'Content-Type' => 'application/json' })
    JSON.parse(response.body)
  end

  describe 'CreateBoard mutation' do
    it 'creates a board successfully when authorized' do
      # generate JWT token for user
      token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, 'HS256')

      query = <<~GRAPHQL
        mutation {
          createBoard(input: { name: "My Test Board" }) {
            board {
              id
              name
              user {
                email
              }
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_query(query, {}, { 'Authorization' => "Bearer #{token}" })

      data = result['data']['createBoard']

      expect(data['errors']).to be_empty
      expect(data['board']['name']).to eq('My Test Board')
      expect(data['board']['user']['email']).to eq(user.email)
    end

    it 'fails to create a board when not authorized' do
      query = <<~GRAPHQL
        mutation {
          createBoard(input: { name: "No Auth Board" }) {
            board {
              id
              name
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_query(query)

      data = result['data']['createBoard']

      expect(data['board']).to be_nil
      expect(data['errors']).to include('Unauthorized')
    end
  end
end
