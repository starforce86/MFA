import React, {Component} from "react";
import Channel from "./channel";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import {withRouter} from 'next/router'
import logger from "../../util/logger";

const log = logger('Channel');

const GET_CHANNELS_QUERY = gql`
    query GetUser($id: ID!) {
        user(where: { id: $id }) {
            id
            background_image
            about_text
            firstname
            lastname
            username
            email
            avatar
            role
            my_videos {
                id
                title
                publish_date
                description
                file_url
                preview_video_url
                preview_url
                author {
                    id
                    email
                }
                approved
            }
            subscribed_users_count
        }
    }
`;

class ChannelPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            skip: 0
        }
    }

    setSkip(value) {
        log.trace({value});
        this.setState({
            skip: value
        })
    }

    render() {
        const id = this.props.router.query.id;
        return <Query errorPolicy={"ignore"}
                      query={GET_CHANNELS_QUERY}
                      variables={{
                          id: id
                      }}>
            {
                ({loading, error, data}) => {
                    //if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;

                    return <Channel {...this.props} user={data.user}/>
                }
            }
        </Query>;
    }
}

export default withRouter(withApollo(ChannelPage));
