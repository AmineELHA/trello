import { gql } from "graphql-request";
import { getGraphQLClient } from "../lib/graphqlClient";

const client = getGraphQLClient();

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

// Mutation functions that clear relevant cache after execution
export const registerUser = (email: string, password: string, firstName: string, lastName: string, username: string) =>
  client.request(REGISTER_USER, { email, password, firstName, lastName, username });

export const loginUser = (email: string, password: string) =>
  client.request(LOGIN_USER, { email, password });

export const createBoard = (name: string) =>
  client.request(CREATE_BOARD, { name });

export const updateBoard = (id: string, name: string) =>
  client.request(UPDATE_BOARD, { id, name });

export const deleteBoard = (id: string) =>
  client.request(DELETE_BOARD, { id });

export const createColumn = (name: string, board_id: number) =>
  client.request(CREATE_COLUMN, { name, board_id });

export const updateColumn = (id: string, name: string) =>
  client.request(UPDATE_COLUMN, { id, name });

export const deleteColumn = (id: string) =>
  client.request(DELETE_COLUMN, { id });

export const reorderColumn = (column_id: string, new_position: number) =>
  client.request(REORDER_COLUMN, { column_id, new_position });

export const createTask = (title: string, column_id: string, color?: string, due_date?: string, reminder_date?: string) =>
  client.request(CREATE_TASK, { title, column_id, color, due_date, reminder_date });

export const updateTask = (
  id: string,
  title?: string,
  description?: string,
  due_date?: string,
  reminder_date?: string,
  labels?: string[],
  checklists?: any,
  attachments?: string[],
  color?: string,
  completed?: boolean,
  column_id?: string,
  position?: number
) =>
  client.request(UPDATE_TASK, {
    id, title, description, due_date, reminder_date, labels, checklists, attachments,
    color, completed, column_id, position
  });

export const deleteTask = (id: string) =>
  client.request(DELETE_TASK, { id });

export const reorderTask = (task_id: string, new_column_id: string, new_position: number) =>
  client.request(REORDER_TASK, { task_id, new_column_id, new_position });

export const updateUser = (first_name?: string, last_name?: string, username?: string, avatar?: string) =>
  client.request(UPDATE_USER, { first_name, last_name, username, avatar });

export const markNotificationAsRead = (id: string) =>
  client.request(MARK_NOTIFICATION_AS_READ, { id });

export const markAllNotificationsAsRead = () =>
  client.request(MARK_ALL_NOTIFICATIONS_AS_READ);
