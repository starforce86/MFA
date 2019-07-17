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
            createdAt
        }
    }
`;

class NewsPageWithoutMutations extends Component {
    constructor(props) {
        super(props);
    }

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
                    return <News posts={posts} />
                }
            }
        </Query>;
    }
}

export default withApollo(NewsPageWithoutMutations);

