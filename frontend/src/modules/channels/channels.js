import React, {Component} from "react";
import Menu from "../../components/menu";
import SubscribeButton from "./SubscribeButton";
import Link from "next/link";
import {API_URL} from "../../util/consts";
import logger from "../../util/logger";

const log = logger('Channels');

class Channels extends Component {
    constructor(props) {
        super(props);
    }

    next() {
        if (this.props.skip < this.props.channelsCount - 20)
            this.props.setSkip(this.props.skip + 20);
    }

    previous() {
        if (this.props.skip >= 2) this.props.setSkip(this.props.skip - 20);
    }

    render() {
        //log.trace(this.props)
        return (
            <Menu {...this.props}>
                <div id="content-wrapper">
                    <div className="container-fluid pb-0">
                        <div className="video-block section-padding">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="main-title">
                                        <h6>Artists</h6>
                                    </div>
                                </div>
                                {this.props.channels ? this.props.channels.map(item => {
                                    return (
                                        <div key={item.id} className="col-xl-3 col-sm-6 mb-3">
                                            <div className="channels-card">
                                                <div className="channels-card-image">
                                                    <a href={`/artist?id=${item.id}`}>
                                                        <img
                                                            className="img-fluid"
                                                            src={
                                                                // todo delete Math random
                                                                item.avatar
                                                                    ? API_URL + item.avatar
                                                                    : "/static/img/user.png"
                                                            }
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
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : null}
                            </div>
                            <nav aria-label="Page navigation example">
                                <ul className="pagination justify-content-center pagination-sm mb-4">
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
                                </ul>
                            </nav>
                        </div>
                        <hr/>
                    </div>
                </div>
            </Menu>
        );
    }
}

export default Channels;
