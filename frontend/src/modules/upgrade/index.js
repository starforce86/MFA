import React, {Component} from "react";
import UpgradeToPremium from "./UpgradeToPremium";
import {withApollo} from "react-apollo";

class UpgradeToPremiumPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <UpgradeToPremium {...this.props} />
    }
}

export default withApollo(UpgradeToPremiumPage);
