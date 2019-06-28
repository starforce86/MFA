import React, {Component} from 'react';
import {CardElement, Elements, injectStripe, StripeProvider} from 'react-stripe-elements';
import * as consts from "../src/util/consts";

class _CardForm extends React.Component {
    render() {
        return (
            <div>
                <div className="radio"
                     style={{
                         color: "#fff"
                     }}>
                    <input id="1" type="radio"/> 1 month
                    <br/>
                    <input id="2" type="radio"/> 1 year
                    <br/>
                </div>
                <label style={{width: '50%'}}>
                    <CardElement
                        iconStyle="solid"
                        hidePostalCode
                        className="form-control border-form-control"
                        style={{
                            base: {
                                iconColor: "#fff",
                                fontSize: '18px',
                                color: '#FFFFFF',
                                '::placeholder': {
                                    color: "#ffffff"
                                }
                            }
                        }}
                    />
                </label>
                <br/>
                <button
                    className="btn btn-outline-danger"
                    onClick={() => this.props.stripe.createToken().then(payload => {
                        console.log({payload});
                        if (payload.token && payload.token.id) {
                            alert(`Success, token: ${payload.token.id}`);
                        } else {
                            alert(payload.error.message);
                        }
                    })}>Pay
                </button>
            </div>
        )
    }
}

const CardForm = injectStripe(_CardForm);

class Checkout extends React.Component {
    render() {
        return (
            <div className="Checkout" style={{
                textAlign: "center"
            }}>
                <h1>Purchase subscription</h1>
                <Elements>
                    <CardForm/>
                </Elements>
            </div>
        )
    }
}

class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {stripe: null};
    }

    componentDidMount() {
        this.setState({stripe: window.Stripe(consts.STRIPE_KEY)});
    }

    render() {
        return (
            <div id="wrapper">
                <div id="content-wrapper">
                    <div className="container-fluid">
                        <StripeProvider stripe={this.state.stripe}>
                            <Checkout/>
                        </StripeProvider>
                    </div>
                </div>
            </div>
        )
    }
}


export default Test;
