import Menu from "../../components/menu";
import Dropzone from "react-dropzone";
import {PureComponent} from "react";
import CircularProgress from '@material-ui/core/CircularProgress';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import logger from "../../util/logger";
import {API_URL} from "../../util/consts";
import Router from "next/dist/client/router";
import PaymentInfo from "./paymentInfo";
import {Elements, StripeProvider} from 'react-stripe-elements'
import { notification } from 'antd';
import 'antd/dist/antd.css';
import * as consts from "../../util/consts";
import SubscribePlan from "../../components/stripe/SubscribePlan";

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
            backgroundImageFile: props.user.background_image,
            username: props.user.username,
            about_text: props.user.about_text,
            stripe: null,
            plan: 'YEARLY',
            resubscribeInProgress: false,
            changeCardInProgress: false,
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
                this.setState({ newPassword: event.target.value });
                break;
            case "about_text":
                event.target.value = event.target.value.slice(0,500);
                this.setState({ about_text: event.target.value });
                break;
        }
    }

    onClickSaveUserProfile = async () => {
        try {
            console.log(this.paymentInfoRef)
            console.log(this.paymentInfoRef.current.props.children);
            this.paymentInfoRef.current.handleSave();
        } catch(ex) {
            notification['error']({
                message: 'Error!',
                description: ex.message,
            });
            return;
        }
        
        // this.props.saveUserProfile(
        //     this.state.firstname,
        //     this.state.lastname,
        //     // this.state.oldPassword,
        //     // this.state.newPassword,
        //     this.state.username,
        //     this.state.about_text
        // );
        // Router.push('/hacky', "/");
        // location.reload();

    };

    onClickCancelSubscription = () => {

        this.props.cancelSubscription();
    };

    onClickResubscribe = async () => {
        const token = await this.getTokenFn();
        if (!token) return;
        this.setState({
            resubscribeInProgress: true
        });
        const result = await this.props.resubscribe(token.id, this.state.plan);
        this.setState({
            resubscribeInProgress: false
        });
    }

    onClickChangeCard = async () => {
        const token = await this.getChangeCardTokenFn();
        if (!token) return;
        this.setState({
            changeCardInProgress: true
        });
        const result = await this.props.changeCard(token.id);
        this.setState({
            changeCardInProgress: false
        });
    }

    async uploadAvatarFile(file) {
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

    async uploadBgImageFile(file) {
        const formData = new FormData();
        formData.append('backgroundImage', file);
        formData.append('token', this.props.token);

        const res = await (await fetch(`${API_URL}/user/backgroundImage`, {
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
                                                const res = await this.uploadAvatarFile(files[0]);
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
                                {this.props.user.role == "USER_PUBLISHER" && (
                                    <div className="col-lg-12">
                                        <div className="main-title" style={{ paddingTop: 10 }}>
                                            <h6>Header Image</h6>
                                            <Dropzone
                                                onDrop={async (files) => {
                                                    const res = await this.uploadBgImageFile(files[0]);
                                                    this.setState({
                                                        backgroundImageFile: res
                                                    });
                                                }}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <section>
                                                        <div
                                                            {...getRootProps()}
                                                            style={{
                                                                textAlign: "center",
                                                                marginLeft: "auto",
                                                                marginRight: "auto"
                                                            }}
                                                        >
                                                            <br />
                                                            <input {...getInputProps()} />
                                                            <img
                                                                width={this.state.backgroundImageFile ? '100%' : 100}
                                                                height={this.state.backgroundImageFile ? 160 : 100}
                                                                src={this.state.backgroundImageFile ? API_URL + this.state.backgroundImageFile : "/static/img/favicon.png"}
                                                                alt=''
                                                            />
                                                            <br />
                                                            <br />
                                                            <p>
                                                                Drag & drop background image here, or click to select file
                                                        </p>
                                                            <br />
                                                        </div>
                                                    </section>
                                                )}
                                            </Dropzone>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <StripeProvider stripe={this.state.stripe}>
                                <Elements>
                                    <PaymentInfo ref={this.paymentInfoRef} user={this.props.user} />
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
                                {this.props.getUserProfile.user.role == "USER_PUBLISHER" && (
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label className="control-label">
                                                    Artist Bio <span className="required" />
                                                </label>
                                                <TextareaAutosize
                                                    rows={3}
                                                    placeholder="Not allowed to be more than 500 letters"
                                                    className="form-control border-form-control "
                                                    onChange={value =>
                                                        this.handleChange("about_text", value)
                                                    }
                                                >
                                                    {this.state.about_text ? this.state.about_text : ""}
                                                </TextareaAutosize>
                                            </div>
                                        </div>
                                    </div>
                                )}
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

                                {this.props.user.role == "USER_PUBLISHER" && (
                                    <React.Fragment>
                                        <h6>Promo Code</h6>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <div className="form-group">
                                                    <input
                                                        className="form-control border-form-control"
                                                        placeholder=""
                                                        type="text"
                                                        disabled
                                                        value={this.props.user.promo_code}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )}

                                

                                <h6>Subscription</h6>
                                <div className="row mb15">
                                    <div className="col-sm-6">
                                        {this.props.user.billing_subscription_active
                                            ?
                                            <React.Fragment>
                                                <a href="#" data-toggle="modal" data-target="#unsubscribeModal">
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning border-none"
                                                    >
                                                        Cancel Subscription </button>
                                                </a>
                                                
                                                <a href="#" data-toggle="modal" data-target="#changeCardModal">
                                                    <button
                                                        type="button"
                                                        className="btn btn-warning border-none"
                                                        style={{ marginLeft: 10 }}
                                                    >
                                                        Change Card </button>
                                                </a>

                                                {/* Change Card Modal begin*/}
                                                <div
                                                    className="modal fade"
                                                    id="changeCardModal"
                                                    tabIndex={-1}
                                                    role="dialog"
                                                    aria-hidden="true"
                                                >
                                                    <div
                                                        className="modal-dialog modal-sm modal-dialog-centered"
                                                        role="document"
                                                    >
                                                        <div className="modal-content" style={{ color: "#FFF" }}>
                                                            <div className="modal-header">
                                                                <h5 className="modal-title">
                                                                    Change Card</h5>
                                                                <br />

                                                                <button
                                                                    className="close"
                                                                    type="button"
                                                                    data-dismiss="modal"
                                                                    aria-label="Close"
                                                                >
                                                                    <span aria-hidden="true">×</span>
                                                                </button>
                                                            </div>

                                                            <div className="modal-body">
                                                                <StripeProvider stripe={this.state.stripe}>
                                                                    <Elements>
                                                                        <SubscribePlan
                                                                            // ref={el => this.stripeTokenProvider = el}
                                                                            getToken={getTokenFn => this.getChangeCardTokenFn = getTokenFn} />
                                                                    </Elements>
                                                                </StripeProvider>

                                                                {this.state.changeCardInProgress && (<div style={{ width: "100%", textAlign: 'center', marginTop: 15 }}><CircularProgress color="secondary" /></div>)}
                                                            </div>

                                                            <div className="modal-footer">
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    type="button"
                                                                    data-dismiss="modal"
                                                                >
                                                                    Cancel </button>
                                                                <button
                                                                    className="btn btn-primary"
                                                                    type="button"
                                                                    disabled={this.state.changeCardInProgress}
                                                                    onClick={() => this.onClickChangeCard()}
                                                                >
                                                                    Submit </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Change Card Modal end*/}

                                            </React.Fragment>
                                            : 'Not active'}

                                        <a href="#" data-toggle="modal" data-target="#resubscribeModal">
                                            <button
                                                type="button"
                                                className="btn btn-warning border-none"
                                                style={{ marginLeft: 10 }}
                                            >
                                                {this.props.user.billing_subscription_active ? 'Change Plan' : 'Re-Subscribe'} </button>
                                        </a>
                                        {/* Re-Subscribe Modal begin*/}
                                        <div
                                            className="modal fade"
                                            id="resubscribeModal"
                                            tabIndex={-1}
                                            role="dialog"
                                            aria-hidden="true"
                                        >
                                            <div
                                                className="modal-dialog modal-sm modal-dialog-centered"
                                                role="document"
                                            >
                                                <div className="modal-content" style={{ color: "#FFF" }}>
                                                    <div className="modal-header">
                                                        <h5 className="modal-title">
                                                            {this.props.user.billing_subscription_active ? 'Change Plan' : 'Re-Subscribe to MFA'}</h5>
                                                        <br />

                                                        <button
                                                            className="close"
                                                            type="button"
                                                            data-dismiss="modal"
                                                            aria-label="Close"
                                                        >
                                                            <span aria-hidden="true">×</span>
                                                        </button>
                                                    </div>

                                                    <div className="modal-body">
                                                        <StripeProvider stripe={this.state.stripe}>
                                                            <Elements>
                                                                <SubscribePlan
                                                                    // ref={el => this.stripeTokenProvider = el}
                                                                    getToken={getTokenFn => this.getTokenFn = getTokenFn} />
                                                            </Elements>
                                                        </StripeProvider>

                                                        <div style={{ marginTop: 10 }}>
                                                            <input type="radio" id="plan"
                                                                name="plan" value="MONTHLY" onChange={() => {
                                                                    this.setState({ plan: "MONTHLY" })
                                                                }} checked={this.state.plan === "MONTHLY"} />
                                                            <label htmlFor="contactChoice2"
                                                                style={{ marginLeft: 10 }}>$29.99/month</label>
                                                        </div>
                                                        <div>
                                                            <input type="radio" id="plan"
                                                                name="plan" value="YEARLY" onChange={() => {
                                                                    this.setState({ plan: "YEARLY" })
                                                                }} checked={this.state.plan === "YEARLY"} />
                                                            <label htmlFor="contactChoice2"
                                                                style={{ marginLeft: 10 }}>$300.00/year</label>
                                                        </div>
                                                        {this.state.resubscribeInProgress && (<div style={{ width: "100%", textAlign: 'center' }}><CircularProgress color="secondary" /></div>)}
                                                    </div>

                                                    <div className="modal-footer">
                                                        <button
                                                            className="btn btn-secondary"
                                                            type="button"
                                                            data-dismiss="modal"
                                                        >
                                                            Cancel </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            type="button"
                                                            disabled={this.state.resubscribeInProgress}
                                                            onClick={() => this.onClickResubscribe()}
                                                        >
                                                            Submit </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Re-Subscribe Modal end*/}
                                    </div>
                                </div>
                                <div className="col-sm-12 text-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => this.onClickSaveUserProfile()}
                                    >
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
