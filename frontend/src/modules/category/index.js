import React, {Component} from "react";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import {withRouter} from "next/router";
import Videos from "../../components/videos";
import logger from "../../util/logger";

const log = logger('Category');

const CATEGORY_QUERY = gql`
    query CategoryQuery($id: ID) {
        category(where: { id: $id }) {
            id
            title
            description
            videos {
                id
                title
                preview_video_url
                preview_url
                file_url
                publish_date
                description
                categories {
                    id
                    title
                }
                author {
                    id
                    username
                    email
                    avatar
                }
                deleted
            }
        }
    }
`;

class CategoryPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return <Query errorPolicy={"ignore"}
                      query={CATEGORY_QUERY}
                      variables={{
                          id: this.props.router.query.id
                      }}>
            {
                ({loading, error, data}) => {
                    //if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;
                  //  log.trace(data);
                    const videos = data
                        ? data.category
                            ? data.category.videos.filter(v => v.deleted == false)
                            : []
                        : [];
                    const title = data ? (data.category ? data.category.title : "") : "";
                    return <Videos videos={videos} title={title}/>;
                }
            }
        </Query>
    }
}

export default withRouter(withApollo(CategoryPage));
