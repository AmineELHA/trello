require 'jwt'

module Mutations
  class Login < BaseMutation
    argument :email, String, required: true
    argument :password, String, required: true

    field :token, String, null: true
    field :errors, [String], null: false

    def resolve(email:, password:)
      user = User.find_by(email: email)
      if user&.valid_password?(password)
        token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
        { token: token, errors: [] }
      else
        { token: nil, errors: ["Invalid email or password"] }
      end
    end
  end
end