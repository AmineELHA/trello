import { gql } from "graphql-request";

export const REGISTER_USER = `
mutation signUp($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
  signUp(input: { email: $email, password: $password, firstName: $firstName, lastName: $lastName }) {
    user {
      id
      email
      firstName
      lastName
    }
    token
    errors
  }
}
`;

export const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      errors
    }
  }
`;

export const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    createBoard(input: { name: $name }) {
      board {
        id
        name
      }
      errors
    }
  }
`;

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: ID!, $name: String) {
    updateBoard(input: { id: $id, name: $name }) {
      board {
        id
        name
      }
      errors
    }
  }
`;

export const DELETE_BOARD = gql`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(input: { id: $id }) {
      board {
        id
        name
      }
      errors
    }
  }
`;

export const CREATE_COLUMN = gql`
  mutation CreateColumn($name: String!, $board_id: Int!) {
    createColumn(input: { name: $name, boardId: $board_id }) {
      column {
        id
        name
      }
      errors
    }
  }
`;

export const UPDATE_COLUMN = gql`
  mutation UpdateColumn($id: ID!, $name: String) {
    updateColumn(input: { id: $id, name: $name }) {
      column {
        id
        name
      }
      errors
    }
  }
`;

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: ID!) {
    deleteColumn(input: { id: $id }) {
      column {
        id
        name
      }
      errors
    }
  }
`;

export const REORDER_COLUMN = gql`
  mutation ReorderColumn($column_id: ID!, $new_position: Int!) {
    reorderColumn(input: { columnId: $column_id, newPosition: $new_position }) {
      column {
        id
        name
        position
      }
      errors
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $column_id: ID!) {
    createTask(input: { title: $title, columnId: $column_id }) {
      task {
        id
        title
        description
        dueDate
        labels
        checklists
        attachments
        position
      }
      errors
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $due_date: ISO8601DateTime, $labels: [String!], $checklists: JSON, $attachments: [String!], $column_id: ID, $position: Int) {
    updateTask(input: { 
      id: $id, 
      title: $title, 
      description: $description, 
      dueDate: $due_date, 
      labels: $labels, 
      checklists: $checklists, 
      attachments: $attachments, 
      columnId: $column_id, 
      position: $position
    }) {
      task {
        id
        title
        description
        dueDate
        labels
        checklists
        attachments
        position
      }
      errors
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(input: { id: $id }) {
      task {
        id
        title
      }
      errors
    }
  }
`;

export const REORDER_TASK = gql`
  mutation ReorderTask($task_id: ID!, $new_column_id: ID, $new_position: Int!) {
    reorderTask(input: { taskId: $task_id, newColumnId: $new_column_id, newPosition: $new_position }) {
      task {
        id
        title
        column {
          id
          name
        }
        position
      }
      errors
    }
  }
`;
