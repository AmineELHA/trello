module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # Extract the user from the JWT token
      token = request.params[:token] || request.headers['Authorization']&.split(' ')&.last
      return reject_unauthorized_connection unless token

      begin
        decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')
        user_id = decoded_token[0]['user_id']
        user = User.find(user_id)
        user
      rescue => e
        reject_unauthorized_connection
      end
    end
  end
end