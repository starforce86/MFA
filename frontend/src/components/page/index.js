import Link from 'next/link'
import {logout} from '../../util/auth'
import withApollo from "../../util/withApollo";

const Page = ({user, children}) => <>

    <nav className="navbar navbar-expand navbar-light bg-white static-top osahan-nav sticky-top">
        &nbsp;&nbsp;
        <button className="btn btn-link btn-sm text-secondary order-1 order-sm-0" id="sidebarToggle">
            <i className="fas fa-bars"/>
        </button>
        &nbsp;&nbsp;
        <Link prefetch href="/">
            <a className="navbar-brand mr-1"><img className="img-fluid" alt
                                                  src="/static/img/Logo.png"/></a></Link>
        {/* Navbar Search */}
        <form className="d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-5 my-2 my-md-0 osahan-navbar-search">
            <div className="input-group">
                <input type="text" className="form-control" placeholder="Search for..."/>
                <div className="input-group-append">
                    <button className="btn btn-light" type="button">
                        <i className="fas fa-search"/>
                    </button>
                </div>
            </div>
        </form>
        {/* Navbar */}
        <ul className="navbar-nav ml-auto ml-md-0 osahan-right-navbar">


            <li className="nav-item dropdown no-arrow osahan-right-navbar-user">
                <a className="nav-link dropdown-toggle user-dropdown-link" href="#" id="userDropdown" role="button"
                   data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img alt="Avatar" src="/static/img/user.png"/>
                    Osahan
                </a>
                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                    <a className="dropdown-item" href="account.html">
                        <i className="fas fa-fw fa-user-circle"/> &nbsp; My Account</a>
                    <a className="dropdown-item" href="subscriptions.html"><i
                        className="fas fa-fw fa-video"/> &nbsp; Subscriptions</a>
                    <Link prefetch href="/settings">
                        <a className="dropdown-item"><i className="fas fa-fw fa-cog"/> &nbsp; Settings</a></Link>
                    <div className="dropdown-divider"/>
                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#logoutModal"><i
                        className="fas fa-fw fa-sign-out-alt"/> &nbsp; Logout</a>
                </div>
            </li>
        </ul>
    </nav>
    <div id="wrapper">
        {/* Sidebar */}
        <ul className="sidebar navbar-nav">
            <li className="nav-item active">
                <Link prefetch href={"/"}>
                    <a className="nav-link">
                        <i className="fas fa-fw fa-home"/>
                        <span>Home</span>
                    </a>
                </Link>
            </li>
            <li className="nav-item">
                <Link prefetch href={"/artists"}>

                    <a className="nav-link">
                        <i className="fas fa-fw fa-users"/>
                        <span>Channels</span>
                    </a>
                </Link>
            </li>

            <li className="nav-item">
                <a className="nav-link" href="history">
                    <i className="fas fa-fw fa-history"/>
                    <span>History Page</span>
                </a>
            </li>

            <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="categories.html" role="button" data-toggle="dropdown"
                   aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-fw fa-list-alt"/>
                    <span>Categories</span>
                </a>
                <div className="dropdown-menu">
                    <a className="dropdown-item" href="categories.html">Movie</a>
                    <a className="dropdown-item" href="categories.html">Music</a>
                    <a className="dropdown-item" href="categories.html">Television</a>
                </div>
            </li>
            <li className="nav-item channel-sidebar-list">
                <h6>SUBSCRIPTIONS</h6>
                <ul>
                    <li>
                        <a href="subscriptions.html">
                            <img className="img-fluid" alt src="/static/img/s1.png"/> Your Life
                        </a>
                    </li>
                    <li>
                        <a href="subscriptions.html">
                            <img className="img-fluid" alt src="/static/img/s2.png"/> Unboxing <span
                            className="badge badge-warning">2</span>
                        </a>
                    </li>
                    <li>
                        <a href="subscriptions.html">
                            <img className="img-fluid" alt src="/static/img/s3.png"/> Product / Service
                        </a>
                    </li>
                    <li>
                        <a href="subscriptions.html">
                            <img className="img-fluid" alt src="/static/img/s4.png"/> Gaming
                        </a>
                    </li>
                </ul>
            </li>
        </ul>

        {children}
        {/* /.content-wrapper */}
    </div>
    {/* /#wrapper */}
    {/* Scroll to Top Button*/}
    {/*<a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"/>
    </a>*/}
    {/* Logout Modal*/}
    <div className="modal fade" id="logoutModal" tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
        <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
            <div className="modal-content" style={{color: "#FFF"}}>
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                    <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                    <a className="btn btn-primary" onClick={logout}>Logout</a>
                </div>
            </div>
        </div>
    </div>
</>;
Page.displayName = `Page`;
export default withApollo(Page)
