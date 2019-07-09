import React, {Component} from "react";
import MyUploadVideo from "./myUploadVideo";
import gql from "graphql-tag";
import {compose, graphql, Query, withApollo} from "react-apollo";
import {withRouter} from 'next/router'
import logger from "../../util/logger";

const log = logger('Channel');

const GET_MY_VIDEOS_QUERY = gql`
    query GetUser($id: ID!) {
        user(where: { id: $id }) {
            id
            background_image
            about_text
            firstname
            lastname
            username
            email
            avatar
            role
            my_videos(orderBy: publish_date_DESC) {
                id
                title
                publish_date
                description
                file_url
                preview_video_url
                preview_url
                author {
                    id
                    email
                }
            }
            subscribed_users_count
        }
        categories {
            id
            title
        }
        tags {
            id
            text
        }
    }
`;

const CREATE_VIDEO = gql`
    mutation CreateVideo($title: String, $description: String, $file_url: String, $preview_url: String, $author: ID, $categories: [CategoryWhereUniqueInput!], $tags: [TagWhereUniqueInput!]) {
        createVideo(
            data: {
                title: $title
                description: $description
                file_url: $file_url
                preview_url: $preview_url
                author: {
                    connect: {
                        id: $author
                    }
                }
                categories: {
                    connect: $categories
                }
                tags: {
                    connect: $tags
                }
            }
        ) {
            id
        }
    }
`;

class MyVideoPageWithoutMutations extends Component {
    constructor(props) {
        super(props);
    }

    handleSaveVideo = async (
        videoFile,
        videoPreviewImageFile,
        title,
        description,
        categories,
        tags
    ) => {
        if (!videoFile) {
            return {error: true, message: 'Please input video file!'};
        }
        if (!videoPreviewImageFile) {
            return {error: true, message: 'Please input video preview image file!'};
        }
        if (!title) {
            return {error: true, message: 'Please input title!'};
        }
        if (!description) {
            return {error: true, message: 'Please input description!'};
        }
        const author = this.props.id;
        categories = categories.map(c => ({id: c.id}));
        tags = tags.map(t => ({id: t.id}));
        const result = await this.props.createVideo({
            variables: {
                title: title,
                description: description,
                file_url: videoFile,
                preview_url: videoPreviewImageFile,
                author: author,
                categories: categories,
                tags: tags
            }
        });
        return {error: false};
    };

    render() {
        const id = this.props.id;
        return <Query errorPolicy={"ignore"}
                      query={GET_MY_VIDEOS_QUERY}
                      variables={{
                          id: id
                      }}>
            {
                ({loading, error, data}) => {
                    //if (loading) return <div>Loading...</div>;
                    if (error) return <div>Error</div>;

                    return <MyUploadVideo
                        {...this.props}
                        saveVideo={async (videoFile, videoPreviewImageFile, title, description, categories, tags) =>
                            await this.handleSaveVideo(
                                videoFile,
                                videoPreviewImageFile,
                                title,
                                description,
                                categories,
                                tags
                            )
                        }
                        user={data.user}
                        categories={data.categories}
                        tags={data.tags}
                    />
                }
            }
        </Query>;
        return ''
    }
}

const MyVideoPage = compose(
    graphql(CREATE_VIDEO, {
        name: "createVideo",
        options: {
            update: async (proxy, {data}) => {
            },
            onCompleted: async result => {
                if (result) {
                    // log.trace(result);
                    //TODO await login({user,token}) now token is null
                }
            },
            onError: async errors => {
                let errorString = "";

              
                errors.graphQLErrors.map(item => errorString = errorString + JSON.stringify(item.message) + " ");

                //TODO return error to component
                log.error(JSON.stringify(errors.graphQLErrors));
                alert(errorString);
            }
        }
    }),

)(MyVideoPageWithoutMutations);

export default withRouter(withApollo(MyVideoPage));