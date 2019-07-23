import Document, {Head, Html, Main, NextScript} from 'next/document';

export default class extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx);
        return {...initialProps};
    }

    render() {
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
