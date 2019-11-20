import {Component} from "react";
import Router from "next/router";
import nextCookie from "next-cookies";
import cookie from "js-cookie";
import logger from "./logger";

const EXPIRES_DAYS = 30;
const log = logger('Auth');

export const login = async ({user, token}) => {
    if (token && user) {

        cookie.set("token", token, {expires: EXPIRES_DAYS});
        // cookie.set('user', user, {expires: EXPIRES_DAYS})
        cookie.set("id", user.id, {expires: EXPIRES_DAYS});
        Router.push('/hacky', "/");
        //
        // if (user.billing_subscription_active) {
        //     Router.push('/hacky', "/");
        // } else {
        //     Router.push("/payment")
        // }
    }
};

export const register = async ({user, token}) => {
  //  log.trace("register", token, user);
    if (token && user) {
        cookie.set("token", token, {expires: EXPIRES_DAYS});
        cookie.set("id", user.id, {expires: EXPIRES_DAYS});

        Router.push("/");
    }
};

export const logout = () => {
    cookie.remove("token");
    cookie.remove("user");
    cookie.remove("billing_subscription");

    // to support logging out from all windows
    window.localStorage.setItem("logout", Date.now());
    Router.push('/hacky', "/");
};

// Gets the display name of a JSX component for dev tools
const getDisplayName = Component =>
    Component.displayName || Component.name || "Component";

export const withAuthSync = WrappedComponent =>
    class extends Component {
        static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;

        constructor(props) {
            super(props);

            this.syncLogout = this.syncLogout.bind(this);
        }

        static async getInitialProps(ctx) {
            const {token, id} = auth(ctx);
            //console.log(token, id)
            const componentProps =
                WrappedComponent.getInitialProps &&
                (await WrappedComponent.getInitialProps(ctx));

            return {...componentProps, token, id};
        }

        componentDidMount() {
            window.addEventListener("storage", this.syncLogout);
        }

        componentWillUnmount() {
            window.removeEventListener("storage", this.syncLogout);
            window.localStorage.removeItem("logout");
        }

        syncLogout(event) {
            if (event.key === "logout") {
               // log.trace("logged out from storage!");
                Router.push("/");
            }
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

export const auth = ctx => {
    //log.trace("auth>ktx", ctx);

    const {token} = nextCookie(ctx);
    const {id} = nextCookie(ctx);
    const {billing_subscription} = nextCookie(ctx);

    //log.trace("auth>>>>>>", token);

    /*
     * This happens on server only, ctx.req is available means it's being
     * rendered on server. If we are on server and token is not available,
     * means user is not logged in.
     */
/*
    if (ctx.req && !token ) {
        if ( ctx.req.url === "/") {
            //ctx.res.end();
            return {token, id};
        }
        ctx.res.writeHead(302, {Location: "/"});
        ctx.res.end();
        return ;
    }
*/


    //We already checked for server. This should only happen on client.
    // if (!token) {
    //     log.trace("go to login");
    //     Router.push('hacky', "/");
    //
    // }

    return {token, id};
};

export const UserContext = React.createContext();

export function withUser(Component) {
    return function ConnectedComponent(props) {
        return (
            <UserContext.Consumer>
                {({user, token, id, isPurchaseActive, isPayExpiredForVideo}) => (
                    <Component
                        {...props}
                        user={user}
                        token={token}
                        id={id}
                        isPurchaseActive={isPurchaseActive}
                        isPayExpiredForVideo={isPayExpiredForVideo}
                    />
                )}
            </UserContext.Consumer>
        );
    };
}
