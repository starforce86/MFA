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
    }
`;

const ADD_WATCHED_VIDEO_MUTATION = gql`
    mutation AddWatchedVideo($userId: ID!, $videoId: ID!) {
        updateUser(
            where: { id: $userId }
            data: { watched_videos: { connect: { id: $videoId } } }
        ) {
            id
            watched_videos {
                id
            }
        }
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
                userId: this.props.id,
                videoId: this.props.videoId
            }
        });
    }

    render() {
   //     log.trace("v-p-w", this.props.id);

        return (
            <div>
                <Query errorPolicy={"ignore"}
                       query={VIDEO_QUERY}
                       fetchPolicy={"cache-and-network"}
                       variables={{id: this.props.videoId, myId: this.props.id || ''}}
                >
                    {({loading, error, data}) => {
                   //     log.trace("v-page", data);
                        log.trace("v-page-error", error);

                        const video = data ? (data.video ? data.video : {}) : {};

                        const author = video.author ? video.author : {};
                        const {preview_url, file_url} = video;
                        const title = data ? (data.category ? data.category.title : "") : "";
                        return <Video {...this.props} video={video} author={author}/>;
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
