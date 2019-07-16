import React, {Component} from "react";
import {withUser} from "../../util/auth";
import "video-react/dist/video-react.css"; // import css
import {Player} from "video-react";
import gql from "graphql-tag";
import withApollo from "../../util/withApollo";

const UPDATE_WATCHED_VIDEO_MUTATION = gql`
    mutation UpdateWatchedVideo($videoId: String!, $watchedSeconds: Int!) {
        updateWatchedVideo(
            videoId: $videoId,
            watchedSeconds: $watchedSeconds
        )
    }
`;

class player extends Component {
    constructor(props) {
        super(props);
    }

    handleStateChange(state, prevState) {
        if(state.ended && !prevState.ended) {
            $('#paymentModal').modal('show');
        }
    }

    async updateWatchedVideoTime() {
        if (!this.refs.player) {
            return;
        }
        const { player } = this.refs.player.getState();
        if (player.paused) {
            return;
        }
        this.props.apolloClient.mutate({
            mutation: UPDATE_WATCHED_VIDEO_MUTATION,
            variables: {
                videoId: this.props.video.id,
                watchedSeconds: Math.floor(player.currentTime)
            }
        });
    }

    componentDidMount() {
        if(!this.props.isPurchaseActive) {
            this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
        }

        setInterval(() => { 
            this.updateWatchedVideoTime() 
        }, 2000);
    }


    render() {
        const {className, video, user, isPurchaseActive, startTime} = this.props;
        return (
            <>
                {isPurchaseActive ?
                    <Player className={className} playsInline ref={"player"} poster={video.preview_url} src={video.file_url} startTime={startTime} />
                    :
                    <Player className={className} playsInline ref={"player"} poster={video.preview_url} src={video.preview_video_url} startTime={startTime} />
                }
            </>
        );
    }

}

export default withUser(withApollo(player));