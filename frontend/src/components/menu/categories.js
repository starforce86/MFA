import {Component} from "react";
import Link from "next/link";
import {withRouter} from "next/router"
import logger from '../../util/logger';
const log = logger('categories');

class Categories extends Component {

    render() {
        log.trace('categories:', this.props.categories);
        return (
            <li className={`nav-item dropdown ${this.props.router.pathname === "/categories" || this.props.router.pathname === "/category" ? " active" : ""}`}>
                <a
                    className="nav-link dropdown-toggle"

                    href="categories.html"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <i className="fas fa-fw fa-list-alt"/>
                    <span>Categories</span>
                </a>

                <div className="dropdown-menu">
                    {this.props.billing_subscription_active === true && this.props.categories.map(category => (
                        <Link prefetch href={`/category?id=${category.id}`} key={category.id}>
                            <a className="dropdown-item">{category.title}</a>
                        </Link>
                    ))}
                </div>
            </li>
        )
    }
}

Categories.defaultProps = {
    categories: [],
    billing_subscription_active: true
};

export default withRouter(Categories);
