import gql from "graphql-tag";
import {Query} from "react-apollo";
import Video from "./video-page";
import React, {Component} from "react";
import withApollo from "../../util/withApollo";
import logger from "../../util/logger";

const log = logger('VideoPage');

const VIDEO_QUERY = gql`
    query VideoQuery($id: ID, $myId: ID!) {
        video(where: { id: $id }) {
            id
            title
            preview_video_url
            preview_url
            file_url
            publish_date
            description
            categories {
                id
                title
            }
            like_users(where: { id: $myId }) {
                id
            }
            author {
                id
                username
                email
                avatar
                my_videos {
                    id
                    title
                    preview_url
                    file_url
                }
            }
        }
        videos(skip: 10) {
            id
            title
            preview_url
            preview_video_url
            file_url
            publish_date
            description
            categories {
                id
                title
            }
            like_users(where: { id: $myId }) {
                id
            }
            author {
                id
                username
                email
                avatar
            }
        }
        watchedVideoUser(where: { id: $id, myId: $myId }) {
            watched_seconds
        }
    }
`;

const ADD_WATCHED_VIDEO_MUTATION = gql`
    mutation AddWatchedVideo($videoId: String!) {
        addWatchedVideo(
            videoId: $videoId
        )
    }
`;

class VideoPage extends Component {
    constructor(props) {
        super(props);

    }

    async componentDidMount() {
        this.props.apolloClient.mutate({
            mutation: ADD_WATCHED_VIDEO_MUTATION,
            variables: {
                videoId: this.props.videoId
            }
        });
    }

    render() {
   //     log.trace("v-p-w", this.props.id);

        return (
            <div style={{width: '100%'}}>
                <Query errorPolicy={"ignore"}
                       query={VIDEO_QUERY}
                       fetchPolicy={"cache-and-network"}
                       variables={{id: this.props.videoId, myId: this.props.id || ''}}
                >
                    {({loading, error, data}) => {
                        log.trace("v-page", data);
                        log.trace("v-page-error", error);

                        const video = data ? (data.video ? data.video : {}) : {};

                        const author = video.author ? video.author : {};
                        const {preview_url, file_url} = video;
                        const title = data ? (data.category ? data.category.title : "") : "";
                        const startTime = data ? (data.watchedVideoUser ? (data.watchedVideoUser ? data.watchedVideoUser.watched_seconds : 0) : 0) : 0;
                        return <Video {...this.props} video={video} startTime={startTime} author={author}/>;
                    }}
                </Query>
            </div>
        );
    }
}

VideoPage.defaultValues = {
    id: "1"
};
export default withApollo(VideoPage);
