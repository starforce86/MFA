import React, {Component} from 'react'
import {Formik} from "formik";
import * as Yup from "yup";
import {login} from '../../util/auth'
import PasswordReset from './PasswordReset'
import {Mutation, withApollo} from "react-apollo";
import gql from "graphql-tag";

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

const RESET_PASSWORD = gql`
    mutation ResetPasswordMutation($email: String!, $restore_code: String, $new_password:String, $step: RestorePasswordStep!) {
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

class PasswordResetPage extends Component {

    state = {loading: false};

    render() {
        const {loading} = this.state;
        return (
            <Mutation
                mutation={RESET_PASSWORD}
                onCompleted={async data => {

                    const {token, user} = await data.restore_password;
                    await login({user, token})
                }}
            >
                {(submitMutation, {loading, error}) => (<Formik
                        initialValues={emptyForm}
                        validationSchema={validationSchema}
                        onSubmit={async values => {
                            this.setState({loading: true});

                            await submitMutation({
                                variables: {
                                    email: values.email.toLowerCase(),
                                    restore_code: values.code,
                                    new_password: values.new_password,
                                    step: "CHECK_RESTORE_CODE"
                                }
                            });

                        }}
                        render={(props) => (
                            <PasswordReset {...props} loading={loading} error={error}/>
                        )}
                    />
                )}
            </Mutation>)
    }
}

export default withApollo(PasswordResetPage)
