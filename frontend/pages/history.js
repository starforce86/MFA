import React from "react";
import History from "../src/modules/history";
import {withAuthSync} from "../src/util/auth";

const history = props => <History {...props} />;
export default withAuthSync(history);
