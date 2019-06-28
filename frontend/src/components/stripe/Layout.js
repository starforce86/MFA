import PropTypes from 'prop-types';
import Head from 'next/head';
import * as consts from "../../util/consts";

const Layout = props => (
    <div>
        <Head>
            <title>Subscription </title>
            <script
                src="https://checkout.stripe.com/checkout.js" class="stripe-button"
                data-key={consts.STRIPE_KEY}
                data-amount="0"
                data-name="Demo Site"
                data-description="Example charge"
                data-image="https://i.ytimg.com/vi/InkWIPUFVdM/maxresdefault.jpg"
                data-locale="auto">
            </script>
            <style>{`
         html {
           height: 100%;
           background: #F6F8FA;
         }
         #container {
           font-family: BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
           color: #4C555A;
           min-height: 100%;
           text-align: center;
           -webkit-font-smoothing: antialiased;
         }
         a {
           color: #00a3da;
         }
         a:hover {
           background-color: #fff2a8;
         }
      `}</style>
        </Head>
        <div id="container">
            {props.children}
        </div>
    </div>
);

Layout.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
};

export default Layout;
