import { gql } from "graphql-request";

export const REGISTER_USER = gql`
mutation SignUp($email: String!, $password: String!, $firstName: String!, $lastName: String!, $username: String!) {
  signUp(input: { email: $email, password: $password, firstName: $firstName, lastName: $lastName, username: $username }) {
    user {
      id
      email
      firstName
      lastName
      username
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
  mutation CreateTask($title: String!, $column_id: ID!, $color: String, $due_date: ISO8601DateTime, $reminder_date: ISO8601DateTime) {
    createTask(input: { title: $title, columnId: $column_id, color: $color, dueDate: $due_date, reminderDate: $reminder_date }) {
      task {
        id
        title
        description
        dueDate
        reminderDate
        labels
        checklists
        attachments
        color
        position
      }
      errors
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String, $description: String, $due_date: ISO8601DateTime, $reminder_date: ISO8601DateTime, $labels: [String!], $checklists: JSON, $attachments: [String!], $color: String, $completed: Boolean, $column_id: ID, $position: Int) {
    updateTask(input: { 
      id: $id, 
      title: $title, 
      description: $description, 
      dueDate: $due_date, 
      reminderDate: $reminder_date, 
      labels: $labels, 
      checklists: $checklists, 
      attachments: $attachments, 
      color: $color, 
      completed: $completed, 
      columnId: $column_id, 
      position: $position
    }) {
      task {
        id
        title
        description
        dueDate
        reminderDate
        labels
        checklists
        attachments
        color
        completed
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

export const UPDATE_USER = gql`
  mutation UpdateUser($first_name: String, $last_name: String, $username: String, $avatar: String) {
    updateUser(input: { firstName: $first_name, lastName: $last_name, username: $username, avatar: $avatar }) {
      user {
        id
        email
        firstName
        lastName
        username
        avatar
      }
      errors
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(input: { id: $id }) {
      notification {
        id
        message
        read
        createdAt
      }
      errors
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      errors
    }
  }
`;
