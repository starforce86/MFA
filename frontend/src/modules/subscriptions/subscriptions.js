import React, {Component} from "react";
import Menu from "../../components/menu";
import SubscribeButton from "./SubscribeButton";
import Link from "next/link";
import logger from "../../util/logger";
import {API_URL} from "../../util/consts";

const log = logger('Subscriptions');

class Subscriptions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // log.trace(this.props);
        return (
            <Menu {...this.props}>
                <div id="content-wrapper">
                    <div className="container-fluid pb-0">
                        <div className="video-block section-padding">
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
                                        {/* <h6>My subscriptions</h6> */}
                                    </div>
                                </div>
                                {this.props.user && this.props.user.billing_subscription_active && this.props.channels.map(item => {
                                    return (
                                        <div key={item.id} className="col-xl-3 col-sm-6 mb-3">
                                            <div className="channels-card">
                                                <div className="channels-card-image">
                                                    <a href={`/artist?id=${item.id}`}>
                                                        <img
                                                            className="img-fluid"
                                                            src={
                                                                item.avatar
                                                                    ? API_URL + item.avatar
                                                                    : "/static/img/user.png"
                                                            }
                                                            alt
                                                        />
                                                    </a>
                                                    <SubscribeButton artist={item}/>
                                                </div>
                                                <div className="channels-card-body">
                                                    <div className="channels-title">
                                                        <Link prefetch href={`/artist?id=${item.id}`}>
                                                            <a href={`/artist?id=${item.id}`}>
                                                                {item.username ||
                                                                item.email.replace(/@.*$/, "")}
                                                            </a>
                                                        </Link>
                                                    </div>
                                                    <div>
                                                        {item.subscribed_users_count} subscribers
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <nav aria-label="Page navigation example">
                                {/*<ul className="pagination justify-content-center pagination-sm mb-4">
                                    <li
                                        className={
                                            "page-item" + (this.props.skip < 20 ? " disabled" : "")
                                        }
                                        onClick={this.previous.bind(this)}
                                    >
                                        <a className="page-link" href="#" tabIndex={-1}>
                                            Previous
                                        </a>
                                    </li>
                                    <li
                                        className={
                                            "page-item" +
                                            (this.props.skip >= this.props.channelsCount - 20
                                                ? " disabled"
                                                : "")
                                        }
                                        onClick={this.next.bind(this)}
                                    >
                                        <a className="page-link" href="#">
                                            Next
                                        </a>
                                    </li>
                                </ul>
                                <ul className="pagination justify-content-center pagination-sm mb-4">
                                    <li>Total channels: {this.props.channelsCount}</li>
                                </ul>*/}
                            </nav>
                        </div>
                        <hr/>
                    </div>
                </div>
            </Menu>
        );
    }
}

export default Subscriptions;
