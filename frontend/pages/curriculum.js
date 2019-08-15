import React from "react";
import Curriculum from "../src/modules/curriculum";
import {withAuthSync} from "../src/util/auth";

const page = props => <Curriculum {...props} />;
export default withAuthSync(page);
