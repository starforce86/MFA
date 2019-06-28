import React from "react";
import Head from "next/head";
import Link from "next/link";

const Login = props => (
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
            <title>Login</title>

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
                                    <br/>
                                </p>
                                <>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter email"
                                            style={{color: "#FFFFFF"}}
                                            onChange={props.handleChange("email")}
                                            value={props.values.email}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Password"
                                            style={{color: "#FFFFFF"}}
                                            onChange={props.handleChange("password")}
                                            value={props.values.password}
                                        />
                                    </div>
                                    <div className="text-center mt-5">
                                        <p className="light-gray" style={{height: "13px"}}>
                                            {props.error ? (<p style={{color: "rgb(255, 0, 0)"}}>{props.error.graphQLErrors[0].message}</p>) : null}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <div className="row">
                                            <div className="col-12">
                                                <button
                                                    className="btn btn-outline-primary btn-block btn-lg"
                                                    type="submit"
                                                    onClick={props.handleSubmit}
                                                >
                                                    {/*{!props.loading ? "Sign In" : "Logging in"}*/}
                                                    Sign In
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                                <div className="text-center mt-5">
                                    <p className="light-gray">
                                        Don’t have an account?{" "}
                                        <Link prefetch href="/register"><a>Sign Up</a></Link>
                                        <br/><Link prefetch href="/forgotPassword"><a>Forgot Password</a></Link>
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
);
Login.displayName = "Login";
export default Login;
