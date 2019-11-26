import React, {Component} from "react";
import Settings from "./settings";
import gql from "graphql-tag";
import {compose, graphql, withApollo} from "react-apollo";
import { notification } from 'antd';
import 'antd/dist/antd.css';
import logger from "../../util/logger";
import { async } from "q";

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
            my_promo_codes {
                promo_code
                current_promo_code
            }
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

const RESUBSCRIBE = gql`
    mutation purchase($token: String!, $plan: StripePlan!) {
        purchase(stripe_tok_token: $token, plan: $plan)
    }
`;

const CHANGE_CARD = gql`
    mutation changeCard($newStripeTokToken: String!) {
        changeCard(
            newStripeTokToken: $newStripeTokToken
        )
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

const CHANGE_PROMO_CODE = gql`
    mutation changePromoCode($promo_code: String!) {
        changePromoCode(
            promo_code: $promo_code
        )
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

    handleChangePromoCode = async (promo_code) => {
        console.log('############# handleChangePromoCode', promo_code)

        if (promo_code) {
            await this.props.changePromoCode({
                variables: {
                    promo_code: promo_code
                }
            });
        }
    };

    handleCancelSubscription = async () => {
        await this.props.cancelSubscription();
    };

    handleResubscribe = async (token, plan) => {
        return await this.props.resubscribe({
            variables: {
                token: token,
                plan: plan
            }
        });
    };

    handleChangeCard = async (token) => {
        return await this.props.changeCard({
            variables: {
                newStripeTokToken: token
            }
        });
    };

    render() {
        return (
            (this.props.getUserProfile.user && (
                <Settings
                    {...this.props}
                    saveUserProfile={async (firstname, lastname, username, bio) => {
                        return await this.handleSaveUserProfile(
                            firstname,
                            lastname,
                            username,
                            bio
                        )
                    }}
                    changePromoCode={async (promo_code) => {
                        console.log('########### changePromoCode', promo_code)
                        return await this.handleChangePromoCode(
                            promo_code
                        )
                    }}
                    cancelSubscription={() => this.handleCancelSubscription()}
                    resubscribe={async (token, plan) => await this.handleResubscribe(token, plan)}
                    changeCard={async (token) => await this.handleChangeCard(token)}
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

    graphql(RESUBSCRIBE, {
        name: "resubscribe",
        options: props => ({
            variables: {
                token: props.token,
                plan: props.plan
            },
            onCompleted: (res) => {
                if(res.purchase) {
                    location.reload();
                }
                else {
                    notification['error']({
                        message: 'Error!',
                        description: "Unknown error occured!",
                    });
                }
            },
            onError: async errors => {
                let errs = JSON.stringify(errors);
                //TODO return error to component
                log.trace(errs);
                if(errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
                    const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
                    notification['error']({
                        message: 'Error!',
                        description: errMsg,
                    });
                } else {
                    notification['error']({
                        message: 'Error!',
                        description: "Unknown error occured!",
                    });
                }
                return {error: true}
            }
        })
    }),

    graphql(CHANGE_PROMO_CODE, {
        name: "changePromoCode",
        options: props => ({
            variables: {
                promo_code: props.promo_code
            },
            onCompleted: (res) => {
                if(res.changePromoCode) {
                    location.reload();
                }
                else {
                    notification['error']({
                        message: 'Error!',
                        description: "Unknown error occured!",
                    });
                }
            },
            onError: async errors => {
                let errs = JSON.stringify(errors);
                //TODO return error to component
                log.trace(errs);
                if(errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
                    const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
                    notification['error']({
                        message: 'Error!',
                        description: errMsg,
                    });
                } else {
                    notification['error']({
                        message: 'Error!',
                        description: "Unknown error occured!",
                    });
                }
                return {error: true}
            }
        })
    }),

    graphql(CHANGE_CARD, {
        name: "changeCard",
        options: props => ({
            variables: {
                newStripeTokToken: props.newStripeTokToken
            },
            onCompleted: (res) => {
                if(res.changeCard) {
                    location.reload();
                }
                else {
                    notification['error']({
                        message: 'Error!',
                        description: "Unknown error occured!",
                    });
                }
            },
            onError: async errors => {
                let errs = JSON.stringify(errors);
                //TODO return error to component
                log.trace(errs);
                if(errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
                    const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
                    notification['error']({
                        message: 'Error!',
                        description: errMsg,
                    });
                } else {
                    notification['error']({
                        message: 'Error!',
                        description: "Unknown error occured!",
                    });
                }
                return {error: true}
            }
        })
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
