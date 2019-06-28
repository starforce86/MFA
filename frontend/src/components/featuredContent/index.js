import Menu from "../menu";
import {withUser} from "../../util/auth";

const FeaturedContent = props => {
    return (
        <Menu>
            <div id="content-wrapper">
                <div className="container-fluid pb-0">

                    <hr/>
                    {/* <nav aria-label="Page navigation example">
            <ul class="pagination justify-content-center pagination-sm mb-4">
              <li class="page-item disabled">
                <a class="page-link" href="#" tabindex="-1">
                  Previous
                </a>
              </li>
              <li class="page-item active">
                <a class="page-link" href="#">
                  1
                </a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#">
                  2
                </a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#">
                  3
                </a>
              </li>
              <li class="page-item">
                <a class="page-link" href="#">
                  Next
                </a>
              </li>
            </ul>
          </nav> */}
                    <hr className="mt-0"/>
                </div>
                {/* /.container-fluid */}
            </div>
        </Menu>
    );
};

export default withUser(FeaturedContent);
