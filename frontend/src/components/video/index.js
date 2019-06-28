import React, {Component} from "react";
import {withUser} from "../../util/auth";
import Link from "next/link";
import logger from "../../util/logger";

const log = logger('VideoComponent');

class Video extends Component {
	render() {
		const {
			preview_url,
			file_url,
			video,
			author,
			categories,
			like_users,
			onClick,
			isPurchaseActive,
		} = this.props;

		const duration = new Date(null);
		let formatDuration = null;
		if (video.video_duration) {
			duration.setSeconds(video.video_duration);
			formatDuration = duration.getUTCMinutes() + ':' + duration.getUTCSeconds();
		}
		return (
			<div key={video.id} className="col-xl-3 col-sm-6 mb-3">
				{!video.preview_video_url && !isPurchaseActive ? (
					<a href="#" data-toggle="modal" data-target="#paymentModal">
						<div className="video-card">
							<div className="video-card-image">
								<a className="play-icon" href="#">
									<i className="fas fa-play-circle"/>
								</a>
								<a href="#">
									<img className="img-fluid"
									     src={video.preview_url ? video.preview_url : "/static/assets/img/video_preview_default.jpg"}
									     alt/>
								</a>
								{formatDuration ?
									<div className="time">{formatDuration}</div> : null
								}
							</div>
							<div className="video-card-body">
								<div className="video-title">
									<a href="#">{video.title}</a>
								</div>
							</div>
						</div>
					</a>
				) : (
					<div>
						<div className="video-card">
							<div className="video-card-image">
								<a className="play-icon" href={`/video?id=${video.id}`}>
									<i className="fas fa-play-circle"/>
								</a>
								<a href="#">
									<img className="img-fluid"
									     src={video.preview_url ? video.preview_url : "/static/assets/img/video_preview_default.jpg"}
									/>
								</a>
								{/* <div className="time">3:50</div> */}
							</div>
							<div className="video-card-body">
								<div className="video-title">
									<a href={`/video?id=${video.id}`}>{video.title}</a>
								</div>
								<a href="#">
									<Link prefetch href={`/artist?id=${video.author.id}`}>
										<div className="video-page text-success">
											{video.author.username ||
											video.author.email.replace(/@.*$/, "")}
											{' '}
											<a
												data-placement="top"
												data-toggle="tooltip"
												href="#"
												data-original-title="Verified"
											>
												<i className="fas fa-check-circle text-success"/>
											</a>
										</div>
									</Link>
								</a>
								<div className="video-view">
									&nbsp;
									<i className="fas fa-calendar-alt"/> {video.publish_date}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

Video.displayName = "Video";
export default withUser(Video);
