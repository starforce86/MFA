import React, { Component, useState, useRef, useEffect } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import "video-react/dist/video-react.css";
import {Player, BigPlayButton} from "video-react";
import Link from 'next/link'
import MovieIcon from '@material-ui/icons/MovieOutlined';
import WatchIcon from '@material-ui/icons/WatchLaterOutlined';
import MoneyIcon from '@material-ui/icons/LocalAtmOutlined';
import CancelIcon from '@material-ui/icons/CancelPresentationOutlined';
import ThumbIcon from '@material-ui/icons/ThumbUpAltOutlined';
import LibraryIcon from '@material-ui/icons/LibraryAddOutlined';
import logger from "../../util/logger";
import {withUser} from "../../util/auth";

const log = logger('About');

const styles = {
    descIcon: {
        width: 70,
        height: 70,
        color: "#bc1e3e"
    },
    pageTitle: {
        textAlign: "center",
        color: "white",
        fontSize: 34
    },
    cardSection: {
        marginBottom: 50
    },
    cardTitle: {
        color: "white",
        fontSize: 24,
        marginTop: 10
    },
    cardDesc: {
        fontSize: 18
    },
};

class About extends Component {

    constructor(props) {
        super(props);

        this.state = {
            videoPlaying: false,
        }
    }

    handlePlayPaused = () => {
        this.setState({
            videoPlaying: false
        });
    }

    handleStateChange = (state, prevState) => {
        console.log('##### handleStateChange')
        if(prevState.paused == false && state.paused == true) {
            this.handlePlayPaused();
        }
    }

    handleClickItem = (item) => {
        if(item == 0) {
            this.setState({
                videoPlaying: true
            });
            this.player.play();
        }
    }

    componentDidMount() {
        this.player.subscribeToStateChange(this.handleStateChange.bind(this));
    }

    render() {
        const { videoPlaying } = this.state;
        const { user } = this.props;

        return (
            <div id="content-wrapper">
                <div className="container-fluid pb-0">
                    <div className="video-block section-padding">
                        <div className="row">
                            <div className="col-md-11 col-xs-12 mx-auto mb-4">
                                <div className={!videoPlaying ? 'hidden' : ''}>
                                    <Player playsInline ref={player => { this.player = player }} poster={"static/img/banner1.png"} src={"https://d1v7rt2mkfalrq.cloudfront.net/banner-video.mp4"} >
                                        <BigPlayButton position="center" />
                                    </Player>
                                </div>
                                <div className={videoPlaying ? 'hidden' : ''}>
                                    <Carousel autoPlay={!videoPlaying} infiniteLoop={true} showThumbs={false} onClickItem={this.handleClickItem.bind(this)}>
                                        <div>
                                            <img src="static/img/banner1.png" />
                                        </div>
                                        <div>
                                            <img src="static/img/banner2.png" />
                                        </div>
                                        <div>
                                            <img src="static/img/banner3.png" />
                                        </div>
                                    </Carousel>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 mt-5 mb-5">
                                <p style={styles.pageTitle}>Take part in an exciting new approach to art education</p>
                            </div>
                            <div className="col-md-4 col-xs-12" style={styles.cardSection}>
                                <MovieIcon style={styles.descIcon} />
                                <p style={styles.cardTitle}>Unlimited Access</p>
                                <p style={styles.cardDesc}>Membership grants you access to our entire library of videos and instructors.</p>
                            </div>
                            <div className="col-md-4 col-xs-12" style={styles.cardSection}>
                                <WatchIcon style={styles.descIcon} />
                                <p style={styles.cardTitle}>Anywhere, Anytime</p>
                                <p style={styles.cardDesc}>Sign in from any device and stream content when you want where you want</p>
                            </div>
                            <div className="col-md-4 col-xs-12" style={styles.cardSection}>
                                <CancelIcon style={styles.descIcon} />
                                <p style={styles.cardTitle}>No Commitment</p>
                                <p style={styles.cardDesc}>Your monthly subscription can be canceled anytime</p>
                            </div>
                            <div className="col-md-4 col-xs-12" style={styles.cardSection}>
                                <MoneyIcon style={styles.descIcon} />
                                <p style={styles.cardTitle}>Low Cost</p>
                                <p style={styles.cardDesc}>At 29.99/month your subscription is an incredible value.</p>
                            </div>
                            <div className="col-md-4 col-xs-12" style={styles.cardSection}>
                                <ThumbIcon style={styles.descIcon} />
                                <p style={styles.cardTitle}>Learn from the best</p>
                                <p style={styles.cardDesc}>Starting with Quang Ho, watch as we invite the best artists in the field to take part in MFA.</p>
                            </div>
                            <div className="col-md-4 col-xs-12" style={styles.cardSection}>
                                <LibraryIcon style={styles.descIcon} />
                                <p style={styles.cardTitle}>Guided Curriculum</p>
                                <p style={styles.cardDesc}>Follow along as Quang Ho prescribes specific lessons designed to take you from any stage to a master painter</p>
                            </div>
                            
                        </div>
                    </div>
                    {!user && (
                        <div className="footer">
                            <Link prefetch href={"/register"}><a href="/register">Buy Our $29.99/mo Subscription Today!</a></Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }
};

export default withUser(About);
