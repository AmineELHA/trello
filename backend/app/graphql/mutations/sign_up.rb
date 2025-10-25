module Mutations
  class SignUp < BaseMutation
    argument :email, String, required: true
    argument :password, String, required: true
    argument :first_name, String, required: true
    argument :last_name, String, required: true

    field :user, Types::UserType, null: true
    field :token, String, null: true
    field :errors, [ String ], null: false

    def resolve(email:, password:, first_name:, last_name:)
      user = User.new(email: email, password: password, password_confirmation: password, first_name: first_name, last_name: last_name)

      if user.save
        token = generate_token(user)
        { user: user, token: token, errors: [] }
      else
        { user: nil, token: nil, errors: user.errors.full_messages }
      end
    end

    private

    def generate_token(user)
      JWT.encode({ user_id: user.id, email: user.email, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base, "HS256")
    end
  end
end
