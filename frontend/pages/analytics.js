import React from "react";
import Analytics from "../src/modules/analytics";
import {withAuthSync} from "../src/util/auth";

const page = props => <Analytics {...props} />;
export default withAuthSync(page);
