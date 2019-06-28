import React, {Component} from "react";
import {withApollo} from "react-apollo";
import logger from "../../util/logger";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit, faSave} from '@fortawesome/free-solid-svg-icons'
import * as moment from 'moment';
import * as _ from 'lodash';
import SubscribePlan from "../../components/stripe/SubscribePlan";
import gql from "graphql-tag";

const log = logger('PaymentInfo');

const ChangeCardMutation = gql`
    mutation changeCard($newStripeTokToken: String!) {
        changeCard(
            newStripeTokToken: $newStripeTokToken
        )
    }
`;

class PaymentInfo extends Component {
    state = {
        edit: false
    };

    handleEdit = () => {
        this.setState({edit: true})
    };

    handleSave = async () => {
        if (!this.getTokenFn) return;
        try {
            const token = await this.getTokenFn();
            if (!token) return;
            const res = await this.props.client.mutate({
                mutation: ChangeCardMutation,
                variables: {
                    newStripeTokToken: token.id
                }
            });
            if(res) {
                this.props.user.last4 = token.card.last4;
                this.setState({edit: false});
            }
        } catch (error) {
            log.trace(error);
        }
    };

    render() {
        const paymentDay = moment.unix(
            parseInt(_.get(this, 'props.user.stripe_subsciption_json.current_period_end', 0))
        ).format("YYYY-MM-DD HH:mm");
        return (
            <>
                <div style={{display: "flex"}}>
                    <h6>Payment info</h6>
                    <FontAwesomeIcon onClick={this.state.edit ? this.handleSave : this.handleEdit}
                                     style={{cursor: "pointer", margin: "2px", marginLeft: "8px"}} color="white"
                                     icon={this.state.edit ? faSave : faEdit}/>
                </div>
                {this.state.edit ?
                    (
                        <div style={{width: "400px", marginBottom: "1rem"}}>
                            <SubscribePlan getToken={fn => this.getTokenFn = fn}/>
                        </div>
                    ) :
                    (<>
                        <p><b>Next auto-payment: </b>{this.props.user.billing_subscription_active ? paymentDay : "Inactive"}</p>
                        {this.props.user.last4 ? <p><b>Card №:</b> **** **** **** {this.props.user.last4}</p> : null}
                    </>)
                }
            </>
        );
    }
}


export default (withApollo(PaymentInfo));
