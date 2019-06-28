import React, {Component} from "react";
import Favorites from "./favorites";
import gql from "graphql-tag";
import {Query, withApollo} from "react-apollo";
import {withRouter} from "next/router";
import logger from "../../util/logger";
import {compose, graphql} from "react-apollo/index";

const log = logger('Favorites');

const GET_FAVORITES_QUERY = gql`
    query getFavorites($myId: ID!) {
        favorites: user(where: { id: $myId }) {
            id
            liked_videos {
                id
                publish_date
                description
                title
                file_url
                preview_url
                author {
                    id
                    email
                    avatar
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


class FavoritesPageWithoutMutations extends Component {
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
        return this.props.getUserProfile.user && this.props.getUserProfile.user.billing_subscription_active &&
            <Query errorPolicy={"ignore"}
                   query={GET_FAVORITES_QUERY}
                   variables={{
                       myId: this.props.id
                   }}
                   fetchPolicy={"cache-and-network"}
            >
                {
                    ({loading, error, data}) => {
                        //if (loading) return <div>Loading...</div>;
                        if (error) return <div>Error</div>;

                        return <Favorites user={this.props.getUserProfile.user} {...this.props}
                                          videos={data.favorites ? data.favorites.liked_videos : []}/>
                    }
                }
            </Query> || null;
    }
}

const FavoritesPage = compose(
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
)(FavoritesPageWithoutMutations);

export default withApollo(withRouter(FavoritesPage));

