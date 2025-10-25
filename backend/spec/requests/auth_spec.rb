require 'rails_helper'

RSpec.describe 'Auth', type: :request do
  describe 'User Registration' do
    it 'registers a new user successfully' do
      query = <<~GQL
        mutation {
          signUp(input: { email: "test@example.com", password: "password123", firstName: "John", lastName: "Doe" }) {
            user {
              id
              email
              firstName
              lastName
            }
            errors
          }
        }
      GQL

      result = graphql_query(query)
      expect(result["data"]["signUp"]["user"]["email"]).to eq("test@example.com")
      expect(result["data"]["signUp"]["errors"]).to be_empty
    end
    
    it 'fails to register a user with duplicate email' do
      # Create a user first
      create(:user, email: "duplicate@example.com", password: "password123")
      
      query = <<~GQL
        mutation {
          signUp(input: { email: "duplicate@example.com", password: "password123", firstName: "Jane", lastName: "Smith" }) {
            user {
              id
              email
            }
            errors
          }
        }
      GQL

      result = graphql_query(query)
      expect(result["data"]["signUp"]["user"]).to be_nil
      expect(result["data"]["signUp"]["errors"]).not_to be_empty
      expect(result["data"]["signUp"]["errors"]).to include(match(/email.*taken/i))
    end
  end

  describe 'User Login' do
    let!(:user) { create(:user, email: "login@example.com", password: "password123") }

    it 'logs in successfully with correct credentials' do
      query = <<~GQL
        mutation {
          login(input: { email: "login@example.com", password: "password123" }) {
            token
            errors
          }
        }
      GQL

      result = graphql_query(query)
      expect(result["data"]["login"]["token"]).not_to be_nil
      expect(result["data"]["login"]["errors"]).to be_empty
    end

    it 'fails login with wrong credentials' do
      query = <<~GQL
        mutation {
          login(input: { email: "login@example.com", password: "wrongpass" }) {
            token
            errors
          }
        }
      GQL

      result = graphql_query(query)
      expect(result["data"]["login"]["token"]).to be_nil
      expect(result["data"]["login"]["errors"]).not_to be_empty
    end
  end
end
