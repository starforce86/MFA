import Menu from "../../components/menu";
import Dropzone from "react-dropzone";
import {PureComponent} from "react";
import logger from "../../util/logger";
import {API_URL} from "../../util/consts";
import Router from "next/dist/client/router";
import PaymentInfo from "./paymentInfo";
import {Elements, StripeProvider} from 'react-stripe-elements'
import * as consts from "../../util/consts";

const log = logger('Settings');

class Settings extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            firstname: props.user.firstname,
            lastname: props.user.lastname,
            // oldPassword: null,
            // newPaswword: null,
            avatarFile: props.user.avatar,
            username: props.user.username,
            stripe: null
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (
            (props.user.firstname !== state.firstname && state.firstname === null) ||
            (props.user.lastname !== state.lastname && state.lastname === null)
        ) {
            return {
                firstname: props.user.firstname,
                lastname: props.user.lastname
            };
        }

        // Return null if the state hasn't changed
        return null;
    }

    handleChange(field, event) {
        switch (field) {
            case "firstname":
                this.setState({firstname: event.target.value});
                break;
            case "lastname":
                this.setState({lastname: event.target.value});
                break;
            case "oldPassword":
                this.setState({oldPassword: event.target.value});
            case "username":
                this.setState({username: event.target.value});
                break;
            case "newPassword":
                this.setState({newPassword: event.target.value});
                break;
        }
    }

    onClickSaveUserProfile = () => {
        this.props.saveUserProfile(
            this.state.firstname,
            this.state.lastname,
            // this.state.oldPassword,
            // this.state.newPassword,
            this.state.username
        );
        Router.push('/hacky', "/");
        location.reload();

    };

    onClickCancelSubscription = () => {

        this.props.cancelSubscription();
    };

    async uploadFile(file) {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('token', this.props.token);

        const res = await (await fetch(`${API_URL}/user/avatar`, {
            method: 'POST',
            body: formData
        })).json();

        log.error('res', res);
        return res.file_url;
    }

    componentDidMount() {
        this.setState({stripe: window.Stripe(consts.STRIPE_KEY)});
    }

    render() {
        log.error(this.props);
        // log.trace("MEGAAAAAAAAAAAAA", this.props.user);
        return (
            <Menu {...this.props}>
                <div id="wrapper">
                    <div id="content-wrapper">
                        <div className="container-fluid upload-details">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="main-title">
                                        <h5>My account</h5>
                                        <Dropzone
                                            onDrop={async (files) => {
                                                const res = await this.uploadFile(files[0]);
                                                this.setState({
                                                    avatarFile: res
                                                });
                                            }}>
                                            {({getRootProps, getInputProps}) => (
                                                <section>
                                                    <div
                                                        {...getRootProps()}
                                                        style={{
                                                            textAlign: "center",
                                                            marginLeft: "auto",
                                                            marginRight: "auto"
                                                        }}
                                                    >
                                                        <br/>
                                                        <input {...getInputProps()} />
                                                        <img
                                                            style={{borderRadius: '50%'}}
                                                            width={100}
                                                            height={100}
                                                            src={this.state.avatarFile ? API_URL + this.state.avatarFile : "/static/img/user.png"}
                                                            alt=''
                                                        />
                                                        <br/>
                                                        <br/>
                                                        <p>
                                                            Drag & drop avatar here, or click to select file
                                                        </p>
                                                        <br/>
                                                    </div>
                                                </section>
                                            )}
                                        </Dropzone>
                                    </div>
                                </div>
                            </div>
                            <StripeProvider stripe={this.state.stripe}>
                                <Elements>
                                    <PaymentInfo user={this.props.user} />
                                </Elements>
                            </StripeProvider>
                            <form>
                                <h6>Profile</h6>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">
                                                First Name <span className="required"/>
                                            </label>
                                            <input
                                                className="form-control border-form-control"
                                                placeholder=""
                                                type="text"
                                                value={this.state.firstname}
                                                onChange={value => this.handleChange("firstname", value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">
                                                Last Name <span className="required"/>
                                            </label>
                                            <input
                                                className="form-control border-form-control"
                                                placeholder=""
                                                type="text"
                                                value={this.state.lastname}
                                                onChange={value => this.handleChange("lastname", value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">
                                                Email Address <span className="required"/>
                                            </label>
                                            <input
                                                className="form-control border-form-control "
                                                placeholder=""
                                                disabled
                                                type="email"
                                                value={this.props.user.email}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="form-group">
                                            <label className="control-label">
                                                Username <span className="required"/>
                                            </label>
                                            <input
                                                className="form-control border-form-control "
                                                placeholder=""
                                                onChange={value =>
                                                    this.handleChange("username", value)
                                                }
                                                type="text"
                                                value={this.state.username ? this.state.username : ""}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mt-5">
                                    <p className="light-gray">

                                        {this.props.error
                                            ? this.props.error.graphQLErrors.map(({message}, i) => (
                                                <a href="#" key={i}>
                                                    {message}
                                                </a>
                                            ))
                                            : null}
                                    </p>
                                </div>

                                <h6>Subscription</h6>
                                <div className="row mb15">
                                    <div className="col-sm-6">
                                        {this.props.user.billing_subscription_active ?
                                            <a href="#" data-toggle="modal" data-target="#unsubscribeModal">
                                                <button
                                                    type="button"
                                                    className="btn btn-warning border-none"
                                                    // onClick={
                                                    //
                                                    //     // () => this.onClickCancelSubscription()
                                                    // }
                                                >
                                                    {" "}
                                                    Cancel subscription
                                                </button>
                                            </a> : 'Not active'}
                                    </div>
                                </div>
                                <div className="col-sm-12 text-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => this.onClickSaveUserProfile()}
                                    >
                                        {" "}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Menu>
        );
    }
}

export default Settings;
