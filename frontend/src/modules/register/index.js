import React from "react";
import {Formik} from "formik";
import * as Yup from "yup";
import { withRouter } from "next/router";
import { notification } from 'antd';
import 'antd/dist/antd.css';
import {register} from "../../util/auth";
import Register from "./Register";
import {Mutation, withApollo} from "react-apollo";
import gql from "graphql-tag";
import logger from "../../util/logger";
import {Elements, StripeProvider} from "react-stripe-elements";
import {STRIPE_KEY} from "../../util/consts";
import {withUser} from "../../util/auth";

const log = logger('Register');

const emptyForm = {
    password: "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    confirmPassword: "",
    role: "USER_VIEWER",
    promo_code: "",
    external_account_type: "BANK_ACCOUNT",
    account_number: "",
    routing_number: "",
    token: "",
    birthdate: "",
    ssn: ""
};

const formInputs = {
    email: "email",
    firstname: "firstname",
    lastname: "lastname",
    phone: "phone",
    password: "password",
    confirmPassword: "confirmPassword",
    token: "token"
};

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
const validationSchema = Yup.object().shape({
    [formInputs.email]: Yup.string()
        .trim()
        .email("Email format is not correct.")
        .required("This field is required."),
    [formInputs.firstname]: Yup.string()
        .trim()
        .required("This field is required."),
    [formInputs.lastname]: Yup.string()
        .trim()
        .required("This field is required."),
    [formInputs.phone]: Yup.string()
        .trim()
        .matches(phoneRegExp, 'Phone number is not valid')
        .required("This field is required."),
    [formInputs.password]: Yup.string()
        .min(3, "Password must be at least 3 characters.")
        .required("This field is required."),
    [formInputs.confirmPassword]: Yup.string()
        .min(3, "Name must be at least 3 characters.")
        .required("This field is required.")
        .oneOf([Yup.ref('password'), null], "Password should be identical")
    // [formInputs.token]: Yup.string().required("Token is required")
});

const SIGN_UP = gql`
    mutation AuthSignUpFormMutation(
        $email: String!, 
        $firstname: String!, 
        $lastname: String!, 
        $phone: String!, 
        $password: String!, 
        $role: UserRole, 
        $promo_code: String,
        $external_account_type: String,
        $account_number: String,
        $routing_number: String,
        $token: String,
        $birthdate: String,
        $ssn: String
    ) {
        sign_up(
            email: $email, 
            firstname: $firstname, 
            lastname: $lastname, 
            phone: $phone, 
            password: $password, 
            role: $role, 
            promo_code: $promo_code, 
            step: CHECK_ACTIVATION_CODE,
            external_account_type: $external_account_type,
            account_number: $account_number,
            routing_number: $routing_number,
            token: $token,
            birthdate: $birthdate,
            ssn: $ssn
        ) {
            status
            user {
                id
                email
                avatar
                username
            }
            token
        }
    }
`;

const PURCHASE = gql`
    mutation Purchase($token: String!, $plan: StripePlan!) {
        purchase(stripe_tok_token: $token, plan: $plan)
    }
`;


class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {stripe: null};
    }

    componentDidMount() {
        this.setState({stripe: window.Stripe(STRIPE_KEY)});
    }

    render() {
        return (
            <Mutation
                mutation={SIGN_UP}
                onCompleted={async data => {
                    const {user, token} = data.sign_up;
                    await register({user, token});
                }}
            >
                {(submitMutation, {loading, error}) => (
                    <Formik
                        initialValues={
                            {
                                ...emptyForm,
                                promo_code: this.props.router.query.promo_code
                            }
                        }
                        validationSchema={validationSchema}
                        onSubmit={async values => {

                            try {
                                const result = await submitMutation({
                                    variables: {
                                        email: values.email.toLowerCase(),
                                        firstname: values.firstname,
                                        lastname: values.lastname,
                                        phone: values.phone,
                                        password: values.password,
                                        role: values.role,
                                        promo_code: values.promo_code,
                                        external_account_type: values.external_account_type,
                                        account_number: values.account_number,
                                        routing_number: values.routing_number,
                                        token: values.token,
                                        birthdate: values.birthdate,
                                        ssn: values.ssn
                                    }
                                });
                                if (!result.data) {
                                    return false;
                                }
                                if (result.errors) {
                                    log.trace({result});
                                    return false;
                                }
                            } catch (error) {
                                log.trace(error);
                                return false;
                            }

                            if (values.role === "USER_VIEWER") {
                                try {
                                    const purchaseResult = await this.props.client.mutate({
                                        mutation: PURCHASE,
                                        variables: {token: values.token, plan: values.plan}
                                    });
    
                                    if (purchaseResult.errors) {
                                        log.trace({purchaseResult});
                                        // alert(JSON.stringify(purchaseResult));
                                        notification['error']({
                                            message: 'Error!',
                                            description: JSON.stringify(purchaseResult),
                                        });
                                        return false;
                                    }
                                    log.trace({purchaseResult});
                                } catch (error) {
                                    log.trace(error);
                                    // alert(JSON.stringify(error));
                                    notification['error']({
                                        message: 'Error!',
                                        description: JSON.stringify(error),
                                    });
                                    return false;
                                }
                            }
                            
                        }}
                        render={formikProps => (
                            <StripeProvider stripe={this.state.stripe}>
                                <Elements>
                                    <Register {...formikProps} error={error} loading={loading}/>
                                </Elements>
                            </StripeProvider>
                        )}
                    />
                )}
            </Mutation>
        )
    }
}

export default withRouter(withUser(withApollo(RegisterPage)));
