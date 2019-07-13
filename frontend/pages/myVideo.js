import React from "react";
import MyVideo from "../src/modules/myVideo";
import {withAuthSync} from "../src/util/auth";

const page = props => <MyVideo {...props} />;

export default withAuthSync(page);
