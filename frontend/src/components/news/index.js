import React, { Component } from "react";
import Menu from "../../components/menu";
import Link from "next/link";
import { API_URL } from "../../util/consts";
import logger from "../../util/logger";
import NewsCard from "./NewsCard";

const log = logger('News');

const News = props => {
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

                    <div className="video-block section-padding">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="main-title">
                                    <h6>News</h6>
                                </div>
                            </div>

                            {props
                                ? props.posts
                                    ? props.posts.map(p => <NewsCard post={p} key={p.id} />)
                                    : null
                                : null}
                        </div>
                    </div>
                    <hr className="mt-0" />
                </div>
                {/* /.container-fluid */}
            </div>
        </Menu>
    );
};

export default News;
