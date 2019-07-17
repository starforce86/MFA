import React from "react";
import News from "../src/modules/news";
import {withAuthSync} from "../src/util/auth";

const news = props => <News {...props} />;
export default withAuthSync(news);
