import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ErrorMessage } from "formik";
import { injectStripe } from "react-stripe-elements";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import Radio from '@material-ui/core/Radio';
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import { notification, DatePicker } from 'antd';
import 'antd/dist/antd.css';
import Dropzone from "react-dropzone";
import PlanSelector from "../../components/stripe/PlanSelector";
import SubscribePlan from "../../components/stripe/SubscribePlan";
import {API_URL} from "../../util/consts";

import logger from "../../util/logger";

const log = logger('Payment');

class Register extends React.Component {

    state = {
        plan: "MONTHLY",
        role: "USER_VIEWER",
        external_account_type: "BANK_ACCOUNT", // DEBIT_CARD
        // front_id_scan: "",
        // front_id_scan_uploading: false,
        // back_id_scan: "",
        // back_id_scan_uploading: false
    };

    theme = createMuiTheme({
        palette: {
            type: 'dark',
        },
    });

    getTokenFn = null;

    submitForm = async () => {
        if (this.state.role === "USER_VIEWER") {
            if (!this.getTokenFn) {
                return log.error('getTokenFn is not a function!')
            }
            try {
                const token = await this.getTokenFn();
                log.debug({ getTokenFn: this.getTokenFn, token });
                if (!token) return;
                this.props.handleChange("token")(token.id);
                this.props.handleChange("plan")(this.state.plan);
                this.props.submitForm();
            } catch (error) {
                console.log('submitForm err:', error);
                notification['error']({
                    message: 'Error!',
                    description: error.message,
                });
            }
        }
        else {
            this.props.submitForm();
        }
    };

    // async uploadIDFile(file, type) {
    //     const formData = new FormData();
    //     formData.append('token', this.props.token);
    //     let res;
    //     if (type == "back") {
    //         formData.append('backIDScan', file);
    //         res = await (await fetch(`${API_URL}/user/backIDScan`, {
    //             method: 'POST',
    //             body: formData
    //         })).json();
    //     } else {
    //         formData.append('frontIDScan', file);
    //         res = await (await fetch(`${API_URL}/user/frontIDScan`, {
    //             method: 'POST',
    //             body: formData
    //         })).json();
    //     }

    //     log.error('res', res);
    //     return res.file_url;
    // }

    onSelectPlan = (value) => {
        this.setState({ plan: value })
    };

    onSignUpTypeChange = (value) => {
        this.setState({ role: value })
        this.props.setFieldValue("role", value)
    }

    onExternalAccountTypeChange = (value) => {
        this.setState({ external_account_type: value })
        this.props.setFieldValue("external_account_type", value)
    }

    render() {
        return (
            <>
                <Head>
                    <meta charset="utf-8" />
                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, shrink-to-fit=no"
                    />
                    <link rel="icon" type="image/png" href="/static/img/favicon.png" />
                    <link
                        href="/static/vendor/bootstrap/css/bootstrap.min.css"
                        rel="stylesheet"
                    />
                    <link
                        href="/static/vendor/fontawesome-free/css/all.min.css"
                        rel="stylesheet"
                        type="text/css"
                    />
                    <link href="/static/css/osahan.css" rel="stylesheet" />
                    <link
                        rel="stylesheet"
                        href="/static/vendor/owl-carousel/owl.carousel.css"
                    />
                    <link rel="stylesheet" href="/static/vendor/owl-carousel/owl.theme.css" />
                    <title>Register</title>

                    <script src="/static/vendor/jquery/jquery.min.js" />
                    <script src="/static/vendor/bootstrap/js/bootstrap.bundle.min.js" />
                    <script src="/static/vendor/jquery-easing/jquery.easing.min.js" />
                    <script src="/static/vendor/owl-carousel/owl.carousel.js" />
                    <script src="/static/js/custom.js" />
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
                                            <br />

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
                                                        style={{ color: "#FFFFFF" }}
                                                        className="form-control"
                                                        placeholder="Enter email"
                                                        onChange={this.props.handleChange("email")}
                                                        value={this.props.values.email}
                                                    />
                                                    <ErrorMessage
                                                        style={{ color: "#FF0000" }}
                                                        name="email"
                                                        component="div"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Password</label>
                                                    <input
                                                        type="password"
                                                        style={{ color: "#FFFFFF" }}
                                                        className="form-control"
                                                        placeholder="Password"
                                                        onChange={this.props.handleChange("password")}
                                                        value={this.props.values.password}
                                                    />
                                                    <ErrorMessage
                                                        style={{ color: "#FF0000" }}
                                                        name="password"
                                                        component="div"
                                                    />
                                                    <input
                                                        type="password"
                                                        style={{ color: "#FFFFFF" }}
                                                        className="form-control"
                                                        placeholder="Confirm password"
                                                        onChange={this.props.handleChange("confirmPassword")}
                                                        value={this.props.values.confirmPassword}
                                                    />
                                                    <ErrorMessage
                                                        style={{ color: "#FF0000" }}
                                                        name="confirmPassword"
                                                        component="div"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Name</label>
                                                    <input
                                                        type="text"
                                                        style={{ color: "#FFFFFF" }}
                                                        className="form-control"
                                                        placeholder="Firstname"
                                                        onChange={this.props.handleChange("firstname")}
                                                        value={this.props.values.firstname}
                                                    />
                                                    <ErrorMessage
                                                        style={{ color: "#FF0000" }}
                                                        name="firstname"
                                                        component="div"
                                                    />
                                                    <input
                                                        type="text"
                                                        style={{ color: "#FFFFFF" }}
                                                        className="form-control"
                                                        placeholder="Lastname"
                                                        onChange={this.props.handleChange("lastname")}
                                                        value={this.props.values.lastname}
                                                    />
                                                    <ErrorMessage
                                                        style={{ color: "#FF0000" }}
                                                        name="lastname"
                                                        component="div"
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone</label>
                                                    <input
                                                        type="text"
                                                        style={{ color: "#FFFFFF" }}
                                                        className="form-control"
                                                        placeholder="Phone"
                                                        onChange={this.props.handleChange("phone")}
                                                        value={this.props.values.phone}
                                                    />
                                                    <ErrorMessage
                                                        style={{ color: "#FF0000" }}
                                                        name="phone"
                                                        component="div"
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>Signup as a Artist or Subscriber?</label>
                                                    <MuiThemeProvider theme={this.theme}>
                                                        <RadioGroup
                                                            aria-label="signup-type"
                                                            style={{ justifyContent: "center", alignItems: "center" }}
                                                            value={this.state.role}
                                                            onChange={(_, value) => {
                                                                this.onSignUpTypeChange(value);
                                                            }}
                                                        >
                                                            <FormControlLabel value="USER_VIEWER" style={{ width: 150, height: 40 }}
                                                                control={<Radio
                                                                    checked={this.state.role === "USER_VIEWER"} />}
                                                                label="Subscriber" />
                                                            <FormControlLabel value="USER_PUBLISHER" style={{ width: 150, height: 40 }}
                                                                control={<Radio
                                                                    checked={this.state.role === "USER_PUBLISHER"} />}
                                                                label="Artist" />
                                                        </RadioGroup>
                                                    </MuiThemeProvider>
                                                </div>

                                                {this.state.role === "USER_VIEWER" && (
                                                    <React.Fragment>
                                                        <div className="form-group">
                                                            <label>Promo Code</label>
                                                            <input
                                                                type="text"
                                                                style={{ color: "#FFFFFF" }}
                                                                className="form-control"
                                                                placeholder="Promo code"
                                                                onChange={this.props.handleChange("promo_code")}
                                                                value={this.props.values.promo_code}
                                                            />
                                                        </div>
                                                    </React.Fragment>
                                                )}

                                                {this.state.role === "USER_PUBLISHER" && (
                                                    <React.Fragment>
                                                        <div className="form-group">
                                                            <label>Register your Bank account or Debit card to payout?</label>
                                                            <MuiThemeProvider theme={this.theme}>
                                                                <RadioGroup
                                                                    aria-label="external-account"
                                                                    style={{ justifyContent: "center", alignItems: "center" }}
                                                                    value={this.state.external_account_type}
                                                                    onChange={(_, value) => {
                                                                        this.onExternalAccountTypeChange(value);
                                                                    }}
                                                                >
                                                                    <FormControlLabel value="BANK_ACCOUNT" style={{ width: 150, height: 40 }}
                                                                        control={<Radio
                                                                            checked={this.state.external_account_type === "BANK_ACCOUNT"} />}
                                                                        label="Bank account" />
                                                                    <FormControlLabel value="DEBIT_CARD" style={{ width: 150, height: 40 }}
                                                                        control={<Radio
                                                                            checked={this.state.external_account_type === "DEBIT_CARD"} />}
                                                                        label="Debit card" />
                                                                </RadioGroup>
                                                            </MuiThemeProvider>
                                                        </div>
                                                        {this.state.external_account_type === "BANK_ACCOUNT" && (
                                                            <React.Fragment>
                                                                <div className="form-group">
                                                                    <label>Bank Information</label>
                                                                    <input
                                                                        type="text"
                                                                        style={{ color: "#FFFFFF" }}
                                                                        className="form-control"
                                                                        placeholder="Account Number"
                                                                        onChange={this.props.handleChange("account_number")}
                                                                        value={this.props.values.account_number}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        style={{ color: "#FFFFFF" }}
                                                                        className="form-control"
                                                                        placeholder="Routing Number"
                                                                        onChange={this.props.handleChange("routing_number")}
                                                                        value={this.props.values.routing_number}
                                                                    />
                                                                </div>
                                                            </React.Fragment>
                                                        )}
                                                        
                                                    </React.Fragment>
                                                )}

                                                {(this.state.role === "USER_VIEWER" || (this.state.role === "USER_PUBLISHER" && this.state.external_account_type === "DEBIT_CARD")) && (
                                                    <div className="form-group">
                                                        <label>Card</label>
                                                        <SubscribePlan getToken={fn => this.getTokenFn = fn} />
                                                    </div>
                                                )}

                                                {this.state.role === "USER_VIEWER" && (
                                                    <PlanSelector onChange={value => {
                                                        this.setState({ plan: value })
                                                    }} value={this.state.plan} />
                                                )}

                                                {this.state.role === "USER_PUBLISHER" && (
                                                    <React.Fragment>
                                                        <div className="form-group">
                                                            <label>Birthdate</label>
                                                            <DatePicker
                                                                className="form-control"
                                                                onChange={this.props.handleChange("birthdate")}
                                                            />
                                                        </div>
                                                        {/* <div className="form-group">
                                                            <label>Verify SSN or ID document scan?</label>
                                                            <MuiThemeProvider theme={this.theme}>
                                                                <RadioGroup
                                                                    aria-label="verification_type"
                                                                    style={{ justifyContent: "center", alignItems: "center" }}
                                                                    value={this.state.verification_type}
                                                                    onChange={(_, value) => {
                                                                        this.onVerificationTypeChange(value);
                                                                    }}
                                                                >
                                                                    <FormControlLabel value="SSN" style={{ width: 175, height: 40 }}
                                                                        control={<Radio
                                                                            checked={this.state.verification_type === "SSN"} />}
                                                                        label="SSN" />
                                                                    <FormControlLabel value="ID_DOCUMENT" style={{ width: 175, height: 40 }}
                                                                        control={<Radio
                                                                            checked={this.state.verification_type === "ID_DOCUMENT"} />}
                                                                        label="ID document scan" />
                                                                </RadioGroup>
                                                            </MuiThemeProvider>
                                                        </div> */}
                                                        <div className="form-group">
                                                            <label>SSN</label>
                                                            <input
                                                                type="text"
                                                                style={{ color: "#FFFFFF" }}
                                                                className="form-control"
                                                                placeholder="Last four digits of your Social Security Number"
                                                                onChange={this.props.handleChange("ssn")}
                                                                value={this.props.values.ssn}
                                                            />
                                                        </div>
                                                        {/* <React.Fragment>
                                                            <label>Front of ID document scan</label>
                                                            <Dropzone
                                                                accept={'image/*'}
                                                                onDrop={async (files) => {
                                                                    if (files[0].size > 10 * 1024 * 1024) {
                                                                        notification['error']({
                                                                            message: 'Error!',
                                                                            description: 'The ID document scan image file should not be more than 10MB',
                                                                        });
                                                                        return;
                                                                    }
                                                                    this.setState({
                                                                        front_id_scan_uploading: true,
                                                                    })
                                                                    const res = await this.uploadIDFile(files[0], "front");
                                                                    this.setState({
                                                                        front_id_scan_uploading: false,
                                                                    })
                                                                    if (res.success) {
                                                                        this.setState({
                                                                            front_id_scan: res
                                                                        });
                                                                    } else {
                                                                        notification['error']({
                                                                            message: 'Error!',
                                                                            description: res.msg,
                                                                        });
                                                                    }
                                                                }}>
                                                                {({ getRootProps, getInputProps }) => (
                                                                    <section>
                                                                        {!this.state.front_id_scan_uploading
                                                                            ? (
                                                                                <div
                                                                                    {...getRootProps()}
                                                                                    style={{
                                                                                        textAlign: "center",
                                                                                        marginLeft: "auto",
                                                                                        marginRight: "auto"
                                                                                    }}
                                                                                >
                                                                                    <br />
                                                                                    <input {...getInputProps()} />
                                                                                    {this.state.front_id_scan && (
                                                                                        <img
                                                                                            width={'100%'}
                                                                                            src={this.state.front_id_scan ? this.state.front_id_scan : ""}
                                                                                            alt=''
                                                                                        />
                                                                                    )}
                                                                                    <br />
                                                                                    <br />
                                                                                    <p>Drag & drop back of ID document scan here, or click to select file</p>
                                                                                    <br />
                                                                                </div>
                                                                            )
                                                                            : (
                                                                                <div style={{ width: "400px", textAlign: 'center' }}><CircularProgress color="secondary" /></div>
                                                                            )
                                                                        }
                                                                    </section>
                                                                )}
                                                            </Dropzone>
                                                        </React.Fragment> */}
                                                    </React.Fragment>
                                                )}
                                                
                                                <div className="text-center mt-5">
                                                    <p className="light-gray">
                                                        {this.props.error
                                                            ? this.props.error.graphQLErrors.map(({ message }, i) => (
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
