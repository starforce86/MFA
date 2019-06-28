/**
 * Show all videos from category
 */
import React from "react";
import Category from "../src/modules/category";
import {withAuthSync} from "../src/util/auth";

export default withAuthSync(class extends React.Component {
    static getInitialProps({query: {id}}) {
        return {id};
    }

    render() {
        return <Category id={this.props.id}/>;
    }
})
