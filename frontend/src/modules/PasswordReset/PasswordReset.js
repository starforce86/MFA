import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

const PasswordReset = (props) => <>

    <Head>
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        <link rel="icon" type="image/png" href="/static/img/favicon.png"/>
        <link href="/static/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
        <link href="/static/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css"/>
        <link href="/static/css/osahan.css" rel="stylesheet"/>
        <link rel="stylesheet" href="/static/vendor/owl-carousel/owl.carousel.css"/>
        <link rel="stylesheet" href="/static/vendor/owl-carousel/owl.theme.css"/>
        <title>Reset</title>

        <script src="/static/vendor/jquery/jquery.min.js"></script>
        <script src="/static/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="/static/vendor/jquery-easing/jquery.easing.min.js"></script>
        <script src="/static/vendor/owl-carousel/owl.carousel.js"></script>
        <script src="/static/js/custom.js"></script>


    </Head>
    <body className="login-main-body">
    <section className="login-main-wrapper">
        <div className="container-fluid pl-0 pr-0">
            <div className="row no-gutters">
                <div className="col-md-12 p-5 bg-white full-height">
                    <div className="login-main-left">
                        <div className="text-center mb-5 login-main-left-header pt-4">
                            <img src="/static/img/favicon.png" className="img-fluid" alt="LOGO"/>
                            <h5 className="mt-3 mb-3">Reset Password</h5>
                            <>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="text"
                                           className="form-control"
                                           placeholder="Enter email"
                                           style={{color: "#FFFFFF"}}
                                           onChange={props.handleChange('email')}
                                           value={props.values.email}/>
                                </div>

                                <div className="form-group">
                                    <label>Code</label>
                                    <input type="text"
                                           className="form-control"
                                           placeholder="Enter code"
                                           style={{color: "#FFFFFF"}}
                                           onChange={props.handleChange('code')}
                                           value={props.values.code}/>
                                </div>

                                <div className="form-group">
                                    <label>New password</label>
                                    <input type="password"
                                           className="form-control"
                                           style={{color: "#FFFFFF"}}
                                           onChange={props.handleChange('new_password')}
                                           value={props.values.new_password}/>
                                </div>

                                <div className="text-center mt-5">
                                    <p className="light-gray">

                                        {props.error
                                            ? props.error.graphQLErrors.map(({message}, i) => (
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
                                            <button className="btn btn-outline-primary btn-block btn-lg"

                                                    onClick={() => props.handleSubmit()}>
                                                {'Reset Password'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                            <div className="text-center mt-5">
                                <p className="light-gray">Don’t have an account? <Link prefetch href="/register">Sign
                                    Up</Link>
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
</>;
PasswordReset.displayName = 'PasswordReset';
export default PasswordReset
