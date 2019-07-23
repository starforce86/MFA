import React, {Component} from "react";
import logger from "../../util/logger";
import { ArtistAnalytics, AdminAnalytics } from "../../components/analytics";
import {withUser} from "../../util/auth";

const log = logger('Analytics');

class AnalyticsPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return this.props.user.role == 'ADMIN'
            ? <AdminAnalytics user={this.props.user} />
            : (this.props.user.role == 'USER_PUBLISHER'
                ? <ArtistAnalytics user={this.props.user} />
                : '')
    }
}

export default withUser(AnalyticsPage);

