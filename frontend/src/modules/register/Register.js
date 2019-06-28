import React from "react";
import Head from "next/head";
import Link from "next/link";
import {ErrorMessage} from "formik";
import {injectStripe} from "react-stripe-elements";
import PlanSelector from "../../components/stripe/PlanSelector";
import SubscribePlan from "../../components/stripe/SubscribePlan";

import logger from "../../util/logger";

const log = logger('Payment');

class Register extends React.Component {

    state = {
        plan: "MONTHLY"
    };

    getTokenFn = null;

    submitForm = async () => {
        if (!this.getTokenFn) {
            return log.error('getTokenFn is not a function!')
        }
        try {
            const token = await this.getTokenFn();
            log.debug({getTokenFn: this.getTokenFn, token});
            if (!token) return;
            this.props.handleChange("token")(token.id);
            this.props.handleChange("plan")(this.state.plan);
            this.props.submitForm();
        } catch (error) {
            log.error('submitForm err:', error);
            alert(error.message);
        }
    };

    onSelectPlan = (value) => {
        this.setState({plan: value})
    };

    render() {
        return (
            <>
                <Head>
                    <meta charset="utf-8"/>
                    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, shrink-to-fit=no"
                    />
                    <link rel="icon" type="image/png" href="/static/img/favicon.png"/>
                    <link
                        href="/static/vendor/bootstrap/css/bootstrap.min.css"
                        rel="stylesheet"
                    />
                    <link
                        href="/static/vendor/fontawesome-free/css/all.min.css"
                        rel="stylesheet"
                        type="text/css"
                    />
                    <link href="/static/css/osahan.css" rel="stylesheet"/>
                    <link
                        rel="stylesheet"
                        href="/static/vendor/owl-carousel/owl.carousel.css"
                    />
                    <link rel="stylesheet" href="/static/vendor/owl-carousel/owl.theme.css"/>
                    <title>Register</title>

                    <script src="/static/vendor/jquery/jquery.min.js"/>
                    <script src="/static/vendor/bootstrap/js/bootstrap.bundle.min.js"/>
                    <script src="/static/vendor/jquery-easing/jquery.easing.min.js"/>
                    <script src="/static/vendor/owl-carousel/owl.carousel.js"/>
                    <script src="/static/js/custom.js"/>
                </Head>
                <body className="login-main-body">
                <section className="login-main-wrapper">
                    <div className="container-fluid pl-0 pr-0">
                        <div className="row no-gutters">
                            <div className="col-md-12 p-5 bg-white full-height">
                                <div className="login-main-left">
                                    <div className="text-center mb-5 login-main-left-header pt-4">
                                        <img
                                            // src="/static/img/favicon.png"
                                            src="/static/assets/img/Logo.png"
                                            className="img-favicon img-fluid"
                                            alt="LOGO"
                                        />
                                        <h5 className="mt-3 mb-3">Welcome to Made For Artists</h5>
                                        <p>
                                            At $29.99/mo or $300.00/yr, you will gain complete access to our growing
                                            video library!
                                            <br/>

                                        </p>
                                        <>
                                            {/*<div className="form-group">*/}
                                            {/*<label>Name</label>*/}
                                            {/*<input type="text" className="form-control" placeholder="Enter name"*/}
                                            {/*onChange={this.props.handleChange('name')}*/}
                                            {/*value={this.props.values.name}/>*/}
                                            {/*</div>*/}
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input
                                                    type="text"
                                                    style={{color: "#FFFFFF"}}
                                                    className="form-control"
                                                    placeholder="Enter email"
                                                    onChange={this.props.handleChange("email")}
                                                    value={this.props.values.email}
                                                />
                                                <ErrorMessage
                                                    style={{color: "#FF0000"}}
                                                    name="email"
                                                    component="div"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <input
                                                    type="password"
                                                    style={{color: "#FFFFFF"}}
                                                    className="form-control"
                                                    placeholder="Password"
                                                    onChange={this.props.handleChange("password")}
                                                    value={this.props.values.password}
                                                />
                                                <ErrorMessage
                                                    style={{color: "#FF0000"}}
                                                    name="password"
                                                    component="div"
                                                />
                                                <input
                                                    type="password"
                                                    style={{color: "#FFFFFF"}}
                                                    className="form-control"
                                                    placeholder="Confirm password"
                                                    onChange={this.props.handleChange("confirmPassword")}
                                                    value={this.props.values.confirmPassword}
                                                />
                                                <ErrorMessage
                                                    style={{color: "#FF0000"}}
                                                    name="confirmPassword"
                                                    component="div"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input
                                                    type="text"
                                                    style={{color: "#FFFFFF"}}
                                                    className="form-control"
                                                    placeholder="Firstname"
                                                    onChange={this.props.handleChange("firstname")}
                                                    value={this.props.values.firstname}
                                                />
                                                <ErrorMessage
                                                    style={{color: "#FF0000"}}
                                                    name="firstname"
                                                    component="div"
                                                />
                                                <input
                                                    type="text"
                                                    style={{color: "#FFFFFF"}}
                                                    className="form-control"
                                                    placeholder="Lastname"
                                                    onChange={this.props.handleChange("lastname")}
                                                    value={this.props.values.lastname}
                                                />
                                                <ErrorMessage
                                                    style={{color: "#FF0000"}}
                                                    name="lastname"
                                                    component="div"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone</label>
                                                <input
                                                    type="text"
                                                    style={{color: "#FFFFFF"}}
                                                    className="form-control"
                                                    placeholder="Phone"
                                                    onChange={this.props.handleChange("phone")}
                                                    value={this.props.values.phone}
                                                />
                                                <ErrorMessage
                                                    style={{color: "#FF0000"}}
                                                    name="phone"
                                                    component="div"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Card</label>
                                                <SubscribePlan getToken={fn => this.getTokenFn = fn}/>
                                            </div>
                                            <PlanSelector onChange={value => {
                                                this.setState({plan: value})
                                            }} value={this.state.plan}/>
                                            <div className="text-center mt-5">
                                                <p className="light-gray">
                                                    {this.props.error
                                                        ? this.props.error.graphQLErrors.map(({message}, i) => (
                                                            <a href="#" key={i}>
                                                                {message}
                                                            </a>
                                                        ))
                                                        : null}
                                                </p>
                                            </div>
                                            <div className="mt-4">
                                                <div className="row">
                                                    <div className="col-12">
                                                        <button
                                                            className="btn btn-outline-primary btn-block btn-lg"
                                                            onClick={this.submitForm}
                                                        >
                                                            {!this.props.loading ? "Sign Up" : "Registering"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                        <div className="text-center mt-1">
                                            <p className="light-gray">
                                                Already have an Account?{" "}
                                                <Link prefetch href="/login">Sign In</Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/*carusel*/}
                        </div>
                    </div>
                </section>
                </body>
            </>
        )
    }
}

Register.displayName = "Register";
export default injectStripe(Register);
