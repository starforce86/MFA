import React, {Component} from "react";
import { connect } from 'react-redux';
import {withUser} from "../../util/auth";
import "video-react/dist/video-react.css"; // import css
import {Player} from "video-react";
import gql from "graphql-tag";
import moment from 'moment';
import withApollo from "../../util/withApollo";
import { updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } from '../../redux/store'

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const UPDATE_WATCHED_VIDEO_MUTATION = gql`
    mutation UpdateWatchedVideo($videoId: String!, $watchedSeconds: Int!) {
        updateWatchedVideo(
            videoId: $videoId,
            watchedSeconds: $watchedSeconds
        )
    }
`;

const CREATE_PLAY_HISTORY_MUTATION = gql`
    mutation createPlayHistory($userId: ID, $videoId: ID, $playSeconds: Int!, $realPlaySeconds: Int!) {
        createPlayHistory(
            data: {
                user: {
                    connect: {id: $userId}
                }
                video: {
                    connect: {id: $videoId}
                }
                playSeconds: $playSeconds
                realPlaySeconds:$realPlaySeconds
            }
        ) {
            id
        }
  }
`;

class player extends Component {

    constructor(props) {
        super(props);
    }

    async updateWatchedVideoTime() {
        if (!this.refs.player) {
            return;
        }
        const { player } = this.refs.player.getState();
        if (player.paused) {
            return;
        }
        console.log('################### UPDATE_WATCHED_VIDEO_MUTATION')
        this.props.apolloClient.mutate({
            mutation: UPDATE_WATCHED_VIDEO_MUTATION,
            variables: {
                videoId: this.props.video.id,
                watchedSeconds: Math.floor(player.currentTime)
            }
        });
    }

    async createPlayHistory(userId, videoId, playSeconds, realPlaySeconds) {
        
        this.props.apolloClient.mutate({
            mutation: CREATE_PLAY_HISTORY_MUTATION,
            variables: {
                userId: userId,
                videoId: videoId,
                playSeconds: playSeconds,
                realPlaySeconds: realPlaySeconds
            }
        });
    }

    handlePlayStarted() {

        const { video, playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged,
            updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } = this.props;
        const curTime = moment().format(dateFormat);

        // alert('play started : playVideoId = ' + playVideoId);

        updatePlayStartTime(curTime);
        updateVideoChanged(false);
    }

    handlePlayPaused() {

        const { video, playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged,
            updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } = this.props;
        const curTime = moment().format(dateFormat);

        if(!playVideoId) {
            return;
        }
        if(videoChanged) {
            return;
        }

        // alert('paused : playVideoId = ' + playVideoId);

        const playSeconds = moment().diff(moment(playStartTime), 'seconds');

        updateRealPlaySeconds(realPlaySeconds + playSeconds);
        // console.log('############### updateRealPlaySeconds : realPlaySeconds, playSeconds, new realPlaySeconds', realPlaySeconds, playSeconds, realPlaySeconds + playSeconds);
    }

    handleVideoChanged() {

        const { user, video, playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged,
            updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } = this.props;
        const curTime = moment().format(dateFormat);

        // alert('handleVideoChanged : playVideoId = ' + playVideoId);
        // console.log('################### handleVideoChanged : playVideoId = ' + playVideoId);
        
        const { player } = this.refs.player.getState();
        let computedRealPlaySeconds = realPlaySeconds;
        if (!player.paused) {
            const playSeconds = moment().diff(moment(playStartTime), 'seconds');
            computedRealPlaySeconds = computedRealPlaySeconds + playSeconds;
        }

        if(playVideoId && computedRealPlaySeconds > 0) {
            const playSeconds = moment().diff(moment(videoStartTime), 'seconds');
            // alert('save play history : playVideoId = ' + playVideoId + ', playSecondes = ' + playSeconds + ', realPlaySeconds = ' + computedRealPlaySeconds);
            if(user) {
                console.log('################ SAVE PLAY HISTORY : playVideoId, playSecondes, computedRealPlaySeconds', playVideoId, playSeconds, computedRealPlaySeconds);
                this.createPlayHistory(user.id, playVideoId, playSeconds, computedRealPlaySeconds);
            }
        }
        updatePlayVideoId(video.id);
        updateVideoStartTime(curTime);
        updateRealPlaySeconds(0);
        updateVideoChanged(true);
    }

    componentDidUpdate() {
        const { video, playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged,
            updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } = this.props;
        const curTime = moment().format(dateFormat);
        // console.log('################### componentDidUpdate : playVideoId, video.id', playVideoId, video.id)

        if(playVideoId != video.id) {
            this.handleVideoChanged();
        }
    }

    handleStateChange(state, prevState) {

        const { video, playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged,
            updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } = this.props;

        if(!this.props.isPurchaseActive && state.ended && !prevState.ended) {
            $('#paymentModal').modal('show');
        }
        if(prevState.paused == false && state.paused == true) {
            this.handlePlayPaused();
        }
        if(prevState.paused == true && state.paused == false) {
            this.handlePlayStarted();
        }
        // if(video.id !== playVideoId) {
        //     this.handlePlayPaused();
        // }
    }

    componentDidMount() {
        // console.log('################### componentDidMount')
        this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));

        this.timer = setInterval(() => { 
            this.updateWatchedVideoTime() 
        }, 2000);
    }

    componentWillUnmount() {
        const { video, playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged,
            updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged } = this.props;
        // console.log('################### componentWillUnmount : playVideoId, video.id', playVideoId, video.id)
        // alert('################### componentWillUnmount : playVideoId = ' + playVideoId + ', video.id = ' + video.id)
        // this.handlePlayPaused();
        this.handleVideoChanged();
        clearInterval(this.timer);
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

const mapDispatchToProps = { updatePlayVideoId, updateRealPlaySeconds, updatePlayStartTime, updateVideoStartTime, updateVideoChanged }

const mapStateToProps = (state) => {
    const { playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged } = state;
    return { playVideoId, realPlaySeconds, playStartTime, videoStartTime, videoChanged };
}

export default withUser(withApollo(connect(mapStateToProps, mapDispatchToProps)(player)));