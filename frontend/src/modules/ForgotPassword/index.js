import React, {Component} from 'react'
import {Formik} from "formik";
import * as Yup from "yup";
import ForgotPassword from './ForgotPassword'
import {Mutation, withApollo} from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import logger from "../../util/logger";

const log = logger('ForgotPassword');

const emptyForm = {
    email: "",
};
const formInputs = {
    email: "email",
};
const validationSchema = Yup.object().shape({
    [formInputs.email]: Yup.string()
        .trim()
        .email("Email format is not correct.")
        .required("This field is required."),
});

const FORGOT_PASSWORD = gql`
    mutation RestorePasswordMutation($email: String!, $restore_code: String, $new_password:String, $step: RestorePasswordStep!) {
        restore_password(email: $email, restore_code: $restore_code, new_password: $new_password, step: $step) {
            user {
                id
                email
                avatar
                username
            }
            token
            status
        }
    }`;

class ForgotPasswordPage extends Component {

    state = {loading: false};

    render() {
        const {loading} = this.state;
        return (
            <Mutation
                mutation={FORGOT_PASSWORD}
                onCompleted={async data => {
                  //  log.trace("onCompleted", data);
                }}
            >
                {(submitMutation, {loading, error}) => (<Formik
                        initialValues={emptyForm}
                        validationSchema={validationSchema}
                        onSubmit={async values => {

                            await submitMutation({
                                variables: {
                                    email: values.email.toLowerCase(),
                                    step: "GENERATE_RESTORE_CODE"
                                }
                            });
                            Router.push("/reset");

                        }}
                        render={(props) => (
                            <ForgotPassword {...props} loading={loading} error={error}/>
                        )}
                    />
                )}
            </Mutation>)
    }
}

export default withApollo(ForgotPasswordPage)
