import React, {Component} from "react";
import Settings from "./settings";
import gql from "graphql-tag";
import {compose, graphql, withApollo} from "react-apollo";
import logger from "../../util/logger";

const log = logger('Settings');

const PROFILE_QUERY = gql`
    query GetProfile($id: ID!) {
        user(where: { id: $id }) {
            id
            subscribed_users_count
            createdAt
            updatedAt
            firstname
            lastname
            username
            email
            role
            last4
            stripe_subsciption_json
            avatar
            background_image
            about_text

            billing_subscription_active
            stripe_customer_id
            last_login_date
        }
    }
`;

const CANCEL_SUBSCRIPTION = gql`
    mutation CancelSubscriptionMutation {
        delete_subscription
    }
`;

const UPDATE_USER_PROFILE = gql`
    mutation UpdateUserProfile($id: ID, $firstname: String, $lastname: String, $username:String, $about_text:String) {
        updateUser(
            data: { firstname: $firstname, lastname: $lastname, username: $username, about_text: $about_text }
            where: { id: $id }
        ) {
            firstname
            lastname
        }
    }
`;

const CHANGE_PASSWORD = gql`
    mutation ChangeUserPasswordMutation(
        $old_password: String!
        $new_password: String!
    ) {
        change_password(old_password: $old_password, new_password: $new_password) {
            user {
                email
                username
                lastname
                firstname
                avatar
                id
                my_subscription_users {
                    id
                    avatar
                    username
                    lastname
                    firstname
                }
            }
            token
            status
        }
    }
`;

class SettingsPageWithoutMutations extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            errors: null
        };

        // await login({user, token});
    }

    handleSaveUserProfile = async (
        firstname,
        lastname,
        // oldPassword,
        // newPassword,
        username,
        about_text
    ) => {
        if (firstname && lastname) {
            await this.props.updateUserProfile({
                variables: {
                    id: this.props.id,
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    about_text: about_text
                }
            });
        }

        // if (
        //     oldPassword !== null &&
        //     oldPassword !== undefined &&
        //     newPassword !== null &&
        //     newPassword !== undefined
        // ) {
        //     await this.props.changePassword({
        //         variables: {old_password: oldPassword, new_password: newPassword}
        //     });
        // }
    };

    handleCancelSubscription = async () => {
        await this.props.cancelSubscription();
    };

    render() {
        return (
            (this.props.getUserProfile.user && (
                <Settings
                    {...this.props}
                    saveUserProfile={(firstname, lastname, username, bio) =>
                        this.handleSaveUserProfile(
                            firstname,
                            lastname,
                            username,
                            bio
                        )
                    }
                    cancelSubscription={() => this.handleCancelSubscription()}
                    user={this.props.getUserProfile.user}
                />
            )) || <div/>
        );
    }
}

const SettingsPage = compose(
    graphql(CHANGE_PASSWORD, {
        name: "changePassword",
        options: {
            update: async (proxy, {data}) => {
            },
            onCompleted: async result => {
                if (result && result.change_password) {
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

    graphql(UPDATE_USER_PROFILE, {
        name: "updateUserProfile"
    }),

    graphql(CANCEL_SUBSCRIPTION, {
        name: "cancelSubscription",
        options: {
            onCompleted: () => {
                alert('Done');
            },
            onError: async errors => {
                let errs = JSON.stringify(errors);
                //TODO return error to component
                log.trace(JSON.stringify(errs));
                alert('Error');
            }
        }
    }),

    graphql(PROFILE_QUERY, {
        name: "getUserProfile",
        options: props => ({
            variables: {
                id: props.id
            },
            errorPolicy: "ignore",
            fetchPolicy: "cache-and-network"
        })
    })
)(SettingsPageWithoutMutations);

export default withApollo(SettingsPage);
