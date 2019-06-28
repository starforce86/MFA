import React, {Component} from "react";
import Subscriptions from "./subscriptions";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import {withRouter} from "next/router";
import {compose, graphql} from "react-apollo/index";

const GET_MY_SUBSCRIPTIONS_QUERY = gql`
    query MySubs($myId: ID!) {
        channels_count: usersConnection(
            where: { subscribed_users_some: { id: $myId } }
        ) {
            aggregate {
                count
            }
        }

        user: user(where: { id: $myId }) {
            id
            my_subscription_users {
                id
                email
                avatar
                subscribed_users_count
                subscribed_users {
                    id
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

class SubscriptionsPageWithoutMutations extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        return this.props.getUserProfile.user && this.props.getUserProfile.user.billing_subscription_active &&
            <Query errorPolicy={"ignore"}
                   query={GET_MY_SUBSCRIPTIONS_QUERY}
                   variables={{
                       myId: this.props.id
                   }}>
                {
                    ({loading, error, data}) => {
                        //if (loading) return <div>Loading...</div>;
                        if (error) return <div>Error</div>;

                        return <Subscriptions {...this.props}
                                              user={this.props.getUserProfile.user}
                                              channels={data.user ? data.user.my_subscription_users : []}
                        />
                    }
                }
            </Query> || null
    }
}

const SubscriptionsPage = compose(
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
)(SubscriptionsPageWithoutMutations);

export default withApollo(withRouter(SubscriptionsPage));

