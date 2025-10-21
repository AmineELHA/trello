# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    # Add SignUp mutation
    field :sign_up, mutation: Mutations::SignUp

    # Add Login mutation
    field :login, mutation: Mutations::Login

    field :create_board, mutation: Mutations::CreateBoard

    field :create_column, mutation: Mutations::CreateColumn

    field :create_task, mutation: Mutations::CreateTask

  end
end
