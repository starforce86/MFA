import React from "react";
import VideoPage from "../src/modules/video-page";
import {withAuthSync} from "../src/util/auth";

class CurrentVideoPage extends React.Component {
    static getInitialProps({query: {id}}) {
        return {videoId: id};
    }

    render() {
        // return <div>{JSON.stringify(this.props)}</div>;
        return <VideoPage {...this.props} />;
    }
}

// export default CurrentVideoPage;
export default withAuthSync(CurrentVideoPage);
