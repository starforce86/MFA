import React, {Component} from "react";
import Menu from "../../components/menu";
import "video-react/dist/video-react.css"; // import css
import SubscribeButton from "../channels/SubscribeButton";
import Link from "next/link";
import MyPlayer from "./player";
import gql from "graphql-tag";
import logger from "../../util/logger";
import {API_URL} from "../../util/consts";
import _ from 'lodash'
import ReactHashTag from 'react-hashtag';
import {withUser} from "../../util/auth";

const log = logger('VideoPage');

const LIKE_MUTATION = gql`
    mutation Like($videoId: ID!, $myId: ID!) {
        updateUser(
            where: { id: $myId }
            data: { liked_videos: { connect: { id: $videoId } } }
        ) {
            id
            liked_videos {
                id
            }
        }
    }
`;
const DISLIKE_MUTATION = gql`
    mutation Like($videoId: ID!, $myId: ID!) {
        updateUser(
            where: { id: $myId }
            data: { liked_videos: { disconnect: { id: $videoId } } }
        ) {
            id
            liked_videos {
                id
            }
        }
    }
`;

class VideoPage extends Component {
    constructor(props) {
        super(props);
        //   log.trace({props});
        this.state = {
            isLiked: this.props.video.like_users && this.props.video.like_users.length > 0
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            isLiked: nextProps.video.like_users && nextProps.video.like_users.length > 0
        })
    }

    render() {
        return <Menu {...this.props}>
            <div id="content-wrapper">
                <div className="container-fluid pb-0">
                    <div className="video-block section-padding">
                        <div className="row">
                            <div className="col-md-8">
                                <div className="single-video-left">
                                    <div className="single-video">
                                        <MyPlayer {...this.props} video={this.props.video} startTime={this.props.startTime} />{" "}
                                    </div>
                                    <div className="single-video-title box mb-3">
                                        <div className="row">
                                            <div className="col m6">
                                                <div>
                                                    <h2>
                                                        <a href={`/video?id=${this.props.video.id}`}>{this.props.video.title}</a>
                                                    </h2>
                                                    <h6 className='hash-text'>
                                                        <ReactHashTag
                                                            onHashtagClick={tag => {
                                                                document.location = `/?search=${tag.substring(1)}`
                                                            }}
                                                        >
                                                            {_.defaultTo(_.get(this, 'props.video.description',''), '')}
                                                        </ReactHashTag>
                                                    </h6>
                                                    <p className="mb-0">
                                                        <i className="fas fa-calendar-alt"/>{" "}
                                                        {this.props.video.publish_date}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col m6">
                                                {this.props.isPurchaseActive ?
                                                <div style={{
                                                    cursor: 'pointer',
                                                    float: "right",
                                                    border: '1px solid white',
                                                    borderRadius: 2,
                                                    paddingTop: 5,
                                                    paddingBottom: 5,
                                                    paddingLeft: 9,
                                                    paddingRight: 9,
                                                    color: '#FFF'
                                                }} onClick={async () => {
                                                    await this.props.apolloClient.mutate({
                                                        mutation: this.state.isLiked ? DISLIKE_MUTATION : LIKE_MUTATION,
                                                        variables: {
                                                            videoId: this.props.videoId,
                                                            myId: this.props.id
                                                        }
                                                    });
                                                    this.setState({
                                                        isLiked: !this.state.isLiked
                                                    });
                                                }}>
                                                    Favorite&nbsp;&nbsp;
                                                    {
                                                        this.state.isLiked ?
                                                            <img src="/static/img/heart.svg" height="15px"
                                                                 width="15px" alt=""/>
                                                            :
                                                            <img src="/static/img/heart_border.svg" height="15px"
                                                                 width="15px" alt=""/>
                                                    }

                                                </div> : null}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="single-video-author box mb-3">
                                        <div className="float-right">
                                            {this.props.isPurchaseActive ?
                                                <SubscribeButton artist={this.props.author}/> : null}
                                        </div>
                                        <img className="img-fluid"
                                             src={this.props.author.avatar ? API_URL + this.props.author.avatar : "/static/img/user.png"}
                                             alt/>
                                        <p>
                                            <Link prefetch href={`/artist?id=${this.props.author.id}`}>
                                                <a href="#">
                                                    <strong>
                                                        {this.props.author.username ||
                                                        (this.props.author.email
                                                            ? this.props.author.email.replace(/@.*$/, "")
                                                            : "")}
                                                    </strong>
                                                </a>
                                            </Link>{" "}
                                            <span
                                                title={""}
                                                data-placement="top"
                                                data-toggle="tooltip"
                                                data-original-title="Verified"
                                            >
                      <i className="fas fa-check-circle text-success"/>
                    </span>
                                        </p>
                                        <small>
                                            <i className="fas fa-calendar-alt"/>
                                            {" Published on"}
                                            {this.props.video.publish_date}
                                        </small>
                                    </div>
                                    <div className="single-video-info-content box mb-3">
                                        <h6>Category :</h6>
                                        <p className="tags mb-0">
                                            {this.props.video
                                                ? this.props.video.categories
                                                    ? this.props.video.categories.map(category => (
                                                        <Link prefetch
                                                              key={category.id}
                                                              href={`/category?id=${category.id}`}
                                                        >
                              <span>
                                <a href={`/category?id=${category.id}`}>{category.title}</a>
                              </span>
                                                        </Link>
                                                    ))
                                                    : null
                                                : null}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="single-video-right">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="main-title">
                                                {/*<div className="btn-group float-right right-action">
                                                <a
                                                    href="#"
                                                    className="right-action-link text-gray"
                                                    data-toggle="dropdown"
                                                    aria-haspopup="true"
                                                    aria-expanded="false"
                                                >
                                                    Sort by{" "}
                                                    <i className="fa fa-caret-down" aria-hidden="true"/>
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-right">
                                                    <a className="dropdown-item" href="#">
                                                        <i className="fas fa-fw fa-star"/> &nbsp; Top Rated
                                                    </a>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="fas fa-fw fa-signal"/> &nbsp; Viewed
                                                    </a>
                                                    <a className="dropdown-item" href="#">
                                                        <i className="fas fa-fw fa-times-circle"/> &nbsp;
                                                        Close
                                                    </a>
                                                </div>
                                            </div>*/}
                                                <h6>Up Next</h6>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            {this.props.video
                                                ? this.props.author
                                                    ? this.props.author.my_videos
                                                        ? this.props.author.my_videos.map(v => (
                                                            <div
                                                                className="video-card video-card-list"
                                                                key={`author_${v.id}`}
                                                            >
                                                                <div className="video-card-image">
                                                                    <Link prefetch href={`/video?id=${v.id}`}>
                                                                        <div className="play-icon">
                                                                                <i className="fas fa-play-circle"/>
                                                                        </div>
                                                                    </Link>
                                                                    <Link prefetch href={`/video?id=${v.id}`}>
                                                                        <img
                                                                            className="img-fluid"
                                                                            src={v.preview_url ? v.preview_url : "../../../static/assets/img/video_preview_default.jpg"}
                                                                            alt
                                                                        />
                                                                    </Link>
                                                                </div>
                                                                <div className="video-card-body">
                                                                    <div className="btn-group float-right right-action">
                                                                        <a
                                                                            href="#"
                                                                            className="right-action-link text-gray"
                                                                            data-toggle="dropdown"
                                                                            aria-haspopup="true"
                                                                            aria-expanded="false"
                                                                        >
                                                                            {/*<i
                                                                            className="fa fa-ellipsis-v"
                                                                            aria-hidden="true"
                                                                        />*/}
                                                                        </a>
                                                                        <div
                                                                            className="dropdown-menu dropdown-menu-right">
                                                                            <a className="dropdown-item" href="#">
                                                                                <i className="fas fa-fw fa-star"/>{" "}
                                                                                &nbsp; Top Rated
                                                                            </a>
                                                                            <a className="dropdown-item" href="#">
                                                                                <i className="fas fa-fw fa-signal"/>{" "}
                                                                                &nbsp; Viewed
                                                                            </a>
                                                                            <a className="dropdown-item" href="#">
                                                                                <i className="fas fa-fw fa-times-circle"/>{" "}
                                                                                &nbsp; Close
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div className="video-title">
                                                                        <Link prefetch href={`/video?id=${v.id}`}>{v.title}</Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                        : null
                                                    : null
                                                : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Menu>
    }
}

export default withUser(VideoPage);
