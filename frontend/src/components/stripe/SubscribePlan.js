import React from "react";
import {STRIPE_KEY} from "../../util/consts";
import {CardElement, injectStripe} from "react-stripe-elements";

class SubscribePlan extends React.Component {

    state = {
        strip: null
    };

    componentDidMount() {
        this.setState({stripe: window.Stripe(STRIPE_KEY)});
        this.props.getToken(this.getToken)
    }

    getToken = async () => {
        const res = await this.props.stripe.createToken();
        if (res.error) throw res.error;
        else return !res.token ? null : res.token;
    };

    render() {
        return (
            <>
                <div className="card-element">
                    <CardElement onReady={this.onReady}
                        hidePostalCode
                        className="form-control border-form-control"
                        style={{
                            base: {
                                iconColor: "#fff",
                                color: '#FFFFFF',
                                '::placeholder': {
                                    color: "#616268"
                                }
                            }
                        }}
                        ref={el => this.card = el} />
                </div>
            </>
        )
    }
}


export default injectStripe(SubscribePlan);


