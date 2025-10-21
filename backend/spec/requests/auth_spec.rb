require 'rails_helper'

RSpec.describe 'Auth', type: :request do
  describe 'User Registration' do
    it 'registers a new user successfully' do
      query = <<~GQL
        mutation {
          signUp(input: { email: "test@example.com", password: "password123" }) {
            user {
              id
              email
            }
            errors
          }
        }
      GQL

      result = graphql_query(query)
      expect(result["data"]["signUp"]["user"]["email"]).to eq("test@example.com")
      expect(result["data"]["signUp"]["errors"]).to be_empty
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
