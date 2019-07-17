import React, {Component} from "react";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import {withRouter} from "next/router";
import NewsDetail from "../../components/newsd";
import logger from "../../util/logger";

const log = logger('NewsDetailPage');

const NEWS_DETAIL_QUERY = gql`
    query NewsDetailQuery($id: ID) {
        post(where: { id: $id }) {
            id
            title
            mainImageUrl
            text
            createdAt
        }
    }
`;

class NewsDetailPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return <Query errorPolicy={"ignore"}
                      query={NEWS_DETAIL_QUERY}
                      variables={{
                          id: this.props.router.query.id
                      }}>
            {
                ({loading, error, data}) => {
                    if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;
                  //  log.trace(data);
                    const post = data
                        ? data.post
                        : null;
                    return post ? <NewsDetail post={post} /> : '';
                }
            }
        </Query>
    }
}

export default withRouter(withApollo(NewsDetailPage));
