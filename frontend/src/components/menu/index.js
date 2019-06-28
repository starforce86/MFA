import React, {Component} from "react";
import {UserContext} from "../../util/auth";
import {Query} from "react-apollo";
import withApollo from "../../util/withApollo";
import Menu from "./menu";
import MENU_QUERY from "./menu-query";
import logger from "../../util/logger";
import gql from "graphql-tag";
import {compose, graphql} from "react-apollo/index";
import Router from "next/router";

const log = logger('Menu');

const CANCEL_SUBSCRIPTION = gql`
    mutation CancelSubscriptionMutation {
        delete_subscription
    }
`;

// MenuWrapper.displayName = `Menu`;
class MenuWrapper extends Component {
    render() {
        //log.trace(this.props)
        return (<UserContext.Consumer>
                {({id, user, token, isPurchaseActive}) => {
                    log.trace("menu.user", user, `(id:${id})`);
                    return (
                        <Query
                            errorPolicy={"ignore"}
                            fetchPolicy={"cache-and-network"}
                            variables={{id: id}}
                            query={MENU_QUERY}
                        >
                            {({data, error}) => {
                                log.trace("menu.data", data);

                                return (
                                    <Menu
                                        apolloClient={this.props.apolloClient}
                                        user={user}
                                        categories={data ? data.categories : []}
                                        cancelSubscription={this.props.cancelSubscription}
                                    >
                                        {this.props.children}
                                    </Menu>
                                );
                            }}
                        </Query>
                    );
                }}
            </UserContext.Consumer>
        )
    }
}


const MenuWrapperWithMutations = compose(
    graphql(CANCEL_SUBSCRIPTION, {
        name: "cancelSubscription",
        options: (props) => ({
            onCompleted: () => {
                alert('Done');
                Router.push('/hacky', "/")
            },
            onError: async errors => {
                let errorString = "";

                errors.graphQLErrors.map(item => errorString = errorString + JSON.stringify(item.message) + " ");

                //TODO return error to component
                log.error(JSON.stringify(errors.graphQLErrors));
                alert(errorString);
            }
        })
    }),
)(MenuWrapper);

export default withApollo(MenuWrapperWithMutations);

//export default withApollo(MenuWrapper);
