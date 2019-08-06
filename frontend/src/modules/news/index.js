import React, {Component} from "react";
import News from "../../components/news";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import logger from "../../util/logger";
import {compose, graphql} from "react-apollo/index";

const log = logger('News');

const NEWS_QUERY = gql`
    query GetPosts {
        posts(orderBy: createdAt_DESC) {
            id
            title
            mainImageUrl
            text
            createdAt
        }
    }
`;

const CREATE_POST = gql`
    mutation CreatePost($title: String!, $text: String!, $mainImageUrl: String, $author: ID) {
        createPost(
            data: {
                title: $title
                text: $text
                mainImageUrl: $mainImageUrl
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

const UPDATE_POST = gql`
    mutation UpdatePost($id: ID, $title: String!, $text: String!, $mainImageUrl: String, $author: ID) {
        updatePost(
            where: { id: $id }
            data: {
                title: $title
                text: $text
                mainImageUrl: $mainImageUrl
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

const DELETE_POST = gql`
    mutation DeletePost($id: ID) {
        deletePost(
            where: {
                id: $id
            }
        ) {
            id
        }
    }
`;

class NewsPageWithoutMutations extends Component {
    constructor(props) {
        super(props);
    }

    handleSaveNews = async (
        id,
        imageFile,
        title,
        description
    ) => {
        if (!imageFile) {
            return {error: true, message: 'Please input image file!'};
        }
        if (!title) {
            return {error: true, message: 'Please input title!'};
        }
        if (!description) {
            return {error: true, message: 'Please input description!'};
        }
        const author = this.props.id;
        if(id) {
            const result = await this.props.updatePost({
                variables: {
                    id: id,
                    title: title,
                    text: description,
                    mainImageUrl: imageFile,
                    author: author
                }
            });
        } else {
            const result = await this.props.createPost({
                variables: {
                    title: title,
                    text: description,
                    mainImageUrl: imageFile,
                    author: author
                }
            });
        }
        return {error: false};
    };

    handleDeleteNews = async (id) => {
        const result = await this.props.deletePost({
            variables: {
                id: id
            }
        });
        return {error: false};
    };

    render() {

        return <Query errorPolicy={"ignore"}
                      query={NEWS_QUERY}
                      variables={{
                          skip: 0
                      }}>
            {
                ({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;
                    const posts = data
                        ? data.posts
                        : [];
                    return <News
                        posts={posts}
                        saveNews={async (id, imageFile, title, description) =>
                            await this.handleSaveNews(
                                id,
                                imageFile,
                                title,
                                description
                            )
                        }
                        deleteNews={async (id) => await this.handleDeleteNews(id)}
                    />
                }
            }
        </Query>;
    }
}

const NewsPage = compose(
    graphql(CREATE_POST, {
        name: "createPost",
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
    graphql(UPDATE_POST, {
        name: "updatePost",
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
    graphql(DELETE_POST, {
        name: "deletePost",
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
)(NewsPageWithoutMutations);

export default withApollo(NewsPage);

