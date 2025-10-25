# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    # Auth mutations
    field :sign_up, mutation: Mutations::SignUp
    field :login, mutation: Mutations::Login

    # Board mutations
    field :create_board, mutation: Mutations::CreateBoard
    field :update_board, mutation: Mutations::UpdateBoard
    field :delete_board, mutation: Mutations::DeleteBoard

    # Column mutations
    field :create_column, mutation: Mutations::CreateColumn
    field :update_column, mutation: Mutations::UpdateColumn
    field :delete_column, mutation: Mutations::DeleteColumn
    field :reorder_column, mutation: Mutations::ReorderColumn

    # Task mutations
    field :create_task, mutation: Mutations::CreateTask
    field :update_task, mutation: Mutations::UpdateTask
    field :delete_task, mutation: Mutations::DeleteTask
    field :reorder_task, mutation: Mutations::ReorderTask

  end
end
