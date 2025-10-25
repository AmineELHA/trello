import { gql } from "graphql-request";

export const GET_BOARDS = gql`
  query GetBoards {
    boards {
      id
      name
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
          labels
          checklists
          attachments
          position
        }
      }
    }
  }
`;