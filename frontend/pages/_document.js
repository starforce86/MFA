import Document, {Head, Html, Main, NextScript} from 'next/document';
import { Fragment } from 'react';

export default class extends Document {
    static async getInitialProps(ctx) {
        const isProduction = process.env.NODE_ENV === 'production';
        const initialProps = await Document.getInitialProps(ctx);
        return {...initialProps, isProduction};
    }

    setGoogleTags() {
        return {
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-144912865-1');
          `
        };
    }

    render() {
        const { isProduction } = this.props;
        return (
            <Html>
                <Head>
                    <meta charset="utf-8"/>
                    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
                    <link rel="icon" type="image/png" href="/static/img/favicon.png"/>
                    <link href="/static/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
                    <link href="/static/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css"/>
                    <link href="/static/css/osahan.css" rel="stylesheet"/>
                    <link rel="stylesheet" href="/static/vendor/owl-carousel/owl.carousel.css"/>
                    <link rel="stylesheet" href="/static/vendor/owl-carousel/owl.theme.css"/>
                    <link rel="stylesheet" href="/static/fonts/futura/stylesheet.css"/>
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>

                    <script src="https://js.stripe.com/v3/"></script>
                </Head>
                <body>
                <Main/>
                <NextScript/>
                    {isProduction && (
                        <Fragment>
                            <script
                                async
                                src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXXX-X"
                            />
                            {/* We call the function above to inject the contents of the script tag */}
                            <script dangerouslySetInnerHTML={this.setGoogleTags()} />
                        </Fragment>
                    )}
                <script src="/static/vendor/jquery/jquery.min.js"></script>
                <script src="/static/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
                <script src="/static/vendor/jquery-easing/jquery.easing.min.js"></script>
                <script src="/static/vendor/owl-carousel/owl.carousel.js"></script>

                <script src="/static/js/custom.js"></script>

                </body>
            </Html>
        )
    }
}
