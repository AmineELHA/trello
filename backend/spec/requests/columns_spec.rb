require 'rails_helper'

RSpec.describe 'Columns', type: :request do
  let(:user) { User.create!(email: 'user@example.com', password: 'password123') }
  let(:user_2) { User.create!(email: 'user_2@example.com', password: 'password123') }
  let(:board) { Board.create!(name: 'myboard', user: user) }

  def graphql_query(query, variables = {}, headers = {})
    post '/graphql',
         params: { query: query, variables: variables }.to_json,
         headers: headers.merge({ 'Content-Type' => 'application/json' })
    JSON.parse(response.body)
  end

  describe 'CreateColumn mutation' do
    it 'creates a column successfully when authorized' do
      # generate JWT token for user
      token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, 'HS256')

      query = <<~GRAPHQL
        mutation {
          createColumn(input:  { boardId: #{board.id}, name: "My Test Column" }) {
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

      result = graphql_query(query, {}, { 'Authorization' => "Bearer #{token}" })

      data = result['data']['createColumn']

      expect(data['errors']).to be_empty
      expect(data['column']['name']).to eq('My Test Column')
      expect(data['column']['board']['name']).to eq(board.name)
    end

    it 'fails to create a column when not authorized' do
      query = <<~GRAPHQL
        mutation {
          createColumn(input: { boardId: #{board.id}, name: "No Auth Column" }) {
            column {
              id
              name
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_query(query)

      data = result['data']['createColumn']

      expect(data['column']).to be_nil
      expect(data['errors']).to include('Unauthorized')
    end
    it 'fails to create a column when provided with wrong board id' do
      query = <<~GRAPHQL
        mutation {
          createColumn(input: { boardId: 123, name: "No Auth Column" }) {
            column {
              id
              name
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_query(query)

      data = result['data']['createColumn']

      expect(data['column']).to be_nil
      #TODO
      #expect(data['errors']).to include('Unauthorized')
    end
    it 'fails to create a column when the board doesnt belong to the right user' do
       token = JWT.encode({ user_id: user_2.id }, Rails.application.secret_key_base, 'HS256')
      query = <<~GRAPHQL
        mutation {
          createColumn(input: { boardId: #{board.id}, name: "No Auth Column" }) {
            column {
              id
              name
            }
            errors
          }
        }
      GRAPHQL

      result = graphql_query(query, {}, { 'Authorization' => "Bearer #{token}" })

      data = result['data']['createColumn']

      expect(data['column']).to be_nil
      expect(data['errors']).to include('Unauthorized')
    end
  end
end
