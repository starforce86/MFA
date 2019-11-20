import Link from "next/link";
import Head from "next/head";
import {logout} from "../../util/auth";
import Categories from "./categories";
import StripeCheckout from "react-stripe-checkout";
import gql from "graphql-tag";
import React from "react";
import {withRouter} from "next/router";
import logger from "../../util/logger";
import {API_URL} from '../../util/consts';

const log = logger('Menu');

// export default ({
// user,
// children,
// id,
// token,
// isPurchaseActive,
// categories,
// apolloClient
// }) =>
class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.strip = React.createRef();
    }

    render() {
        const {
            user,
            children,
            id,
            token,
            isPurchaseActive,
            isPayExpiredForVideo,
            categories,
            apolloClient
        } = this.props;
        //log.trace(this.props)
        return (
            <>
                <Head>
                    <meta charSet="utf-8"/>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
                    <link rel="icon" type="image/png" href="/static/img/favicon.png"/>
                    <title>Home</title>
                </Head>

                {/*<nav className="navbar navbar-expand navbar-light bg-white static-top osahan-nav sticky-top">*/}
                {/*&nbsp;&nbsp;*/}
                {/*<button*/}
                {/*className="btn btn-link btn-sm text-secondary order-1 order-sm-0"*/}
                {/*id="sidebarToggle"*/}
                {/*>*/}
                {/*<i className="fas fa-bars"/>*/}
                {/*</button>*/}
                {/*&nbsp;&nbsp;*/}
                {/*<Link prefetch href={"/?home"}>*/}
                {/*<a className="menu-logo navbar-brand mr-1">*/}
                {/*<img className="img-fluid" src="/static/assets/img/Logo.png"/>MADE FOR ARTISTS</a>*/}
                {/*</Link>*/}
                {/*/!* Navbar Search *!/*/}
                {/*<form action="/?home" method="get"*/}
                {/*className="d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-5 my-2 my-md-0 osahan-navbar-search">*/}
                {/*<div className="input-group">*/}
                {/*<input*/}
                {/*style={{color: "#FFF"}}*/}
                {/*name="search"*/}
                {/*type="text"*/}
                {/*className="form-control"*/}
                {/*placeholder="Search for..."*/}
                {/*/>*/}
                {/*<div className="input-group-append">*/}
                {/*<input type="submit" className="btn btn-light" value="Search"/>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</form>*/}
                {/*/!* Navbar *!/*/}
                {/*<ul className="navbar-nav ml-auto ml-md-0 osahan-right-navbar no-text-transform">*/}
                {/*/!* <StripeCheckout*/}
                {/*token={token => {*/}
                {/*log.trace(token);*/}
                {/*apolloClient.mutate({*/}
                {/*mutation: gql`*/}
                {/*mutation PURCHASESMutation($stripe_tok_token: String!) {*/}
                {/*purchase(stripe_tok_token: $stripe_tok_token)*/}
                {/*}*/}
                {/*`,*/}
                {/*variables: {*/}
                {/*stripe_tok_token: token.id*/}
                {/*}*/}
                {/*});*/}
                {/*}}*/}
                {/*stripeKey="pk_test_hkDKbeMTuMChueWXlJ8XsHgF00B9bqprJz"*/}
                {/*/> *!/*/}

                {/*{user ? (*/}
                {/*<li className="nav-item dropdown no-arrow osahan-right-navbar-user">*/}
                {/*<a*/}
                {/*className="nav-link dropdown-toggle user-dropdown-link"*/}
                {/*href="#"*/}
                {/*id="userDropdown"*/}
                {/*role="button"*/}
                {/*data-toggle="dropdown"*/}
                {/*aria-haspopup="true"*/}
                {/*aria-expanded="false"*/}
                {/*>*/}
                {/*<img*/}
                {/*alt="Avatar"*/}
                {/*src={user.avatar ? `${API_URL}${user.avatar}` : "/static/img/user.png"}*/}
                {/*/>*/}
                {/*{user.username || user.email}*/}
                {/*</a>*/}
                {/*<div*/}
                {/*className="dropdown-menu dropdown-menu-right"*/}
                {/*aria-labelledby="userDropdown"*/}
                {/*>*/}
                {/*/!*<a className="dropdown-item" href="account.html">*/}
                {/*<i className="fas fa-fw fa-user-circle"/> &nbsp;My Account*/}
                {/*</a>*!/*/}
                {/*<Link prefetch href="/settings">*/}
                {/*<a className="dropdown-item">*/}
                {/*<i className="fas fa-fw fa-cog"/> &nbsp; Account*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*<Link prefetch*/}
                {/*href={user && user.billing_subscription_active ? "/subscriptions" : "/payment"}>*/}
                {/*<a className="dropdown-item">*/}
                {/*<i className="fas fa-fw fa-video"/> &nbsp; Subscriptions*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*<div className="dropdown-divider"/>*/}
                {/*<a*/}
                {/*className="dropdown-item"*/}
                {/*href="#"*/}
                {/*data-toggle="modal"*/}
                {/*data-target="#logoutModal"*/}
                {/*>*/}
                {/*<i className="fas fa-fw fa-sign-out-alt"/> &nbsp; Logout*/}
                {/*</a>*/}
                {/*</div>*/}

                {/*</li>*/}
                {/*) : (*/}
                {/*<li className="nav-item mx-1">*/}
                {/*<Link prefetch href={"/login"}>*/}
                {/*<a className="nav-link">SignIn</a>*/}
                {/*</Link>*/}
                {/*</li>*/}
                {/*)}*/}
                {/*</ul>*/}
                {/*</nav>*/}
                {/*<div id="wrapper">*/}
                {/*/!* Sidebar *!/*/}
                {/*<ul className="sidebar navbar-nav">*/}
                {/*<li className={`nav-item ${this.props.router.pathname === "/?home" ? " active" : ""}`}>*/}
                {/*<Link prefetch href={user && user.billing_subscription_active ? "/?home" : "/payment"}>*/}
                {/*<a className="nav-link">*/}
                {/*<i className="fas fa-fw fa-home"/>*/}
                {/*<span>Home</span>*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*</li>*/}
                {/*<li className={`nav-item ${this.props.router.pathname === "/channels" ? " active" : ""}`}>*/}
                {/*<Link prefetch href={user && user.billing_subscription_active ? "/channels" : "/payment"}>*/}
                {/*<a className="nav-link">*/}
                {/*<i className="fas fa-fw fa-users"/>*/}
                {/*<span>Channels</span>*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*</li>*/}

                {/*<li className={`nav-item ${this.props.router.pathname === "/history" ? " active" : ""}`}>*/}
                {/*<Link prefetch href={user && user.billing_subscription_active ? "history" : "/payment"}>*/}
                {/*<a className="nav-link">*/}
                {/*<i className="fas fa-fw fa-history"/>*/}
                {/*<span>History Page</span>*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*</li>*/}

                {/*<li className={`nav-item ${this.props.router.pathname === "/favorites" ? " active" : ""}`}>*/}
                {/*<Link prefetch href={user && user.billing_subscription_active ? "/favorites" : "/payment"}>*/}
                {/*<a className="nav-link">*/}
                {/*<i className="fas fa-fw fa-heart"/>*/}
                {/*<span>Favorites</span>*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*</li>*/}

                {/*/!*{user ? (user.billing_subscription_active === false && <li className="nav-item">*!/*/}
                {/*/!*<Link prefetch href={"payment"}>*!/*/}
                {/*/!*<a className="nav-link">*!/*/}
                {/*/!*<i className="fas fa-fw fa-dollar-sign"/>*!/*/}
                {/*/!*<span>Upgrade To Premium</span>*!/*/}
                {/*/!*</a>*!/*/}
                {/*/!*</Link>*!/*/}
                {/*/!*</li>) : null}*!/*/}

                {/*<Categories categories={categories}*/}
                {/*billing_subscription_active={user ? user.billing_subscription_active : false}/>*/}

                {/*<li className={`nav-item channel-sidebar-list ${this.props.router.pathname === "/subscriptions" ? " active" : ""}`}>*/}
                {/*<Link prefetch*/}
                {/*href={user && user.billing_subscription_active ? "/subscriptions" : "/payment"}>*/}
                {/*<a className="nav-link"><h6>SUBSCRIPTIONS</h6></a>*/}
                {/*</Link>*/}
                {/*<ul>*/}
                {/*{this.props*/}
                {/*? this.props.user*/}
                {/*? this.props.user.billing_subscription_active*/}
                {/*? this.props.user.my_subscription_users*/}
                {/*? this.props.user.my_subscription_users.map(subscribe => (*/}
                {/*<li key={subscribe.id}>*/}
                {/*<Link prefetch*/}
                {/*href={user.billing_subscription_active ? `/channel?id=${subscribe.id}` : "/payment"}>*/}
                {/*<a href="subscriptions.html">*/}
                {/*<img*/}
                {/*className="img-fluid"*/}
                {/*alt={""}*/}
                {/*src={subscribe.avatar ? API_URL + subscribe.avatar : "/static/img/user.png"}*/}
                {/*/>{" "}*/}
                {/*{subscribe.username ||*/}
                {/*subscribe.email.replace(/@.*$/, "")}*/}
                {/*</a>*/}
                {/*</Link>*/}
                {/*</li>*/}
                {/*))*/}
                {/*: null*/}
                {/*: null*/}
                {/*: null*/}
                {/*: null}*/}
                {/*</ul>*/}
                {/*</li>*/}
                {/*</ul>*/}

                {children}
                {/* /.content-wrapper */}
                {/*</div>*/}
                {/* /#wrapper */}
                {/* Scroll to Top Button*/}
                {/*<a className="scroll-to-top rounded" href="#page-top">
                    <i className="fas fa-angle-up"/>
                </a>*/}
                {/* Logout Modal*/}
                {/*<div*/}
                {/*className="modal fade"*/}
                {/*id="logoutModal"*/}
                {/*tabIndex={-1}*/}
                {/*role="dialog"*/}
                {/*aria-labelledby="exampleModalLabel"*/}
                {/*aria-hidden="true"*/}
                {/*>*/}
                {/*<div*/}
                {/*className="modal-dialog modal-sm modal-dialog-centered"*/}
                {/*role="document"*/}
                {/*>*/}
                {/*<div className="modal-content" style={{color: "#FFF"}}>*/}
                {/*<div className="modal-header">*/}
                {/*<h5 className="modal-title" id="exampleModalLabel">*/}
                {/*Ready to Leave?*/}
                {/*</h5>*/}
                {/*<button*/}
                {/*className="close"*/}
                {/*type="button"*/}
                {/*data-dismiss="modal"*/}
                {/*aria-label="Close"*/}
                {/*>*/}
                {/*<span aria-hidden="true">×</span>*/}
                {/*</button>*/}
                {/*</div>*/}
                {/*<div className="modal-body">*/}
                {/*Select "Logout" below if you are ready to end your current*/}
                {/*session.*/}
                {/*</div>*/}
                {/*<div className="modal-footer">*/}
                {/*<button*/}
                {/*className="btn btn-secondary"*/}
                {/*type="button"*/}
                {/*data-dismiss="modal"*/}
                {/*>*/}
                {/*Cancel*/}
                {/*</button>*/}
                {/*<a className="btn btn-primary" onClick={logout}>*/}
                {/*Logout*/}
                {/*</a>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*/!* Payment Modal*!/*/}
                {/*<div*/}
                {/*className="modal fade"*/}
                {/*id="paymentModal"*/}
                {/*tabIndex={-1}*/}
                {/*role="dialog"*/}
                {/*aria-labelledby="exampleModalLabel"*/}
                {/*aria-hidden="true"*/}
                {/*>*/}
                {/*<div*/}
                {/*className="modal-dialog modal-sm modal-dialog-centered"*/}
                {/*role="document"*/}
                {/*>*/}
                {/*<div className="modal-content" style={{color: "#FFF"}}>*/}
                {/*<div className="modal-header">*/}
                {/*<h5 className="modal-title" id="exampleModalLabel">*/}
                {/*Upgrade to Premium*/}
                {/*</h5>*/}
                {/*<button*/}
                {/*className="close"*/}
                {/*type="button"*/}
                {/*data-dismiss="modal"*/}
                {/*aria-label="Close"*/}
                {/*>*/}
                {/*<span aria-hidden="true">×</span>*/}
                {/*</button>*/}
                {/*</div>*/}
                {/*<div className="modal-body">*/}
                {/*Select "Upgrade" for upgrade to premium.*/}
                {/*</div>*/}
                {/*<div className="modal-footer">*/}
                {/*<button*/}
                {/*className="btn btn-secondary"*/}
                {/*type="button"*/}
                {/*data-dismiss="modal"*/}
                {/*>*/}
                {/*Cancel*/}
                {/*</button>*/}
                {/*<a*/}
                {/*className="btn btn-primary"*/}
                {/*onClick={() => {*/}
                {/*log.trace(this.strip);*/}
                {/*this.strip.current.onClick();*/}
                {/*}}*/}
                {/*>*/}
                {/*Upgrade*/}
                {/*</a>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}

                {/*/!*Unsubscribe modal window*!/*/}
                {/*<div*/}
                {/*className="modal fade"*/}
                {/*id="unsubscribeModal"*/}
                {/*tabIndex={-1}*/}
                {/*role="dialog"*/}
                {/*aria-labelledby="exampleModalLabel"*/}
                {/*aria-hidden="true"*/}
                {/*>*/}
                {/*<div*/}
                {/*className="modal-dialog modal-sm modal-dialog-centered"*/}
                {/*role="document"*/}
                {/*>*/}
                {/*<div className="modal-content" style={{color: "#FFF"}}>*/}
                {/*<div className="modal-header">*/}
                {/*<h5 className="modal-title" id="exampleModalLabel">*/}
                {/*Unsubscribe*/}
                {/*</h5>*/}
                {/*<button*/}
                {/*className="close"*/}
                {/*type="button"*/}
                {/*data-dismiss="modal"*/}
                {/*aria-label="Close"*/}
                {/*>*/}
                {/*<span aria-hidden="true">×</span>*/}
                {/*</button>*/}
                {/*</div>*/}
                {/*<div className="modal-body">*/}
                {/*Select "Unsubscribe" to unsubscribe from premium*/}
                {/*</div>*/}
                {/*<div className="modal-footer">*/}
                {/*<button*/}
                {/*className="btn btn-secondary"*/}
                {/*type="button"*/}
                {/*data-dismiss="modal"*/}
                {/*>*/}
                {/*Cancel*/}
                {/*</button>*/}
                {/*<a*/}
                {/*className="btn btn-primary"*/}
                {/*onClick={*/}
                {/*this.props.cancelSubscription*/}
                {/*}*/}
                {/*>*/}
                {/*Unsubscribe*/}
                {/*</a>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}

                {/*<a hidden="hidden">*/}
                {/*<StripeCheckout*/}
                {/*ref={this.strip}*/}
                {/*token={token => {*/}
                {/*//     log.trace(token);*/}
                {/*apolloClient*/}
                {/*.mutate({*/}
                {/*mutation: gql`*/}
                {/*mutation PURCHASESMutation($stripe_tok_token: String!) {*/}
                {/*purchase(stripe_tok_token: $stripe_tok_token)*/}
                {/*}*/}
                {/*`,*/}
                {/*variables: {*/}
                {/*stripe_tok_token: token.id*/}
                {/*}*/}
                {/*})*/}
                {/*.then(res => location.reload());*/}
                {/*}}*/}
                {/*stripeKey="pk_live_LVNbjdO6jRcQsG5SOqu6lEAn00CwsZ3cWw"*/}
                {/*/>*/}
                {/*</a>*/}
            </>

        );
    }
}

Menu.defaultProps = {
    user: {
        my_subscription_users: []
    }
};


export default withRouter(Menu)
