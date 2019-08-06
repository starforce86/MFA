import React, {Component} from "react";
import Link from "next/link";
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import logger from "../../util/logger";

const log = logger('NewsCard');

class NewsCard extends Component {

	handleEdit = () => {
		const { post, editPost } = this.props;
		editPost(post.id);
	};

	handleDelete = () => {
		Modal.confirm({
			title: `Are you sure delete?`,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: () => this.deletePost(),
		});
	};

	deletePost = () => {
		const { post, deletePost } = this.props;
		deletePost(post.id);
	}

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
					{this.props.user && this.props.user.role == "ADMIN" && (
						<React.Fragment>
							<div className="news-card-action">
								<IconButton onClick={this.handleEdit}>
									<EditIcon style={{ color: '#bc1e3e' }} />
								</IconButton>
								<IconButton onClick={this.handleDelete}>
									<DeleteIcon style={{ color: '#bc1e3e' }} />
								</IconButton>
							</div>
						</React.Fragment>
					)}
				</div>
			</div>
		);
	}
}

export default NewsCard;
