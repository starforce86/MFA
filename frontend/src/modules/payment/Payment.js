import React from "react";
import Head from "next/head";
import StripeCheckout from "react-stripe-checkout";
import gql from "graphql-tag";
import Router from "next/router"
import logger from "../../util/logger";
import * as consts from "../../util/consts";

const log = logger('Payment');

class Payment extends React.Component {
    constructor(props) {
        super(props);
        this.strip = React.createRef();
    }

    render() {
        const {apolloClient} = this.props;
        //log.trace("props", this.props);
        return (
            <>
                <Head>
                    <title>Payment</title>
                </Head>
                <div id="content-wrapper">
                    <div className="container-fluid pb-0">
                        <div className="text-center mb-5 login-main-left-header pt-4">
                            <img
                                src="/static/img/favicon.png"
                                className="img-fluid"
                                alt="LOGO"
                            />
                            <p>To join made for artists and gain access to our complete, and
                                ever-growing video library, press subscribe below and follow
                                the instructions.</p>
                            <p>By checking the button below, you agree to our Terms of Use,
                                Privacy Statement, and that you are over 18. The service
                                will automatically continue your membership monthly until
                                you cancel.</p>

                            <div className="mt-4">
                                <div className="row">
                                    <div className="col-12">
                                        <a href="#" data-toggle="modal" data-target="#paymentModal">
                                            <button
                                                className="btn btn-outline-primary btn-block btn-lg"
                                                onClick={() => {
                                                    // log.trace(this.strip);
                                                    this.strip.current.onClick()

                                                }}
                                            >
                                                Pay
                                            </button>
                                        </a>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                    <a hidden="hidden">
                        <StripeCheckout
                            ref={this.strip}
                            token={token => {
                                log.trace('strip', token);
                                apolloClient
                                    .mutate({
                                        mutation: gql`
                    mutation PURCHASESMutation($stripe_tok_token: String!) {
                      purchase(plan:MONTHLY, stripe_tok_token: $stripe_tok_token)
                    }
                  `,
                                        variables: {
                                            stripe_tok_token: token.id,
                                        }
                                    })
                                    .then(res => {
                                        Router.push('/hacky', "/");
                                    })
                            }}
                            stripeKey={consts.STRIPE_KEY}
                        />
                    </a>

                </div>
            </>
        )
    }
}

Payment.displayName = "Payment";
export default Payment;
