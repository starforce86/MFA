import React, {Component} from "react";
import Dropzone from "react-dropzone";
import CircularProgress from '@material-ui/core/CircularProgress';
import "video-react/dist/video-react.css"; // import css
import {Player} from "video-react";
import { Snackbar, FormControl, MenuItem, ListItemText, Select, Checkbox, Input, InputLabel } from '@material-ui/core';
import Menu from "../../components/menu";
import Video from "../../components/video";
import SubscribeButton from "../channel/SubscribeButton";
import {API_URL} from "../../util/consts";
import MySnackbarContentWrapper from "../../components/notification";

class MyUploadVideo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoFile: '',
            videoFileUploading: false,
            previewImageFile: '',
            previewImageFileUploading: false,
            title: '',
            description: '',
            categories: [],
            tags: [],
            notification: {
                open: false,
                type: 'error',
                message: ''
            }
        };
    }

    onClickSaveVideo = async () => {
        const result = await this.props.saveVideo(
            this.state.videoFile,
            this.state.previewImageFile,
            this.state.title,
            this.state.description,
            this.state.categories,
            this.state.tags
        );
        if (!result.error) {
            location.reload();
        } else {
            this.setState({
                notification: {
                    open: true,
                    type: 'error',
                    message: result.message
                }
            });
        }

    };

    handleChange(field, event) {
        switch (field) {
            case "title":
                this.setState({title: event.target.value});
                break;
            case "description":
                this.setState({ description: event.target.value });
                break;
            case "categories":
                this.setState({ categories: event.target.value });
                break;
            case "tags":
                this.setState({ tags: event.target.value });
                break;
        }
    }

    async uploadVideoFile(file) {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('token', this.props.token);

        try {
            const res = await (await fetch(`${API_URL}/user/video`, {
                method: 'POST',
                body: formData
            })).json();
            console.log('uploadVideoFile', res);
            return {success: true, file_url: res.file_url};
        } catch(error) {
            return {success: false, error: error};
        }
    }

    async uploadPreviewImageFile(file) {
        const formData = new FormData();
        formData.append('videoPreviewImage', file);
        formData.append('token', this.props.token);

        const res = await (await fetch(`${API_URL}/user/videoPreviewImage`, {
            method: 'POST',
            body: formData
        })).json();

        console.log('uploadPreviewImageFile', res);
        return res.file_url;
    }

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({
            notification: {
                open: false,
                type: 'error',
                message: ''
            }
        })
    }

    render() {
        if (this.props.user.role != "USER_PUBLISHER" && this.props.user.role != "ADMIN") {
            return null;
        }
        return (
            <Menu {...this.props}>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={this.state.notification.open}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                >
                    <MySnackbarContentWrapper
                        onClose={this.handleClose}
                        variant={this.state.notification.type}
                        message={this.state.notification.message}
                    />
                </Snackbar>
                <div style={{ width: '100%' }}>
                    <div id="wrapper">
                        <div className="single-channel-page" id="content-wrapper">
                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="main-title">
                                            <h5>Video Upload</h5>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="main-title">
                                            <h6>Video File</h6>
                                            <Dropzone
                                                onDrop={async (files) => {
                                                    this.setState({
                                                        videoFileUploading: true
                                                    })
                                                    const res = await this.uploadVideoFile(files[0]);
                                                    this.setState({
                                                        videoFileUploading: false,
                                                    });
                                                    if(res.success) {
                                                        this.setState({
                                                            videoFile: res.file_url
                                                        })
                                                    } else {
                                                        this.setState({
                                                            notification: {
                                                                open: true,
                                                                type: 'error',
                                                                message: 'Uploading failed, Please check if size is more thatn 500MB'
                                                            }
                                                        });
                                                    }
                                                }}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <section>
                                                        {!this.state.videoFileUploading
                                                            ? (<div
                                                                {...getRootProps()}
                                                                style={{
                                                                    textAlign: "center",
                                                                    marginLeft: "auto",
                                                                    marginRight: "auto"
                                                                }}
                                                            >
                                                                <br />
                                                                <input {...getInputProps()} />
                                                                {this.state.videoFile && (
                                                                    <Player src={this.state.videoFile} />
                                                                )}
                                                                <br />
                                                                <br />
                                                                <p>
                                                                    Drag & drop video file here, or click to select file
                                                            </p>
                                                                <br />
                                                            </div>)
                                                            : (<div style={{ width: "100%", textAlign: 'center' }}><CircularProgress color="secondary" /></div>)}
                                                    </section>
                                                )}
                                            </Dropzone>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="main-title">
                                            <h6>Preview Image File</h6>
                                            <Dropzone
                                                onDrop={async (files) => {
                                                    this.setState({
                                                        previewImageFileUploading: true
                                                    })
                                                    const res = await this.uploadPreviewImageFile(files[0]);
                                                    this.setState({
                                                        previewImageFileUploading: false,
                                                        previewImageFile: res
                                                    });
                                                }}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <section>
                                                        {!this.state.previewImageFileUploading
                                                            ? (<div
                                                                {...getRootProps()}
                                                                style={{
                                                                    textAlign: "center",
                                                                    marginLeft: "auto",
                                                                    marginRight: "auto"
                                                                }}
                                                            >
                                                                <br />
                                                                <input {...getInputProps()} />
                                                                {this.state.previewImageFile && (
                                                                    <img
                                                                        width={'100%'}
                                                                        src={this.state.previewImageFile ? this.state.previewImageFile : ""}
                                                                        alt=''
                                                                    />
                                                                )}
                                                                <br />
                                                                <br />
                                                                <p>
                                                                    Drag & drop preview image file here, or click to select file
                                                        </p>
                                                                <br />
                                                            </div>)
                                                            : (<div style={{ width: "100%", textAlign: 'center' }}><CircularProgress color="secondary" /></div>)}
                                                    </section>
                                                )}
                                            </Dropzone>
                                        </div>
                                    </div>
                                </div>
                                <form>
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label className="control-label">
                                                    Title <span className="required" />
                                                </label>
                                                <input
                                                    className="form-control border-form-control"
                                                    placeholder=""
                                                    type="text"
                                                    onChange={value => this.handleChange("title", value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label className="control-label">
                                                    Description <span className="required" />
                                                </label>
                                                <input
                                                    className="form-control border-form-control"
                                                    placeholder=""
                                                    type="text"
                                                    onChange={value => this.handleChange("description", value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label className="control-label">
                                                    Categories <span className="required" />
                                                </label>
                                                <Select
                                                    className="form-control border-form-control"
                                                    style={{ width: '100%', marginTop: 0 }}
                                                    multiple
                                                    value={this.state.categories}
                                                    onChange={event => this.handleChange("categories", event)}
                                                    input={<Input />}
                                                    renderValue={selected => selected.map(s => s.title).join(', ')}
                                                    style={{ color: '#303030', fontSize: 13 }}
                                                >
                                                    {this.props.categories.map(category => (
                                                        <MenuItem key={category.id} value={category}>
                                                            <Checkbox checked={this.state.categories.map(c => c.id).indexOf(category.id) > -1} />
                                                            <ListItemText primary={category.title} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="col-sm-12">
                                            <div className="form-group">
                                                <label className="control-label">
                                                    Tags <span className="required" />
                                                </label>
                                                <Select
                                                    className="form-control border-form-control"
                                                    style={{ width: '100%', marginTop: 0 }}
                                                    multiple
                                                    value={this.state.tags}
                                                    onChange={event => this.handleChange("tags", event)}
                                                    input={<Input />}
                                                    renderValue={selected => selected.map(t => t.text).join(', ')}
                                                    style={{ color: '#303030', fontSize: 13 }}
                                                >
                                                    {this.props.tags.map(tag => (
                                                        <MenuItem key={tag.id} value={tag}>
                                                            <Checkbox checked={this.state.tags.map(t => t.id).indexOf(tag.id) > -1} />
                                                            <ListItemText primary={tag.text} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="col-sm-12 text-center" style={{paddingTop: 15, paddingBottom: 20}}>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => this.onClickSaveVideo()}
                                                style={{ width: 200 }}
                                            >{" "}
                                                Save Video
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="single-channel-nav">
                                <nav className="navbar navbar-expand-lg navbar-light">
                                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                        aria-expanded="false" aria-label="Toggle navigation">
                                        <span className="navbar-toggler-icon" />
                                    </button>
                                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                        <ul className="navbar-nav mr-auto">
                                            <li className="nav-item active">
                                                <a className="nav-link" href="#">Videos <span
                                                    className="sr-only">(current)</span></a>
                                            </li>
                                        </ul>
                                    </div>
                                </nav>
                            </div>
                            <div className="container-fluid">
                                
                                <div className="video-block section-padding">
                                    {
                                        (this.props.user && this.props.user.my_videos && this.props.user.my_videos.length > 0) ?
                                            <div className="row">
                                                {this.props.user.my_videos.map(v => <Video video={v} key={v.id}/>)}
                                            </div> :
                                            <div className="row">
                                                <div className="col-sm-12">
                                                    <h6>This channel hasn't videos</h6>
                                                </div>
                                            </div>
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </Menu>
        );
    }
}

export default MyUploadVideo;
