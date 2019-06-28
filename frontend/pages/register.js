import RegisterPage from '../src/modules/register'
import {withAuthSync} from "../src/util/auth";

const register = props => <RegisterPage {...props} />;
export default withAuthSync(register);