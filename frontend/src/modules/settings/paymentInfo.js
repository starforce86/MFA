import React, {Component} from "react";
import {withApollo} from "react-apollo";
import logger from "../../util/logger";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEdit, faSave, faWindowClose} from '@fortawesome/free-solid-svg-icons';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as moment from 'moment';
import * as _ from 'lodash';
import SubscribePlan from "../../components/stripe/SubscribePlan";
import gql from "graphql-tag";
import PlanSelector from "../../components/stripe/PlanSelector";


const log = logger('PaymentInfo');

const ChangeCardMutation = gql`
    mutation changeCard($newStripeTokToken: String!) {
        changeCard(
            newStripeTokToken: $newStripeTokToken
        )
    }
`;

const PURCHASE = gql`
    mutation purchase($token: String!, $plan: StripePlan!) {
        purchase(stripe_tok_token: $token, plan: $plan)
    }
`;

class PaymentInfo extends Component {
    state = {
        edit: false,
        plan: 'MONTHLY',
        inProgress: false,
    };

    handleEdit = () => {
        this.setState({edit: true})
    };

    handleCancel = () => {
        this.setState({edit: false})
    };

    handleSave = async () => {
        if (!this.getTokenFn) return;
        try {
            const token = await this.getTokenFn();
            if (!token) return;
            if (this.props.user.billing_subscription_active) {
                this.setState({inProgress: true});
                const res = await this.props.client.mutate({
                    mutation: ChangeCardMutation,
                    variables: {
                        newStripeTokToken: token.id
                    }
                });
                this.setState({inProgress: false});
                if(res) {
                    this.props.user.last4 = token.card.last4;
                    this.setState({edit: false});
                }
            } else {
                this.setState({inProgress: true});
                const res = await this.props.client.mutate({
                    mutation: PURCHASE,
                    variables: {
                        token: token.id,
                        plan: this.state.plan
                    }
                });
                this.setState({inProgress: false});
                if(res) {
                    location.reload();
                }
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
                <div style={{ display: "flex", paddingTop: 10 }}>
                    <h6>Payment info</h6>
                    {this.state.edit
                        ? <React.Fragment>
                            <FontAwesomeIcon onClick={this.handleSave}
                                style={{ cursor: "pointer", margin: "2px", marginLeft: "8px" }} color="white"
                                icon={faSave} />
                            <FontAwesomeIcon onClick={this.handleCancel}
                                style={{ cursor: "pointer", margin: "2px", marginLeft: "8px" }} color="white"
                                icon={faWindowClose} />
                        </React.Fragment>
                        : <FontAwesomeIcon onClick={this.handleEdit}
                            style={{ cursor: "pointer", margin: "2px", marginLeft: "8px" }} color="white"
                            icon={faEdit} />}
                </div>
                {this.state.edit && !this.state.inProgress ?
                    (
                        <div style={{width: "400px", marginBottom: "1rem"}}>
                            <SubscribePlan getToken={fn => this.getTokenFn = fn}/>
                            {!this.props.user.billing_subscription_active && 
                            <PlanSelector onChange={value => this.setState({plan: value})} value={this.state.plan}/>}
                        </div>
                    ) :
                    (<>
                        <p><b>Next auto-payment: </b>{this.props.user.billing_subscription_active ? paymentDay : "Inactive"}</p>
                        {this.props.user.last4 ? <p><b>Card №:</b> **** **** **** {this.props.user.last4}</p> : null}
                    </>)
                }
                {this.state.inProgress && <div style={{ width: "400px", textAlign: 'center' }}><CircularProgress color="secondary" /></div>}
            </>
        );
    }
}


export default (withApollo(PaymentInfo));
