import React from "react";
import nextCookie from "next-cookies";
import MyVideo from "../src/modules/myVideo";
import {withAuthSync} from "../src/util/auth";

const page = props => <MyVideo {...props} />;

export default withAuthSync(page);
