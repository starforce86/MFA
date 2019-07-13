import React, {Component} from "react";
import History from "./history";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import {withRouter} from "next/router";
import logger from "../../util/logger";
import {compose, graphql} from "react-apollo/index";

const log = logger('HistoryPage');

const GET_HISTORY_QUERY = gql`
    query getHistory($myId: ID!) {
        history: user(where: { id: $myId }) {
            id
            watched_videos {
                id
                video {
                    id
                    publish_date
                    description
                    title
                    file_url
                    preview_url
                    video_duration
                    author {
                        id
                        email
                        avatar
                        username
                    }
              }
            }
        }
    }

`;

const PROFILE_QUERY = gql`
    query GetProfile($id: ID!) {
        user(where: { id: $id }) {
            id
            email
            billing_subscription_active
        }
    }
`;

class HistoryPageWithoutMutations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            skip: 0
        }
    }

    setSkip(value) {
        this.setState({
            skip: value
        })
    }

    render() {

        return this.props.getUserProfile.user && this.props.getUserProfile.user.billing_subscription_active &&
            <Query errorPolicy={"ignore"}

                   query={GET_HISTORY_QUERY}
                   variables={{
                       myId: this.props.id
                   }}
                   fetchPolicy={"cache-and-network"}
            >
                {
                    ({loading, error, data}) => {
                        //if (loading) return <div>Loading...</div>;
                        if (error) return <div>Error</div>;

                        return <History user={this.props.getUserProfile.user} {...this.props}
                                        history={data.history ? data.history.watched_videos : []}/>
                    }
                }
            </Query> || null
    }
}

const HistoryPage = compose(
    graphql(PROFILE_QUERY, {
        name: "getUserProfile",
        options: props => ({
            variables: {
                id: props.id
            },
            fetchPolicy: "cache-and-network",
            onCompleted: (data) => {
                if (data && data.user) {
                    // if (!data.user.billing_subscription_active) props.router.push("/payment")
                }1
            },
        })
    })
)(HistoryPageWithoutMutations);

export default withApollo(withRouter(HistoryPage));
