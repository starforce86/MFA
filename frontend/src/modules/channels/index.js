import React, {Component} from "react";
import Channels from "./channels";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import logger from "../../util/logger";
import {compose, graphql} from "react-apollo/index";

const log = logger('Channels');

const GET_CHANNELS_QUERY = gql`
    query GetChannels($skip: Int!) {
        channels_count: usersConnection (where: { role: USER_PUBLISHER }) {
            aggregate{
                count
            }
        }
        channels: users(first: 20, skip: $skip, where: { role: USER_PUBLISHER, approved: true }) {
            id
            createdAt
            updatedAt
            firstname
            lastname
            username
            email
            role
            avatar
            subscribed_users_count
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

class ChannelsPageWithoutMutations extends Component {
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

        return <Query errorPolicy={"ignore"}
                      query={GET_CHANNELS_QUERY}
                      variables={{
                          skip: this.state.skip
                      }}>
            {
                ({loading, error, data}) => {
                    //if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;

                    return <Channels {...this.props}
                                     user={this.props.getUserProfile.user}
                                     channels={data.channels}
                                     channelsCount={data.channels_count ? data.channels_count.aggregate ? data.channels_count.aggregate.count : null : null}
                                     skip={this.state.skip}
                                     setSkip={this.setSkip.bind(this)}
                    />
                }
            }
        </Query>;
    }
}

const ChannelsPage = compose(
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
                }
                //alert('Done');
            },
        })
    })
)(ChannelsPageWithoutMutations);


export default withApollo(ChannelsPage);

