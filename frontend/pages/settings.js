import React from "react";
import Settings from '../src/modules/settings'
import {withAuthSync} from "../src/util/auth";

const settings = props => <Settings {...props} />;
export default withAuthSync(settings)
