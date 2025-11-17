Rails.application.routes.draw do
  # Health check endpoint for Kamal
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users
  post "/graphql", to: "graphql#execute"

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
end
