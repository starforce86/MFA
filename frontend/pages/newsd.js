import React from "react";
import NewsDetailPage from "../src/modules/newsd";
import {withAuthSync} from "../src/util/auth";

export default withAuthSync(class extends React.Component {
    static getInitialProps({query: {id}}) {
        return {id};
    }

    render() {
        return <NewsDetailPage id={this.props.id}/>;
    }
})
