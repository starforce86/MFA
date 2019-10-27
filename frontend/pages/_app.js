import React from "react";
import App, {Container} from "next/app";
import { Provider } from 'react-redux';
import withReduxStore from '../src/redux/lib/with-redux-store';
import Helmet from "react-helmet";
import {ApolloProvider, Query} from "react-apollo";
import withApollo from "../src/util/withApollo";
import logger from '../src/util/logger';
import {logout, UserContext} from "../src/util/auth";
import Link from 'next/link'
import * as consts from "../src/util/consts";
import {STRIPE_KEY} from "../src/util/consts";
import Categories from "../src/components/menu/categories";
import gql from "graphql-tag";
import SubscribePlan from "../src/components/stripe/SubscribePlan";
import {Elements, StripeProvider} from "react-stripe-elements";
import Router from 'next/router';
import trackPageView from '../src/util/helper';

const log = logger('App');

log.debug(`API_URL: ${consts.API_URL}`);

const MENU_QUERY = gql`
    query AppQuery($id: ID!) {
        user: user(where: { id: $id }) {
            id
            email
            firstname
            lastname
            username
            avatar
            role
            billing_subscription_active
            my_subscription_users {
                id
                avatar
                email
                username
            }
        }
        isPurchaseActive: isPurchaseActive
        categories: categories {
            id
            title
        }
    }
`;

const PURCHASE = gql`
    mutation Purchase($token: String!, $plan: StripePlan!) {
        purchase(stripe_tok_token: $token, plan: $plan)
    }
`;

class MyApp extends App {

    state = {
        stripe: null,
        plan: "MONTHLY"
    };

    getTokenFn = null;

    constructor(props) {
        super(props);
        this.strip = React.createRef();
    }

    componentDidMount() {
        this.setState({stripe: window.Stripe(STRIPE_KEY)});
        Router.onRouteChangeComplete = url => {
            trackPageView(url);
        };
    }

    static async getInitialProps({Component, ctx}) {
        let pageProps = {};

        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }

        const {token, id} = pageProps;

        // log.trace("gip", token);
        if (token) {
            return {pageProps, token, id};
        } else {
            return {pageProps};
        }
        // return { pageProps };
    }

    render() {
        const {Component, pageProps, reduxStore, id, apolloClient, token} = this.props;
        const currentPage = this.props.router.pathname;
        if (currentPage === '/login' || currentPage === '/forgotPassword' || currentPage === '/register' || currentPage === '/reset') {
            return (
                <Container>
                    <Provider store={reduxStore}>
                        <ApolloProvider client={apolloClient}>
                            <Helmet
                                htmlAttributes={{ lang: "en" }}
                                meta={[
                                    {
                                        name: "viewport",
                                        content: "width=device-width, initial-scale=1"
                                    },
                                    { property: "og:title", content: "artists" }
                                ]}
                            />
                            <Query
                                fetchPolicy={"cache-and-network"}
                                variables={{ id: this.props.id ? this.props.id : "" }}
                                query={MENU_QUERY}
                            >
                                {({ data, error }) => {
                                    //       log.trace("data", error);
                                    log.trace("dataerr", { data, error });
                                    const user = data ? data.user : null;
                                    const categories = data ? data.categories : [];

                                    const isPurchaseActive = data ? data.isPurchaseActive : false;

                                    // this.setState({isPurchaseActive})
                                    // log.trace("_app", isPurchaseActive);
                                    // log.trace("_app", user);
                                    return (
                                        <UserContext.Provider
                                            value={{ user, isPurchaseActive, id, token }}
                                        >
                                            <Component {...pageProps} />

                                        </UserContext.Provider>
                                    );
                                }}
                            </Query>
                        </ApolloProvider>
                    </Provider>
                    
                </Container>

            )
        }

        const propsId = this.props ? this.props.id ? this.props.id : '' : '';

        return (
            <Container>
                <Provider store={reduxStore}>
                    <ApolloProvider client={apolloClient}>
                        <Helmet
                            htmlAttributes={{ lang: "en" }}
                            meta={[
                                {
                                    name: "viewport",
                                    content: "width=device-width, initial-scale=1"
                                },
                                { property: "og:title", content: "artists" }
                            ]}
                        />
                        <Query
                            errorPolicy={"ignore"}
                            fetchPolicy={"cache-and-network"}
                            variables={{ id: propsId }}
                            query={MENU_QUERY}
                        >
                            {({ data, error }) => {
                                //       log.trace("data", error);

                                log.trace('MENU_QUERY:', { data, error });
                                const user = data ? data.user : null;
                                const categories = data ? data.categories : [];

                                const isPurchaseActive = data ? data.isPurchaseActive : false;

                                // log.trace("_app", isPurchaseActive);
                                // log.trace("_app", user);
                                //  if (!isPurchaseActive && process.browser && window.location.href.indexOf('/payment'>=0))
                                //      return ( <UserContext.Provider
                                //      value={{user, isPurchaseActive, id, token}}
                                //  >
                                //      <Component {...pageProps} />
                                //
                                //  </UserContext.Provider>)
                                return (
                                    <UserContext.Provider
                                        value={{ user, isPurchaseActive, id, token }}
                                    >
                                        {/*menu*/}
                                        <div className="sticky-top">
                                            {/* {!user &&
                                                <div className="subscribe-banner" onClick={() => {
                                                    this.props.router.push("/login");
                                                }}>
                                                    <span style={{ color: "white" }}>Subscribe for $29.99/mo or $300.00/yr today to stream all content!</span>
                                                </div>
                                            } */}
                                            <nav
                                                className="navbar navbar-expand navbar-light bg-white static-top osahan-nav sticky-top">
                                                &nbsp;&nbsp;
                                            <button
                                                    //order-1
                                                    className="btn btn-link btn-sm text-secondary order-sm-0"
                                                    id="sidebarToggle"
                                                >
                                                    <i className="fas fa-bars" />
                                                </button>
                                                &nbsp;&nbsp;
                                            <Link prefetch href={"/"}>
                                                    <a className="menu-logo navbar-brand mr-1">
                                                        <img className="img-fluid" src="/static/assets/img/Logo.png" />
                                                        <span className="menu-logo__text">MADE FOR ARTISTS</span>
                                                    </a>
                                                </Link>
                                                {/* Navbar Search */}
                                                <form action="/" method="get"
                                                    // d-none d-md-inline-block
                                                    className="  form-inline ml-auto mr-0 mr-md-5 my-2 my-md-0 osahan-navbar-search">
                                                    <div className="input-group">
                                                        <input
                                                            style={{ color: "#FFF" }}
                                                            name="search"
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Search for..."
                                                        />
                                                        <div className="input-group-append">
                                                            <input type="submit" className="btn btn-light" value="Search" />
                                                        </div>
                                                    </div>
                                                </form>
                                                {/* Navbar */}
                                                <ul className="navbar-nav ml-auto ml-md-0 no-text-transform">

                                                    {user ? (
                                                        <li className="nav-item dropdown no-arrow osahan-right-navbar-user">
                                                            <a
                                                                className="nav-link dropdown-toggle user-dropdown-link"
                                                                href="#"
                                                                id="userDropdown"
                                                                role="button"
                                                                data-toggle="dropdown"
                                                                aria-haspopup="true"
                                                                aria-expanded="false"
                                                            >
                                                                <img
                                                                    alt="Avatar"
                                                                    src={user.avatar ? `${consts.API_URL}${user.avatar}` : "/static/img/user.png"}
                                                                />
                                                                <span>{user.username || user.email}</span>
                                                            </a>
                                                            <div
                                                                className="dropdown-menu dropdown-menu-right"
                                                                aria-labelledby="userDropdown"
                                                            >
                                                                <Link prefetch href="/settings">
                                                                    <a className="dropdown-item">
                                                                        <i className="fas fa-fw fa-cog" /> &nbsp; Account
                                                                </a>
                                                                </Link>
                                                                <Link prefetch
                                                                    href={"/subscriptions"}>
                                                                    <a className="dropdown-item" style={{backgroundColor: '#bc1e3e'}}>
                                                                        <i className="fas fa-fw fa-video" /> &nbsp; Subscriptions
                                                                </a>
                                                                </Link>
                                                                <div className="dropdown-divider" />
                                                                <a
                                                                    className="dropdown-item"
                                                                    href="#"
                                                                    data-toggle="modal"
                                                                    data-target="#logoutModal"
                                                                >
                                                                    <i className="fas fa-fw fa-sign-out-alt" /> &nbsp; Logout
                                                            </a>
                                                            </div>

                                                        </li>
                                                    ) : (
                                                            <li className="nav-item mx-1">
                                                                <Link prefetch href={"/login"}>
                                                                    <a className="nav-link">SignIn</a>
                                                                </Link>
                                                            </li>
                                                        )}
                                                </ul>
                                            </nav>
                                        </div>
                                        <div id="wrapper">
                                            {/* Sidebar */}
                                            <ul className="sidebar navbar-nav">
                                                <li className={`nav-item ${this.props.router.pathname === "/" ? " active" : ""}`}>
                                                    <Link prefetch href={"/"}>
                                                        <a className="nav-link" onClick={() => {
                                                            document.location = "/"
                                                        }}>
                                                            <i className="fas fa-fw fa-home" />
                                                            <span>Home</span>
                                                        </a>
                                                    </Link>
                                                </li>
                                                <li className={`nav-item ${this.props.router.pathname === "/about" ? " active" : ""}`}>
                                                    <Link prefetch href={"/about"}>
                                                        <a className="nav-link">
                                                            <i className="fas fa-fw fa-info" />
                                                            <span>About Us</span>
                                                        </a>
                                                    </Link>
                                                </li>
                                                <li className={`nav-item ${this.props.router.pathname === "/artists" ? " active" : ""}`}>
                                                    <Link prefetch href={"/artists"}>
                                                        <a className="nav-link">
                                                            <i className="fas fa-fw fa-users" />
                                                            <span>Artists</span>
                                                        </a>
                                                    </Link>
                                                </li>

                                                {
                                                    user ?
                                                        <li className={`nav-item ${this.props.router.pathname === "/history" ? " active" : ""}`}>
                                                            <Link prefetch href={"history"}>
                                                                <a className="nav-link">
                                                                    <i className="fas fa-fw fa-history" />
                                                                    <span>History Page</span>
                                                                </a>
                                                            </Link>
                                                        </li>
                                                        : null
                                                }

                                                {
                                                    user ?
                                                        <li className={`nav-item ${this.props.router.pathname === "/favorites" ? " active" : ""}`}>
                                                            <Link prefetch href={"/favorites"}>
                                                                <a className="nav-link">
                                                                    <i className="fas fa-fw fa-heart" />
                                                                    <span>Favorites</span>
                                                                </a>
                                                            </Link>
                                                        </li>
                                                        : null
                                                }

                                                <Categories categories={categories}
                                                    billing_subscription_active={true} />

                                                <li className={`nav-item ${this.props.router.pathname === "/news" ? " active" : ""}`}>
                                                    <Link prefetch href={"news"}>
                                                        <a className="nav-link">
                                                            <i className="fas fa-fw fa-newspaper" />
                                                            <span>News</span>
                                                        </a>
                                                    </Link>
                                                </li>

                                                <li className={`nav-item ${this.props.router.pathname === "/curriculum" ? " active" : ""}`}>
                                                    <Link prefetch href={"curriculum"}>
                                                        <a className="nav-link">
                                                            <i className="fas fa-fw fa-book-reader" />
                                                            <span>Curriculum</span>
                                                        </a>
                                                    </Link>
                                                </li>

                                                {user && (user.role == "USER_PUBLISHER" || user.role == "ADMIN") && (
                                                    <li className={`nav-item ${this.props.router.pathname === "/myVideo" ? " active" : ""}`}>
                                                        <Link prefetch href={"myVideo"}>
                                                            <a className="nav-link">
                                                                <i className="fas fa-fw fa-upload" />
                                                                <span>My Videos</span>
                                                            </a>
                                                        </Link>
                                                    </li>
                                                )}

                                                {user && (user.role == "USER_PUBLISHER" || user.role == "ADMIN") && (
                                                    <li className={`nav-item ${this.props.router.pathname === "/analytics" ? " active" : ""}`}>
                                                        <Link prefetch href={"analytics"}>
                                                            <a className="nav-link">
                                                                <i className="fas fa-fw fa-chart-line" />
                                                                <span>Analytics</span>
                                                            </a>
                                                        </Link>
                                                    </li>
                                                )}

                                                {user && (user.role == "ADMIN") && (
                                                    <li className={`nav-item ${this.props.router.pathname === "/profit" ? " active" : ""}`}>
                                                        <Link prefetch href={"profit"}>
                                                            <a className="nav-link">
                                                                <i className="fas fa-fw fa-money-bill-alt" />
                                                                <span>Profit Sharing</span>
                                                            </a>
                                                        </Link>
                                                    </li>
                                                )}

                                                {
                                                    user ?
                                                        <li className={`nav-item channel-sidebar-list ${this.props.router.pathname === "/subscriptions" ? " active" : ""}`}>
                                                            <Link prefetch
                                                                href={"/subscriptions"}>
                                                                <a className="nav-link"><h6>Following</h6></a>
                                                            </Link>
                                                            <ul>
                                                                {
                                                                    user
                                                                        // ? user.billing_subscription_active
                                                                        ? user.my_subscription_users
                                                                            ? user.my_subscription_users.map(subscribe => (
                                                                                <li key={subscribe.id}>
                                                                                    <Link prefetch
                                                                                        href={`/artist?id=${subscribe.id}`}>
                                                                                        <a href="subscriptions.html">
                                                                                            <img
                                                                                                className="img-fluid"
                                                                                                alt={""}
                                                                                                src={subscribe.avatar ? consts.API_URL + subscribe.avatar : "/static/img/user.png"}
                                                                                            />{" "}
                                                                                            {subscribe.username ||
                                                                                                subscribe.email.replace(/@.*$/, "")}
                                                                                        </a>
                                                                                    </Link>
                                                                                </li>
                                                                            ))
                                                                            : null
                                                                        // : null
                                                                        : null
                                                                }
                                                            </ul>
                                                        </li>
                                                        : null
                                                }

                                            </ul>


                                            <Component {...pageProps} />
                                        </div>
                                        <div
                                            className="modal fade"
                                            id="logoutModal"
                                            tabIndex={-1}
                                            role="dialog"
                                            aria-labelledby="exampleModalLabel"
                                            aria-hidden="true"
                                        >
                                            <div
                                                className="modal-dialog modal-sm modal-dialog-centered"
                                                role="document"
                                            >
                                                <div className="modal-content" style={{ color: "#FFF" }}>
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLabel">
                                                            Ready to Leave?
                                                    </h5>
                                                        <button
                                                            className="close"
                                                            type="button"
                                                            data-dismiss="modal"
                                                            aria-label="Close"
                                                        >
                                                            <span aria-hidden="true">×</span>
                                                        </button>
                                                    </div>
                                                    <div className="modal-body">
                                                        Select "Logout" below if you are ready to end your current
                                                        session.
                                                </div>
                                                    <div className="modal-footer">
                                                        <button
                                                            className="btn btn-secondary"
                                                            type="button"
                                                            data-dismiss="modal"
                                                        >
                                                            Cancel
                                                    </button>
                                                        <a className="btn btn-primary" onClick={logout}>
                                                            Logout
                                                    </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Payment Modal*/}
                                        <div
                                            className="modal fade"
                                            id="paymentModal"
                                            tabIndex={-1}
                                            role="dialog"
                                            aria-labelledby="exampleModalLabel"
                                            aria-hidden="true"
                                        >
                                            <div
                                                className="modal-dialog modal-sm modal-dialog-centered"
                                                role="document"
                                            >
                                                <div className="modal-content" style={{ color: "#FFF" }}>
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLabel">
                                                            Subscribe to MFA
                                                    </h5>
                                                        <br />

                                                        <button
                                                            className="close"
                                                            type="button"
                                                            data-dismiss="modal"
                                                            aria-label="Close"
                                                        >
                                                            <span aria-hidden="true">×</span>
                                                        </button>
                                                    </div>

                                                    {user ?

                                                        <div className="modal-body">
                                                            <p>To join made for artists and gain access to our complete, and
                                                                ever-growing video library, press subscribe below and follow
                                                            the instructions.</p>
                                                            <p>By checking the button below, you agree to our Terms of Use,
                                                                Privacy Statement, and that you are over 18. The service
                                                                will automatically continue your membership monthly until
                                                            you cancel.</p>
                                                            <StripeProvider stripe={this.state.stripe}>
                                                                <Elements>
                                                                    <SubscribePlan
                                                                        ref={el => this.stripeTokenProvider = el}
                                                                        getToken={getTokenFn => this.getTokenFn = getTokenFn} />
                                                                </Elements>
                                                            </StripeProvider>

                                                            <div style={{ marginTop: 10 }}>
                                                                <input type="radio" id="plan"
                                                                    name="plan" value="MONTHLY" onChange={() => {
                                                                        this.setState({ plan: "MONTHLY" })
                                                                    }} checked={this.state.plan === "MONTHLY"} />
                                                                <label htmlFor="contactChoice2"
                                                                    style={{ marginLeft: 10 }}>$29.99/month</label>
                                                            </div>
                                                            <div>
                                                                <input type="radio" id="plan"
                                                                    name="plan" value="YEARLY" onChange={() => {
                                                                        this.setState({ plan: "YEARLY" })
                                                                    }} checked={this.state.plan === "YEARLY"} />
                                                                <label htmlFor="contactChoice2"
                                                                    style={{ marginLeft: 10 }}>$300.00/year</label>
                                                            </div>
                                                        </div>

                                                        : <div className="modal-body">
                                                            <p>To join made for artists and gain access to our complete, and
                                                                ever-growing video library, press subscribe below and follow
                                                            the instructions.</p>
                                                            <p>By checking the button below, you agree to our Terms of Use,
                                                                Privacy Statement, and that you are over 18. The service
                                                                will automatically continue your membership monthly until
                                                            you cancel.</p>
                                                        </div>}

                                                    <div className="modal-footer">
                                                        <button
                                                            className="btn btn-secondary"
                                                            type="button"
                                                            data-dismiss="modal"
                                                        >
                                                            Cancel
                                                    </button>
                                                        <a
                                                            className="btn btn-primary"
                                                            onClick={async () => {
                                                                log.trace(this.strip);
                                                                if (!user) {
                                                                    $('#paymentModal').modal('hide');
                                                                    return this.props.router.push("/register");
                                                                }
                                                                const token = await this.getTokenFn();
                                                                if (!token) return;
                                                                try {
                                                                    const purchaseResult = await apolloClient.mutate({
                                                                        mutation: PURCHASE,
                                                                        variables: {
                                                                            token: token.id,
                                                                            plan: this.state.plan
                                                                        }
                                                                    });
                                                                    if (purchaseResult.errors) {
                                                                        alert(JSON.stringify(purchaseResult.errors));
                                                                        log.trace(purchaseResult)
                                                                    }
                                                                } catch (error) {
                                                                    log.trace(error);
                                                                    alert(JSON.stringify(error));
                                                                }
                                                                location.reload();
                                                            }}
                                                        >
                                                            Subscribe
                                                    </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/*Unsubscribe modal window*/}
                                        <div
                                            className="modal fade"
                                            id="unsubscribeModal"
                                            tabIndex={-1}
                                            role="dialog"
                                            aria-labelledby="exampleModalLabel"
                                            aria-hidden="true"
                                        >
                                            <div
                                                className="modal-dialog modal-sm modal-dialog-centered"
                                                role="document"
                                            >
                                                <div className="modal-content" style={{ color: "#FFF" }}>
                                                    <div className="modal-header">
                                                        <h5 className="modal-title" id="exampleModalLabel">
                                                            Unsubscribe
                                                    </h5>
                                                        <button
                                                            className="close"
                                                            type="button"
                                                            data-dismiss="modal"
                                                            aria-label="Close"
                                                        >
                                                            <span aria-hidden="true">×</span>
                                                        </button>
                                                    </div>
                                                    <div className="modal-body">
                                                        Select "Unsubscribe" to unsubscribe from premium
                                                </div>
                                                    <div className="modal-footer">
                                                        <button
                                                            className="btn btn-secondary"
                                                            type="button"
                                                            data-dismiss="modal"
                                                        >
                                                            Cancel
                                                    </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={async () => {
                                                                const CANCEL_SUBSCRIPTION = gql`
                                                                    mutation CancelSubscriptionMutation {
                                                                        delete_subscription
                                                                    }
                                                                `;

                                                                try {
                                                                    const res = await this.props.apolloClient.mutate({
                                                                        mutation: CANCEL_SUBSCRIPTION
                                                                    });

                                                                    location.reload();
                                                                } catch (e) {
                                                                    alert('Error: ' + e.message);
                                                                    log.error('Cancel purchase error:', e);
                                                                }
                                                            }}
                                                        >
                                                            Unsubscribe
                                                    </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </UserContext.Provider>
                                );
                            }}
                        </Query>
                    </ApolloProvider>
                </Provider>
            </Container>
        );
    }
}

MyApp.defaultValues = {
    id: "42"
};
export default withApollo(withReduxStore(MyApp));
