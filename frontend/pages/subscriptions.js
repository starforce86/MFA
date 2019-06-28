import React from "react";
import Subscriptions from "../src/modules/subscriptions";
import {withAuthSync} from "../src/util/auth";

const subscriptions = props => <Subscriptions {...props} />;
export default withAuthSync(subscriptions);
