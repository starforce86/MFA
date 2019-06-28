import React from "react";
import Favorites from "../src/modules/favorites";
import {withAuthSync} from "../src/util/auth";

const favorites = props => <Favorites {...props} />;
export default withAuthSync(favorites);
