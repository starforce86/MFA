import React, {Component} from "react";
import Menu from "../../components/menu";
import Video from "../../components/video";
import logger from "../../util/logger";

const log = logger('History');

class History extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        //log.trace("History", this.props)
        return (
            <Menu {...this.props}>
                    <div id="wrapper">
                        <div id="content-wrapper">
                            <div className="container-fluid">
                                <div className="video-block section-padding">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="main-title">
                                                {/*<div className="btn-group float-right right-action">
                                                    <a href="#" className="right-action-link text-gray"
                                                       data-toggle="dropdown" aria-haspopup="true"
                                                       aria-expanded="false">
                                                        Sort by <i className="fa fa-caret-down" aria-hidden="true"/>
                                                    </a>
                                                    <div className="dropdown-menu dropdown-menu-right">
                                                        <a className="dropdown-item" href="#"><i
                                                            className="fas fa-fw fa-star"/> &nbsp; Top Rated</a>
                                                        <a className="dropdown-item" href="#"><i
                                                            className="fas fa-fw fa-signal"/> &nbsp; Viewed</a>
                                                        <a className="dropdown-item" href="#"><i
                                                            className="fas fa-fw fa-times-circle"/> &nbsp; Close</a>
                                                    </div>
                                                </div>*/}
                                                <h6>Watch History</h6>
                                            </div>
                                        </div>
                                        {
                                            this.props.user && this.props.user.billing_subscription_active && this.props.history && this.props.history.filter(v => v.video).map(item =>
                                                <Video video={item.video} key={item.video.id}/>
                                            )
                                        }
                                    </div>
                                    {/*<nav aria-label="Page navigation example">
                                        <ul className="pagination justify-content-center pagination-sm mb-0">
                                            <li className="page-item disabled">
                                                <a className="page-link" href="#" tabIndex={-1}>Previous</a>
                                            </li>
                                            <li className="page-item active"><a className="page-link" href="#">1</a>
                                            </li>
                                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                                            <li className="page-item">
                                                <a className="page-link" href="#">Next</a>
                                            </li>
                                        </ul>
                                    </nav>*/}
                                </div>
                            </div>

                        </div>

                    </div>

            </Menu>
        );
    }
}

export default History;
