import React, {Component} from 'react'
import Payment from '../src/modules/payment'
import {withAuthSync} from "../src/util/auth";

class PaymentPage extends Component {
    render() {
        return (<Payment {...this.props}/>)
    }
}

export default withAuthSync(PaymentPage)