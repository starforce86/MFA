import React, {Component} from "react";
import logger from "../../util/logger";
import Profit from "../../components/profit/Profit";
import {withUser} from "../../util/auth";

const log = logger('Profit Sharing');

class ProfitPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            this.props.user && this.props.user.role == 'ADMIN' ?
                <Profit user={this.props.user} />
                : ''
        );
    }
}

export default withUser(ProfitPage);

