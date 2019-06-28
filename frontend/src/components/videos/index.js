import Menu from "../menu";
import Video from "../video";
import {withUser} from "../../util/auth";

const Videos = props => {
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
                                            style={{color: "#FFF"}}
                                            name="search"
                                            type="text"
                                            placeholder="Search for..."
                                            className="form-control"
                                        />
                                        <div className="input-group-append">
                                            <button type="button" className="btn btn-dark">
                                                <i className="fas fa-search"/>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {props ? props.contentBlock ? props.contentBlock : null : null}
                    <hr/>
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
                                                <i className="fas fa-fw fa-times-circle"/> &nbsp; Close
                                            </a>
                                        </div>
                                    </div>*/}
                                    <h6>{props ? props.title : ""}</h6>
                                </div>
                            </div>

                            {props
                                ? props.videos
                                    ? props.videos.map(v => <Video video={v} key={v.id}/>)
                                    : null
                                : null}
                        </div>
                        {props ? props.historyBlock ? props.historyBlock : null : null}
                    </div>
                    <hr className="mt-0"/>
                </div>
                {/* /.container-fluid */}
            </div>
        </Menu>
    );
};

export default withUser(Videos);
