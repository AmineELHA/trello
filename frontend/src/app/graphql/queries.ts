import { gql } from "graphql-request";

export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      name
      columns {
        id
        tasks {
          id
        }
      }
    }
  }
`;

export const GET_BOARD = gql`
  query GetBoard($id: ID!) {
    board(id: $id) {
      id
      name
      columns {
        id
        name
        position
        tasks {
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
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      firstName
      lastName
      username
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      message
      read
      createdAt
      task {
        id
        title
      }
    }
  }
`;

