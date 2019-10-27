import React, {Component} from "react";
import logger from "../../util/logger";
import { Profit } from "../../components/profit";
import {withUser} from "../../util/auth";

const log = logger('Profit Sharing');

class ProfitPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return <Profit user={this.props.user} />
    }
}

export default withUser(ProfitPage);

