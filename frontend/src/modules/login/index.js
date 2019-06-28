import React from "react";
import {Formik} from "formik";
import * as Yup from "yup";
import {login} from "../../util/auth";
import Login from "./Login";
import {Mutation, withApollo} from "react-apollo";
import gql from "graphql-tag";
import logger from "../../util/logger";

const log = logger('Login');
const emptyForm = {
    password: "",
    email: ""
};
const formInputs = {
    email: "email",
    password: "password"
};
const validationSchema = Yup.object().shape({
    [formInputs.email]: Yup.string()
        .trim()
        .email("Email format is not correct.")
        .required("This field is required."),
    [formInputs.password]: Yup.string()
        .min(3, "Password must be at least 3 characters.")
        .required("This field is required.")
});

const SIGN_IN = gql`
    mutation AuthSignInFormMutation($email: String!, $password: String!) {
        sign_in(email: $email, password: $password) {
            user {
                email
                username
                lastname
                firstname
                avatar
                id
                billing_subscription_active
                my_subscription_users {
                    id
                    avatar
                    username
                    lastname
                    firstname
                }
            }
            token
        }
    }
`;

const LoginPage = () => (
    <Mutation
        mutation={SIGN_IN}
        onCompleted={async data => {
           // log.trace("onCompleted", data);
            const {user, token} = data.sign_in;
            await login({user, token});
        }}
    >
        {(submitMutation, {loading, error}) => (
            <Formik
                initialValues={emptyForm}
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    try {
                        await submitMutation({
                            variables: {
                                email: values.email.toLowerCase(),
                                password: values.password
                            }
                        });
                    }
                    catch (e) {
                        log.trace(e);
                    }
                }}
                render={formikProps => (
                    <Login {...formikProps} error={error} loading={loading}/>
                )}
            />
        )}
    </Mutation>
);
export default withApollo(LoginPage);
