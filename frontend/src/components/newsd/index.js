import React, {Component} from "react";
import {withUser} from "../../util/auth";
import Link from "next/link";
import Menu from "../menu";
import logger from "../../util/logger";

const log = logger('NewsDetailComponent');

class NewsDetail extends Component {
	render() {
		const {
			title,
			mainImageUrl,
			text,
			createdAt
		} = this.props.post;

		return (
            <Menu>
                <div id="content-wrapper">
                    <div className="container-fluid pb-0">
                        <div className="top-mobile-search">
                            <div className="row">
                                <div className="col-md-12">
                                    <form action="/" method="get"
                                        className="mobile-search">
                                        <div className="input-group">
                                            <input
                                                style={{ color: "#FFF" }}
                                                name="search"
                                                type="text"
                                                placeholder="Search for..."
                                                className="form-control"
                                            />
                                            <div className="input-group-append">
                                                <button type="button" className="btn btn-dark">
                                                    <i className="fas fa-search" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <hr />
                        <div className="video-block section-padding">
                            <div className="row">
                                <div className="col-xl-8 m-auto col-sm-12 mb-3">
                                    <div>
                                        <div>
                                            <div className="newsd-title">
                                                {title}
                                            </div>
                                            <div className="newsd-date">
                                                <i className="fas fa-calendar-alt" style={{paddingRight: 5}} /> 
                                                {createdAt}
                                            </div>
                                        </div>
                                        <div className="news-card-image">
                                            <img className="img-fluid"
                                                src={mainImageUrl}
                                                alt />
                                        </div>
                                        <div className="newsd-content">
                                            {text}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr className="mt-0" />
                    </div>
                    {/* /.container-fluid */}
                </div>
            </Menu>
            
		);
	}
}

export default withUser(NewsDetail);
