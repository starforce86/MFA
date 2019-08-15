import React, {Component} from "react";
import Curriculum from "../../components/curriculum";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import logger from "../../util/logger";
import {compose, graphql} from "react-apollo/index";

const log = logger('Curriculum');

const MAIN_QUERY = gql`
    query GetData {
        curricula(orderBy: order_ASC) {
            id
            title
            text
            order
            createdAt
        }
        tags {
            id
            text
        }
    }
`;

const CREATE_CURRICULUM = gql`
    mutation CreateCurriculum($title: String!, $text: String!, $order: Int, $author: ID!) {
        createCurriculum(
            data: {
                title: $title
                text: $text
                order: $order
                author: {
                    connect: {
                        id: $author
                    }
                }
            }
        ) {
            id
        }
    }
`;

const UPDATE_CURRICULUM = gql`
    mutation UpdateCurriculum($id: ID, $title: String!, $text: String!, $order: Int, $author: ID) {
        updateCurriculum(
            where: { id: $id }
            data: {
                title: $title
                text: $text
                order: $order
                author: {
                    connect: {
                        id: $author
                    }
                }
            }
        ) {
            id
        }
    }
`;

const DELETE_CURRICULUM = gql`
    mutation DeleteCurriculum($id: ID) {
        deleteCurriculum(
            where: {
                id: $id
            }
        ) {
            id
        }
    }
`;

class CurriculumPageWithoutMutations extends Component {
    constructor(props) {
        super(props);
    }

    handleSaveCurriculum = async (
        id,
        title,
        text,
        order
    ) => {
        if (!title) {
            return {error: true, message: 'Please input title!'};
        }
        if (!text) {
            return {error: true, message: 'Please input text!'};
        }
        if (!order) {
            return {error: true, message: 'Please input order!'};
        }
        const author = this.props.id;
        if(id) {
            const result = await this.props.updateCurriculum({
                variables: {
                    id: id,
                    title: title,
                    text: text,
                    order: order,
                    author: author
                }
            });
        } else {
            const result = await this.props.createCurriculum({
                variables: {
                    title: title,
                    text: text,
                    order: order,
                    author: author
                }
            });
        }
        return {error: false};
    };

    handleDeleteCurriculum = async (id) => {
        const result = await this.props.deleteCurriculum({
            variables: {
                id: id
            }
        });
        return {error: false};
    };

    render() {

        return <Query errorPolicy={"ignore"}
                      query={MAIN_QUERY}
                      variables={{
                          skip: 0
                      }}>
            {
                ({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;
                    const curricula = data
                        ? data.curricula
                        : [];
                    const tags = data
                        ? data.tags
                        : [];
                    return (
                        <Curriculum
                            curricula={curricula}
                            tags={tags}
                            saveCurriculum={async (id, title, text, order) =>
                                await this.handleSaveCurriculum(
                                    id,
                                    title,
                                    text,
                                    order
                                )
                            }
                            deleteCurriculum={async (id) => await this.handleDeleteCurriculum(id)}
                        />
                    )
                }
            }
        </Query>;
    }
}

const CurriculumPage = compose(
    graphql(CREATE_CURRICULUM, {
        name: "createCurriculum",
        options: {
            update: async (proxy, {data}) => {
            },
            onCompleted: async result => {
                if (result) {
                    // log.trace(result);
                    //TODO await login({user,token}) now token is null
                }
            },
            onError: async errors => {
                let errorString = "";
              
                errors.graphQLErrors.map(item => errorString = errorString + JSON.stringify(item.message) + " ");

                //TODO return error to component
                log.error(JSON.stringify(errors.graphQLErrors));
                alert(errorString);
            }
        }
    }),
    graphql(UPDATE_CURRICULUM, {
        name: "updateCurriculum",
        options: {
            update: async (proxy, {data}) => {
            },
            onCompleted: async result => {
                if (result) {
                    // log.trace(result);
                    //TODO await login({user,token}) now token is null
                }
            },
            onError: async errors => {
                let errorString = "";
              
                errors.graphQLErrors.map(item => errorString = errorString + JSON.stringify(item.message) + " ");

                //TODO return error to component
                log.error(JSON.stringify(errors.graphQLErrors));
                alert(errorString);
            }
        }
    }),
    graphql(DELETE_CURRICULUM, {
        name: "deleteCurriculum",
        options: {
            update: async (proxy, {data}) => {
            },
            onCompleted: async result => {
                if (result) {
                    // log.trace(result);
                    //TODO await login({user,token}) now token is null
                }
            },
            onError: async errors => {
                let errorString = "";
              
                errors.graphQLErrors.map(item => errorString = errorString + JSON.stringify(item.message) + " ");

                //TODO return error to component
                log.error(JSON.stringify(errors.graphQLErrors));
                alert(errorString);
            }
        }
    }),
)(CurriculumPageWithoutMutations);

export default withApollo(CurriculumPage);

