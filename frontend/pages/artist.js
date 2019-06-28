import React from "react";
import Channel from "../src/modules/channel";
import {withAuthSync} from "../src/util/auth";

const artist = props => <Channel {...props} />;
export default withAuthSync(artist);
