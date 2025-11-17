import { gql } from "graphql-request";
import { executeGraphQLQuery } from "../lib/graphqlClient";

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

// Cached query functions
export const getBoards = () => executeGraphQLQuery(GET_BOARDS);

export const getBoard = (id: string) => executeGraphQLQuery(GET_BOARD, { id });

export const getCurrentUser = () => executeGraphQLQuery(GET_CURRENT_USER);

export const getNotifications = () => executeGraphQLQuery(GET_NOTIFICATIONS);

