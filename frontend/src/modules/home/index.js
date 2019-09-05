import gql from "graphql-tag";
import {compose, graphql, Query} from "react-apollo";
import Videos from "../../components/videos";
import React, {Component} from "react";
import {withRouter} from "next/router";
import "video-react/dist/video-react.css";
import MyPlayer from "../../modules/video-page/promoPlayer";
import Video from "../../components/video";
import logger from "../../util/logger";
import * as consts from "../../util/consts";
import withApollo from "../../util/withApollo";

const log = logger('HomePage');

const HOMEPAGE_QUERY = gql`
    query VideosQuery($myId: ID!) {
        videos: featured_videos {
            id
            title
            preview_video_url
            preview_url
            video_duration
            file_url
            publish_date
            description
            categories {
                id
                title
            }
            author {
                id
                username
                email
                avatar
            }
            approved
        }
        featuredVideos: category(where: {id: "${consts.FEATURED_CATEGORY_ID}"}){
            title
            description
            videos{
                id
                preview_video_url
                publish_date
                description
                title
                file_url
                preview_url
                video_duration
                author {
                    id
                    username
                    email
                    avatar
                }
                approved
            }
        }
        promoVideos: category( where: {id: "${consts.PROMO_CATEGORY_ID}"}){
            title
            description
            videos(orderBy:publish_date_DESC, first:1 ){
                id
                preview_video_url
                publish_date
                description
                title
                file_url
                preview_url
                video_duration
                author {
                    id
                    username
                    email
                    avatar
                }
                approved
            }
        }
        history: user(where: { id: $myId }) {
            id
            watched_videos {
                id
                video {
                    id
                    publish_date
                    description
                    title
                    file_url
                    preview_url
                    video_duration
                    author {
                        id
                        email
                        avatar
                        username
                    }
                    approved
              }
            }
        }
    }
`;

const HOMEPAGE_QUERY_WITH_SEARCH = gql`
    query VideosWithSearchQuery($searchQuery: String, $myId: ID!) {
        videos(
            where: {
                OR:
                [
                    { title_contains: $searchQuery },
                    { description_contains: $searchQuery },
                    { tags_some: { text: $searchQuery } }
                ]
            }
        ) {
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
            author {
                id
                username
                email
                avatar
            }
            approved
        }
        featuredVideos: category(where: {id: "cjv2ytlrj0l940749kefajzgd"}){
            title
            description
            videos{
                id
                preview_video_url
                publish_date
                description
                title
                file_url
                preview_url
                author {
                    id
                    username
                    email
                    avatar
                }
                approved
            }
        }
        promoVideos: category( where: {id: "cjv41fccs0ny607491ieb7b6q"}){
            title
            description
            videos(first:1 ){
                id
                publish_date
                preview_video_url
                description
                title
                file_url
                preview_url
                author {
                    id
                    username
                    email
                    avatar
                }
                approved
            }
        }
        history: user(where: { id: $myId }) {
            id
            watched_videos {
                id
                video {
                    id
                    publish_date
                    description
                    title
                    file_url
                    preview_url
                    video_duration
                    author {
                        id
                        email
                        avatar
                        username
                    }
                    approved
              }
            }
        }
    }
`;

const PROFILE_QUERY = gql`
    query GetProfile($id: ID) {
        user(where: { id: $id }) {
            id
            email
            billing_subscription_active
        }
    }
`;

const WATCHED_TIME_QUERY = gql`
    query GetWatchedTime($videoId: ID, $myId: ID) {
        watchedVideoUser(where: { id: $videoId, myId: $myId }) {
            watched_seconds
        }
    }
`;

class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    contentBlock(promoVideo) {
        if (promoVideo && promoVideo.videos && promoVideo.videos[0]) {
            // const videos = promoVideo.videos.filter(v => v.approved == true);
            const videos = promoVideo.videos;
            const myId = this.props.id ? this.props.id : '';
            if(videos && videos.length > 0) {
                return (
                    <Query
                        errorPolicy={"ignore"}
                        query={WATCHED_TIME_QUERY}
                        variables={{ videoId: videos[0].id, myId: myId }}
                        fetchPolicy={"cache-and-network"}
                    >
                        {({ loading, error, data }) => {
                            if (loading) return "Loading...";
                            if (error) return "Error";
                            const startTime = data ? (data.watchedVideoUser ? data.watchedVideoUser.watched_seconds : 0) : 0;
                            return (
                                <>
                                    <h6>
                                        {"Latest Featured Video"}
                                    </h6>
                                    <br />
                                    <div className="single-channel-image" style={{
                                        minHeight: "130px",
                                        height: "auto"
                                    }}>
                                        <MyPlayer className="h500" video={videos[0]} startTime={startTime} />
                                    </div>
                                    <div style={{
                                        marginBottom: '30px',
                                        marginTop: '5px'
                                    }}>
                                        <h5>
                                            {videos[0].title}
                                        </h5>
                                        {promoVideo.description && <h6>
                                            {promoVideo.description}
                                        </h6>}
                                    </div>
                                    <br />
                                </>
                            );
                        }}
                    </Query>
                );
            } else {
                return "No Latest Featured Video"
            }
        }
        else return "No Latest Featured Video"
    }

    historyBlock(videos) {
        if (videos)
            return (
                <>
                    <div className="video-block section-padding">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="main-title">
                                    <h6>Watched videos</h6>
                                </div>
                            </div>

                            {videos.filter(v => v.video).map(item => {
                                return <Video video={item.video} key={item.video.id}/>;
                            })}
                        </div>
                    </div>

                    {}
                </>
            );
    }

    render() {
        let searchQuery = this.props.router.query.search;

        // remove hash tag if exist
        if (searchQuery && searchQuery.startsWith('#')) {
            searchQuery = searchQuery.substring(1);
        }

        log.error({searchQuery});

        const myId = this.props.id ? this.props.id : '';
        log.trace({searchQuery, myId});
        return (
            <Query
                errorPolicy={"ignore"}
                query={searchQuery ? HOMEPAGE_QUERY_WITH_SEARCH : HOMEPAGE_QUERY}
                variables={{myId: myId, searchQuery: searchQuery}}
                fetchPolicy={"cache-and-network"}
            >
                {({loading, error, data}) => {
                    log.debug('query:', {loading, error, data});
                    if (loading) return "Loading...";
                    if (error) return "Error";
                    const videos = data ? (data.videos ? data.videos : []) : [];
                    // const featureVideos = data ? (data.featuredVideos ? (data.featuredVideos.videos ? data.featuredVideos.videos.filter(v => v.approved == true) : []) : []) : [];
                    const featureVideos = data ? (data.featuredVideos ? (data.featuredVideos.videos ? data.featuredVideos.videos : []) : []) : [];
                    const featureTitle = data ? (data.featuredVideos ? data.featuredVideos.title : "Featured Videos") : "Featured Videos";
                    log.trace('videos', videos);
                    // const vf = videos ? videos.find(v => v.id === 'cjuya09zk00nk07492dmxbetb') : null
                    const promoVideo = data ? data.promoVideos ? data.promoVideos : null : null;
                    return (
                        <>
                            <Videos
                                videos={searchQuery ? videos : featureVideos}
                                contentBlock={searchQuery ? null : this.contentBlock(promoVideo)}
                                historyBlock={this.historyBlock(
                                    data.history ? data.history.watched_videos : []
                                )}
                                title={
                                    searchQuery ? `Search "${searchQuery}"` : featureTitle
                                }
                            />
                            ;
                        </>
                    );
                }}
            </Query>
        );
    }
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

const Home = compose(
    graphql(PROFILE_QUERY, {
        name: "getUserProfile",
        options: props => ({
            variables: {
                id: props.id
            },
            fetchPolicy: "cache-and-network",
            onCompleted: (data) => {
                if (data && data.user) {
                    if (!data.user.billing_subscription_active) {
                        // props.router.push("/payment")
                        // deleteAllCookies()
                        // location.reload();


                    }
                }
                //alert('Done');
            },
        })
    })
)(HomePage);

export default withApollo(withRouter(Home));
