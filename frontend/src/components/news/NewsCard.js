import React, {Component} from "react";
import Link from "next/link";
import logger from "../../util/logger";

const log = logger('NewsCard');

class NewsCard extends Component {
	render() {
		const {
			id,
			title,
			mainImageUrl,
			createdAt
		} = this.props.post;

		return (
			<div className="col-xl-3 col-sm-6 mb-3">
				<div className="news-card">
					<div className="video-card-body">
						<div className="video-title">
							<a href={`/newsd?id=${id}`}>{title}</a>
						</div>
						<div className="video-view">
							&nbsp;
									<i className="fas fa-calendar-alt" /> {createdAt}
						</div>
					</div>
					<div className="news-card-image">
						<a className="play-icon" href={`/newsd?id=${id}`}>
						</a>
						<a href="#">
							<img className="img-fluid"
								src={mainImageUrl}
								alt />
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default NewsCard;
