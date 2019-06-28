import {Elements, StripeProvider} from 'react-stripe-elements'

import CheckoutElement from './CheckoutElement'
import * as consts from "../../util/consts";

export default () =>
    <StripeProvider apiKey={consts.STRIPE_KEY}>
        <Elements>
            <CheckoutElement/>
        </Elements>
    </StripeProvider>
