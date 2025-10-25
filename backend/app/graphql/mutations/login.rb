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
        token = JWT.encode({ user_id: user.id, email: user.email, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base, "HS256")
        { token: token, errors: [] }
      else
        { token: nil, errors: ["Invalid email or password"] }
      end
    end
  end
end