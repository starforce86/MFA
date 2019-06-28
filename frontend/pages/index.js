import React from "react";
import {withAuthSync} from "../src/util/auth";
import Index from "../src/modules/home";
import nextCookie from "next-cookies";

const page = (props) => <Index {...props} />;

page.getInitialProps = (ctx) => {
    const {token} = nextCookie(ctx);
    const auth = token !== null && token !== undefined;
    return {auth}
};

export default withAuthSync(page)

