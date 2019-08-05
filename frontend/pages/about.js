import React from "react";
import About from "../src/modules/about";
import {withAuthSync} from "../src/util/auth";

const page = props => <About {...props} />;
export default withAuthSync(page);
