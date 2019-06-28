import gql from "graphql-tag";

const MENU_QUERY = gql`
    query MenuQuery {
        categories {
            id
            title
        }
    }
`;

export default MENU_QUERY;
