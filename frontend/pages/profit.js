import React from "react";
import Profit from "../src/modules/profit";
import {withAuthSync} from "../src/util/auth";

const page = props => <Profit {...props} />;
export default withAuthSync(page);
