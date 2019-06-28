import React from "react";
import UpgradeToPremium from '../src/modules/upgrade'
import {withAuthSync} from "../src/util/auth";

const upgrade = props => <UpgradeToPremium {...props} />;
export default withAuthSync(upgrade)
