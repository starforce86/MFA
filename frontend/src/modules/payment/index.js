import React, {Component} from "react";
import Payment from "./Payment";
import {withApollo} from "react-apollo";

import logger from "../../util/logger";
import {withAuthSync} from "../../util/auth";

const log = logger('PaymentPage');


class PaymentPage extends Component {
    componentDidMount() {
        // if (!this.props.billing_subscription_active) {
        //     Router.push("/payment")
        // }
        // else {
        //     Router.push('/hacky', "/");
        // }
    }

    render() {
        //log.trace("Payment index.js props======", this.props);
        return (<Payment apolloClient={this.props.client} {...this.props}/>)
    }
}

export default withAuthSync(withApollo(PaymentPage));
