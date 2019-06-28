import React, {Component} from "react";
import Menu from "../../components/menu";

class UpgradeToPremium extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Menu {...this.props}>
                <div>
                    <div id="wrapper">
                        <div id="content-wrapper">
                            <div className="container-fluid">
                                <div className="video-block section-padding">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="main-title">

                                                <h6><a href="#" data-toggle="modal" data-target="#paymentModal">Upgrade
                                                    To Premium</a></h6>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </Menu>
        );
    }
}

export default UpgradeToPremium;
