import { gql } from "graphql-request";

export const REGISTER_USER = gql`
  mutation sign_up($email: String!, $password: String!) {
    sign_up(input: { email: $email, password: $password }) {
      user {
        id
        email
      }
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
