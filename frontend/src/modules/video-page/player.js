import React, {Component} from "react";
import {withUser} from "../../util/auth";
import "video-react/dist/video-react.css"; // import css
import {Player} from "video-react";

class player extends Component {
    constructor(props) {
        super(props);
    }

    handleStateChange(state, prevState) {
        if(state.ended && !prevState.ended)
            $('#paymentModal').modal('show');
    }

    componentDidMount() {
        if(!this.props.isPurchaseActive)
            this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
    }

    render() {
        const {className, video, user, isPurchaseActive} = this.props;
        return (
            <>
                {isPurchaseActive ?
                    <Player className={className} playsInline poster={video.preview_url} src={video.file_url}/>
                    :
                    <Player className={className} playsInline ref={"player"} poster={video.preview_url} src={video.preview_video_url}/>
                }
            </>
        );
    }

}

export default withUser(player);