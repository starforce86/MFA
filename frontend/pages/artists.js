import React from "react";
import Channels from "../src/modules/channels";
import {withAuthSync} from "../src/util/auth";

const artists = props => <Channels {...props} />;
export default withAuthSync(artists);
