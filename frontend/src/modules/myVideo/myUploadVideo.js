import React, {Component} from "react";
import Dropzone from "react-dropzone";
import LinearProgress from '@material-ui/core/LinearProgress';
import "video-react/dist/video-react.css"; // import css
import {Player, BigPlayButton} from "video-react";
import { MenuItem, ListItemText, Select, Checkbox, Input } from '@material-ui/core';
import axios from 'axios';
import { notification } from 'antd';
import 'antd/dist/antd.css';
import Menu from "../../components/menu";
import Video from "../../components/video";
import SubscribeButton from "../channel/SubscribeButton";
import {API_URL} from "../../util/consts";

class MyUploadVideo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoFile: '',
            videoFileUploading: false,
            videoFileProgress: 0,
            previewVideoFile: '',
            previewVideoFileUploading: false,
            previewVideoFileProgress: 0,
            previewImageFile: '',
            previewImageFileUploading: false,
            previewImageFileProgress: 0,
            title: '',
            description: '',
            categories: [],
            tags: [],
        };
    }

    onClickSaveVideo = async () => {
        const result = await this.props.saveVideo(
            this.state.videoFile,
            this.state.previewVideoFile,
            this.state.previewImageFile,
            this.state.title,
            this.state.description,
            this.state.categories,
            this.state.tags
        );
        if (!result.error) {
            location.reload();
        } else {
            notification['error']({
                message: 'Error!',
                description: result.message,
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

    onVideoFileUploadProgress(progressEvent) {
        var percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        console.log(percentCompleted)
        this.setState({
            videoFileProgress: percentCompleted
        });
    }

    onPreviewVideoFileUploadProgress(progressEvent) {
        var percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        console.log(percentCompleted)
        this.setState({
            previewVideoFileProgress: percentCompleted
        });
    }

    onPreviewImageFileUploadProgress(progressEvent) {
        var percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        console.log(percentCompleted)
        this.setState({
            previewImageFileProgress: percentCompleted
        });
    }

    async uploadVideoFile2S3(file) {
        let fileParts = file.name.split('.');
        let fileName = fileParts[0];
        let fileType = fileParts[1];
        console.log("Preparing the upload video file");
        const response = await axios.post(`${API_URL}/user/sign_s3`, {
            fileName: fileName,
            fileType: fileType
        });
        var returnData = response.data.data.returnData;
        var signedRequest = returnData.signedRequest;
        var file_url = returnData.url;
        console.log("Recieved a signed request for video " + signedRequest);

        var options = {
            headers: {
                'Content-Type': fileType
            },
            onUploadProgress: (progressEvent) => this.onVideoFileUploadProgress(progressEvent)
        };
        const result = await axios.put(signedRequest, file, options)
            .then(response => {
                console.log("Response from s3")
                return { success: true, file_url: file_url };
            })
            .catch(error => {
                console.log('Error putting to S3 : ', error.response)
                return { success: false, msg: JSON.stringify(error.response.data) };
            });
        return result;
    }

    async uploadPreviewVideoFile2S3(file) {
        let fileParts = file.name.split('.');
        let fileName = fileParts[0];
        let fileType = fileParts[1];
        console.log("Preparing the upload video file");
        const response = await axios.post(`${API_URL}/user/sign_s3`, {
            fileName: fileName,
            fileType: fileType
        });
        var returnData = response.data.data.returnData;
        var signedRequest = returnData.signedRequest;
        var file_url = returnData.url;
        console.log("Recieved a signed request for video " + signedRequest);

        var options = {
            headers: {
                'Content-Type': fileType
            },
            onUploadProgress: (progressEvent) => this.onPreviewVideoFileUploadProgress(progressEvent)
        };
        const result = await axios.put(signedRequest, file, options)
            .then(response => {
                console.log("Response from s3")
                return { success: true, file_url: file_url };
            })
            .catch(error => {
                console.log('Error putting to S3 : ', error.response)
                return { success: false, msg: JSON.stringify(error.response.data) };
            });
        return result;
    }

    async uploadPreviewImageFile2S3(file) {
        let fileParts = file.name.split('.');
        let fileName = fileParts[0];
        let fileType = fileParts[1];
        console.log("Preparing the upload video file");
        const response = await axios.post(`${API_URL}/user/sign_s3`, {
            fileName: fileName,
            fileType: fileType
        });
        var returnData = response.data.data.returnData;
        var signedRequest = returnData.signedRequest;
        var file_url = returnData.url;
        console.log("Recieved a signed request for video " + signedRequest);

        var options = {
            headers: {
                'Content-Type': fileType
            },
            onUploadProgress: (progressEvent) => this.onPreviewImageFileUploadProgress(progressEvent)
        };

        const result = await axios.put(signedRequest, file, options)
            .then(response => {
                console.log("Response from s3")
                return { success: true, file_url: file_url };
            })
            .catch(error => {
                console.log('Error putting to S3 : ', error.response)
                return { success: false, msg: JSON.stringify(error.response.data) };
            });
        return result;
    }

    render() {
        if (this.props.user.role != "USER_PUBLISHER" && this.props.user.role != "ADMIN") {
            return null;
        }
        return (
            <Menu {...this.props}>
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
                                    <div className="col-lg-4">
                                        <div className="main-title">
                                            <h6>Video File (Maximum : 5GB)</h6>
                                            <Dropzone
                                                accept={'video/*'}
                                                onDrop={async (files) => {
                                                    if(files[0].size > 5 * 1024 * 1024 * 1024) {
                                                        notification['error']({
                                                            message: 'Error!',
                                                            description: 'The video file should not be more than 5GB',
                                                        });
                                                        return;
                                                    }
                                                    this.setState({
                                                        videoFileUploading: true,
                                                        videoFileProgress: 0
                                                    })
                                                    const res = await this.uploadVideoFile2S3(files[0]);
                                                    this.setState({
                                                        videoFileUploading: false,
                                                    });
                                                    if(res.success) {
                                                        this.setState({
                                                            videoFile: res.file_url
                                                        })
                                                    } else {
                                                        notification['error']({
                                                            message: 'Error!',
                                                            description: 'Uploading failed!',
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
                                                                    <Player src={this.state.videoFile} >
                                                                        <BigPlayButton position="center" />
                                                                    </Player>
                                                                )}
                                                                <br />
                                                                <br />
                                                                <p>
                                                                    Drag & drop video file here, or click to select file
                                                            </p>
                                                                <br />
                                                            </div>)
                                                            : (<div style={{ width: "100%", textAlign: 'center' }}>
                                                                {`${this.state.videoFileProgress} %`}
                                                                <LinearProgress color="secondary" variant="determinate" value={this.state.videoFileProgress} />
                                                                <br/>{'Please wait while uploading file...'}
                                                            </div>)}
                                                    </section>
                                                )}
                                            </Dropzone>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="main-title">
                                            <h6>Preview Image File (Maximum : 10MB)</h6>
                                            <Dropzone
                                                accept={'image/*'}
                                                onDrop={async (files) => {
                                                    if(files[0].size > 10 * 1024 * 1024) {
                                                        notification['error']({
                                                            message: 'Error!',
                                                            description: 'The video file should not be more than 10MB',
                                                        });
                                                        return;
                                                    }
                                                    this.setState({
                                                        previewImageFileUploading: true,
                                                        previewImageFileProgress: 0
                                                    })
                                                    const res = await this.uploadPreviewImageFile2S3(files[0]);
                                                    this.setState({
                                                        previewImageFileUploading: false,
                                                    });
                                                    if(res.success) {
                                                        this.setState({
                                                            previewImageFile: res.file_url
                                                        })
                                                    } else {
                                                        notification['error']({
                                                            message: 'Error!',
                                                            description: res.msg,
                                                        });
                                                    }
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
                                                            : (<div style={{ width: "100%", textAlign: 'center' }}>
                                                                {`${this.state.previewImageFileProgress} %`}
                                                                <LinearProgress color="secondary" variant="determinate" value={this.state.previewImageFileProgress} />
                                                                <br/>{'Please wait while uploading file...'}
                                                            </div>)}
                                                    </section>
                                                )}
                                            </Dropzone>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="main-title">
                                            <h6>Preview Video File (Maximum : 5GB)</h6>
                                            <Dropzone
                                                accept={'video/*'}
                                                onDrop={async (files) => {
                                                    if(files[0].size > 5 * 1024 * 1024 * 1024) {
                                                        notification['error']({
                                                            message: 'Error!',
                                                            description: 'The preview video file should not be more than 5GB',
                                                        });
                                                        return;
                                                    }
                                                    this.setState({
                                                        previewVideoFileUploading: true,
                                                        previewVideoFileProgress: 0
                                                    })
                                                    const res = await this.uploadPreviewVideoFile2S3(files[0]);
                                                    this.setState({
                                                        previewVideoFileUploading: false,
                                                    });
                                                    if(res.success) {
                                                        this.setState({
                                                            previewVideoFile: res.file_url
                                                        })
                                                    } else {
                                                        notification['error']({
                                                            message: 'Error!',
                                                            description: 'Uploading failed!',
                                                        });
                                                    }
                                                }}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <section>
                                                        {!this.state.previewVideoFileUploading
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
                                                                {this.state.previewVideoFile && (
                                                                    <Player src={this.state.previewVideoFile} >
                                                                        <BigPlayButton position="center" />
                                                                    </Player>
                                                                )}
                                                                <br />
                                                                <br />
                                                                <p>
                                                                    Drag & drop preview video file here, or click to select file
                                                            </p>
                                                                <br />
                                                            </div>)
                                                            : (<div style={{ width: "100%", textAlign: 'center' }}>
                                                                {`${this.state.previewVideoFileProgress} %`}
                                                                <LinearProgress color="secondary" variant="determinate" value={this.state.previewVideoFileProgress} />
                                                                <br/>{'Please wait while uploading file...'}
                                                            </div>)}
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
