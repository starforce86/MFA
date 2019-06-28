import Link from 'next/link'
import React from "react"

class AboutPage extends React.Component {
    render() {
        return (
            <>
                <meta charSet="UTF-8"/>
                <meta name="viewport"
                      content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"/>
                <meta httpEquiv="X-UA-Compatible" content="ie=edge"/>
                <title>Welcome to MFA</title>
                {/*    Css Files*/}
                <link rel="stylesheet" href="/static/assets/css/bootstrap.min.css"/>
                <link rel="stylesheet" href="/static/assets/css/magnific-popup.css"/>
                <link rel="stylesheet" href="/static/assets/css/aos.css"/>
                <link rel="stylesheet" href="/static/assets/css/style.css"/>

                <script src="/static/assets/js/jquery-3.4.0.min.js"></script>

                <script src="/static/assets/js/jquery.magnific-popup.js"></script>
                <script src="/static/assets/js/aos.js"></script>
                <script src="/static/assets/js/jquery.smoothscroll.min.js"></script>
                <script src="/static/assets/js/scripts.js"></script>

                <div id="page-container">
                    <div id="main-header">
                        <div className="container-fluid">
                            <div className="row justify-content-between align-items-center">
                                <div className="logo-container">
                                    <div className="logo-inner-container">
                                        <a href="#">
                                            <img src="/static/assets/img/longformblack.png" alt="MFA"/>
                                        </a>
                                    </div>
                                </div>
                                <div className="menu-container">
                                    <ul className="menu">
                                        <li><a href="#second-section"/></li>
                                        <li><a href="#third-section"/></li>
                                        <li><a href="#fourth-section"/></li>
                                        <li><Link prefetch href={"/login"}><a href="/login">Sign In</a></Link></li>
                                    </ul>
                                </div>
                                <div id="menu-btn">
                                    <i className="icofont-navigation-menu"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="main-content">
                        <div id="first-section" className="section"
                             style={{backgroundImage: 'url(https://s3.us-east-2.amazonaws.com/mfa-video-bucket/IMG_6903-min.jpeg)'}}>
                            <video id="myVideo" controls>
                                <source src="https://s3.us-east-2.amazonaws.com/mfa-video-bucket/banner-video.mp4"
                                        type="video/mp4"/>
                            </video>
                            <div className="container banner-content">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="left-content">
                                            <h1><span>Welcome to </span><br/>
                                                MFA
                                            </h1>
                                            <div className="slide-btn cd-headline rotate-1">
                                                <span className="cd-words-wrapper">
                                                  <b className="is-visible">MADE</b>
                                                  <b>FOR</b>
                                                  <b>ARTIST</b>
                                                </span>
                                            </div>
                                        </div>
                                        <span id="video-play" className="popup-youtube">
                                          <i className="icofont-play-alt-2"/>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="container arrow-icon-container">
                                <a href="#second-section">
                                    <i className="icofont-thin-down"/>
                                </a>
                            </div>
                        </div>
                        {/*<div className="section section-text">*/}
                        {/*    <p>Using a field study and turning it into a larger painting in the studio</p>*/}
                        {/*</div>*/}
                        {/*<div id="promo-section" className="section promo-section">*/}
                        {/*    <img src="/static/img/IMG_6903_PROMO.JPG" alt="promo-screen"/>*/}
                        {/*    /!*<img src="/static/img/promo.jpg" alt="promo-screen"/>*!/*/}
                        {/*</div>*/}

                        <div id="second-section" className="section mfa-second-section">
                            <div className="container">
                                <div className="row">
                                    <div className="mfa-hover-wrapper">
                                        <div className="mfa-left-hover-wrap">
                                            <div className="mfa-left-hover-inner mfa-hover-item">
                                                <div className="item learn">
                                                    <h1 className="title">Learn</h1>
                                                    <div className="hover-content">
                                                        <p>access content from an open community of teachers</p>
                                                    </div>
                                                </div>
                                                <div className="item subscription">
                                                    <h1 className="title">Subscribe</h1>
                                                    <div className="hover-content">
                                                        <p>SUBSCRIBE TO YOUR FAVORITE ARTIST AND EDUCATORS FOR
                                                            $29.99/mo. NEVER MISS AN UPDATE</p>
                                                    </div>
                                                </div>
                                                <div className="item stream">
                                                    <h1 className="title">Stream</h1>
                                                    <div className="hover-content">
                                                        <p>For $29.99/mo stream seamlessly In 1080p on our limitless web
                                                            app</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="mfa-middle-hover-wrap">
                                            <div className="mfa-hover-animation-images">
                                                <div className="back-image">
                                                    <img src="/static/assets/img/sec2-Paint-Splatter.png" alt="Paint"/>
                                                </div>
                                                <div className="upper-animate-image">
                                                    <img src="/static/assets/img/sec2-Arrows.png" alt="Arrow"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mfa-right-hover-wrap">
                                            <div className="mfa-right-hover-inner mfa-hover-item">
                                                <div className="item earn">
                                                    <h1 className="title">Earn</h1>
                                                    <div className="hover-content">
                                                        <p>Our profit sharing algorithm turns views into fair income for
                                                            all.</p>
                                                    </div>
                                                </div>
                                                <div className="item share">
                                                    <h1 className="title">Share</h1>
                                                    <div className="hover-content">
                                                        <p>Through our collective success, MFA will allow you to reach a
                                                            larger audience</p>
                                                    </div>
                                                </div>
                                                <div className="item upload">
                                                    <h1 className="title">Upload</h1>
                                                    <div className="hover-content">
                                                        <p>We provide the tools to upload both new and old content from
                                                            home.</p>
                                                    </div>
                                                </div>
                                                <div className="item teach">
                                                    <h1 className="title">Teach</h1>
                                                    <div className="hover-content">
                                                        <p>HOW YOU TEACH IS UP TO YOU— IT’S JUST EASIER WITH MFA</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="third-section" className="section">
                            <div className="container">
                                <div className="middle-white-line">
                                    <div className="line-inner"/>
                                </div>
                                <div className="row timeline-row timeline-right">
                                    <div className="col-sm-6">
                                        <div className="timeline-title-container" data-aos="fade-right"
                                             data-aos-duration={1800}>
                                            <div className="timeline-checkmark">
                                                <h3>1</h3>
                                                <span className="checkmark"/>
                                            </div>
                                        </div>
                                    </div>
                                    {/*                    <div class="col-sm-2"></div>*/}
                                    <div className="col-sm-6">
                                        <div className="timeline-content-container" data-aos="fade-left"
                                             data-aos-duration={1800}>
                                            <div className="timeline-content">It all starts with Quang. Quang will be
                                                making all his previous educational content available as well as a new
                                                video. He will be adding new videos every month.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row timeline-row timeline-left">
                                    <div className="col-sm-6">
                                        <div className="timeline-content-container" data-aos="fade-right"
                                             data-aos-duration={1800}>
                                            <div className="timeline-content">Select guest artists will be featured as
                                                Quang continues to provide monthly installments.
                                            </div>
                                        </div>
                                    </div>
                                    {/*                    <div class="col-sm-2"></div>*/}
                                    <div className="col-sm-6">
                                        <div className="timeline-title-container" data-aos="fade-left"
                                             data-aos-duration={1800}>
                                            <div className="timeline-checkmark">
                                                <span className="checkmark"/>
                                                <h3>2</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row timeline-row timeline-right">
                                    <div className="col-sm-6">
                                        <div className="timeline-title-container" data-aos="fade-right"
                                             data-aos-duration={1800}>
                                            <div className="timeline-checkmark">
                                                <h3>3</h3>
                                                <span className="checkmark"/>
                                            </div>
                                        </div>
                                    </div>
                                    {/*                    <div class="col-sm-2"></div>*/}
                                    <div className="col-sm-6">
                                        <div className="timeline-content-container" data-aos="fade-left"
                                             data-aos-duration={1800}>
                                            <div className="timeline-content">Partnered Artist will be invited to begin
                                                uploading content autonomously.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row timeline-row timeline-left">
                                    <div className="col-sm-6">
                                        <div className="timeline-content-container" data-aos="fade-right"
                                             data-aos-duration={1800}>
                                            <div className="timeline-content">Open access for all to use and benefit
                                                from the MFA platform.
                                            </div>
                                        </div>
                                    </div>
                                    {/*                    <div class="col-sm-2"></div>*/}
                                    <div className="col-sm-6">
                                        <div className="timeline-title-container" data-aos="fade-left"
                                             data-aos-duration={1800}>
                                            <div className="timeline-checkmark">
                                                <span className="checkmark"/>
                                                <h3>4</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="jumbotron jumbotron-fluid" style={{backgroundColor: "#bc1e3e"}}>
                            <h1 className="title p-3" style={{color: "black"}}>Featured Content</h1>
                            <div className="row container">
                                <div className="col">
                                    <div className="shadow card md-4 p-1 mx-1 card-custom"
                                         style={{backgroundColor: "black", color: "white"}}>
                                        <Link href={"/register"}>
                                            <a>
                                                <img src="/static/img/IMG_6903_PROMO.JPG" className="card-img-top"
                                                     alt="Field Image"/>
                                            </a>
                                        </Link>
                                        <div className="card-body">
                                            <p className="card-text">Using a field study and turning it into a larger
                                                painting in the studio.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="shadow card md-4 p-1 mx-1 card-custom"
                                         style={{backgroundColor: "black", color: "white"}}>

                                        <Link href={"/register"}>
                                            <a><img src="/static/img/NowyoucanwatchtheessentialsofNutsBolts.jpg"
                                                    className="card-img-top" alt="Field Image"/>
                                            </a>
                                        </Link>
                                        <div className="card-body">
                                            <p className="card-text">Now you can watch all of the essentials of Quang's
                                                popular video "Nuts and Bolts".</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="shadow card md-4 p-1 mx-1 card-custom"
                                         style={{backgroundColor: "black", color: "white"}}>
                                        <Link href={"/register"}>
                                            <a>
                                                <img src="/static/img/_Painting_.jpg" className="card-img-top"
                                                     alt="Field Image"/>
                                            </a>
                                        </Link>
                                        <div className="card-body">
                                            <p className="card-text">Painting the figure from life focusing a rich tonal
                                                arrangement.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<div className="section section-text">*/}
                        {/*    <p>Painting the figure from life focusing a rich tonal arrangement.</p>*/}
                        {/*</div>*/}
                        {/*<div id="promo-section" className="section promo-section">*/}
                        {/*    <img src="/static/img/NowyoucanwatchtheessentialsofNutsBolts.jpg" alt="promo-screen"/>*/}
                        {/*    /!*<img src="/static/img/promo.jpg" alt="promo-screen"/>*!/*/}
                        {/*</div>*/}

                        {/*<div className="section section-text">*/}
                        {/*    <p>Now you can watch all of the essentials of Quang's popular video "Nuts and Bolts".</p>*/}
                        {/*</div>*/}
                        {/*<div id="promo-section" className="section promo-section">*/}
                        {/*    <img src="/static/img/_Painting_.jpg" alt="promo-screen"/>*/}
                        {/*    /!*<img src="/static/img/promo.jpg" alt="promo-screen"/>*!/*/}
                        {/*</div>*/}
                        <div id="fourth-section" className="section mfa-forth-section"
                             style={{backgroundImage: 'url(/static/assets/img/Man-Image1sssnewww-min.png)'}}>
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-5 col-sm-12">
                                        <div className="forth-text forth-text-left">
                                            <p>Quang Ho (b. 1963) is a Vietnamese-American artist based in Denver, CO.
                                                He Immigrated to the United States in 1975 and began his artistic
                                                pursuits at an early age. Ho attended the Colorado Institute of Art
                                                where he studied painting under Rene Bruhin, whom he credits with
                                                developing the foundation for his artistic understanding. His paintings
                                                have been featured in solo gallery exhibitions in the U.S. and abroad
                                                and in Museums such as The Booth Museum and the Woolaroc Museum. He has
                                                been featured in international art publications.&nbsp;&nbsp;He is
                                                regarded as a prolific American master and an influential teacher. His
                                                work hangs in private and corporate collections around the world.</p>
                                        </div>
                                    </div>
                                    <div className="col-lg-2">
                                        <div className="section-forth-image">
                                            <img src="/static/assets/img/forth-men-image2-min.png" alt="Quang Ho"/>
                                        </div>
                                    </div>
                                    <div className="col-lg-5 col-sm-12">
                                        <div className="forth-text forth-text-right">
                                            <p>Ho’s work has been recognized and awarded with top honors from
                                                organizations such as the Portrait Society of America and Oil Painters
                                                of America; The Artists of America and Salon De Arts
                                                exhibitions.&nbsp;His subject matter ranges from still-life, landscapes,
                                                interiors, and figurative to abstractions. "Subject matter is not
                                                entirely the point of it to me. I can find visual excitement all around
                                                me but it’s the interaction of the visual dialogue that happens on the
                                                canvas that matters most.&nbsp;&nbsp;from a knot on a tree, graceful
                                                limp of a flower wilting, to a juxtaposition of a few simple shapes and
                                                colors...inspirations are inexhaustible."</p>
                                        </div>
                                    </div>
                                    <div className="forth-mobile-image">
                                        <img src="/static/assets/img/forth-men-image2-min.png" alt="Quang Ho"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer">

                        {/*<div className="logo-container">*/}
                        {/*<div className="logo-inner-container">*/}
                        {/*<a href="#">*/}
                        {/*<img src="/static/assets/img/longformblack.png" alt="MFA"/>*/}
                        {/*</a>*/}
                        {/*</div>*/}
                        {/*</div>*/}


                        <Link prefetch href={"/register"}><a href="/register">Buy Our $29.99/mo Subscription Today!</a></Link>


                    </div>
                </div>
                {/*    jQuery*/}
                {/*    Javascript*/}

            </>
        )
    }
}

export default AboutPage
