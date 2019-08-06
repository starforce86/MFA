import React, { Component } from "react";
import LinearProgress from '@material-ui/core/LinearProgress';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Dropzone from "react-dropzone";
import axios from 'axios';
import { notification } from 'antd';
import 'antd/dist/antd.css';
import Menu from "../../components/menu";
import { API_URL } from "../../util/consts";
import logger from "../../util/logger";
import NewsCard from "./NewsCard";
import {withUser} from "../../util/auth";

const log = logger('News');

class News extends Component {

    constructor(props) {
        super(props);

        this.state = {
            postId: '',
            previewImageFile: '',
            previewImageFileUploading: false,
            previewImageFileProgress: 0,
            title: '',
            description: '',
        };
    }

    onClickSave = async () => {
        const result = await this.props.saveNews(
            this.state.postId,
            this.state.previewImageFile,
            this.state.title,
            this.state.description,
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

    onClickCancel = () => {
        this.setState({
            postId: '',
            previewImageFile: '',
            previewImageFileUploading: false,
            previewImageFileProgress: 0,
            title: '',
            description: '',
        })
    };

    handleEditPost = (id) => {
        const post = this.props.posts.find(d => d.id == id);
        console.log('############', post)
        this.setState({
            postId: id,
            previewImageFile: post.mainImageUrl,
            title: post.title,
            description: post.text
        }, () => {console.log('##############', this.state)});
    }

    handleDeletePost = async (id) => {
        const result = await this.props.deleteNews(id);
        if (!result.error) {
            location.reload();
        } else {
            notification['error']({
                message: 'Error!',
                description: 'Failed to delete!',
            });
        }
    }

    handleChange(field, event) {
        switch (field) {
            case "title":
                this.setState({title: event.target.value});
                break;
            case "description":
                this.setState({ description: event.target.value });
                break;
        }
    }

    onPreviewImageFileUploadProgress(progressEvent) {
        var percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        this.setState({
            previewImageFileProgress: percentCompleted
        });
    }

    async uploadPreviewImageFile2S3(file) {
        let fileParts = file.name.split('.');
        let fileName = fileParts[0];
        let fileType = fileParts[1];
        console.log("Preparing the upload image file");
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
        const result = await axios.put(signedRequest, file, options);
        console.log("Response from s3")

        return { success: true, file_url: file_url };
    }

    render() {
        return (
            <Menu>
                <div id="content-wrapper">
                    <div className="container-fluid pb-0">
                        <div className="top-mobile-search">
                            <div className="row">
                                <div className="col-md-12">
                                    <form action="/" method="get"
                                        className="mobile-search">
                                        <div className="input-group">
                                            <input
                                                style={{ color: "#FFF" }}
                                                name="search"
                                                type="text"
                                                placeholder="Search for..."
                                                className="form-control"
                                            />
                                            <div className="input-group-append">
                                                <button type="button" className="btn btn-dark">
                                                    <i className="fas fa-search" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
    
                        <div className="video-block section-padding">
                            {this.props.user && this.props.user.role == "ADMIN" && (
                                <React.Fragment>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="main-title">
                                                <h5>Add news</h5>
                                            </div>
                                            <div className="col-lg-6">
                                                <div className="main-title">
                                                    <h6>Image File (Maximum : 10MB)</h6>
                                                    <Dropzone
                                                        accept={'image/*'}
                                                        onDrop={async (files) => {
                                                            if (files[0].size > 10 * 1024 * 1024) {
                                                                notification['error']({
                                                                    message: 'Error!',
                                                                    description: "The video file should not be more than 10MB",
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
                                                            if (res.success) {
                                                                this.setState({
                                                                    previewImageFile: res.file_url
                                                                })
                                                            } else {
                                                                notification['error']({
                                                                    message: 'Error!',
                                                                    description: "Uploading failed!",
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
                                                                        <br />{'Please wait while uploading file...'}
                                                                    </div>)}
                                                            </section>
                                                        )}
                                                    </Dropzone>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <form>
                                        <div className="row mt-4 mb-4">
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label className="control-label">
                                                        Title <span className="required" />
                                                    </label>
                                                    <input
                                                        className="form-control border-form-control"
                                                        placeholder=""
                                                        type="text"
                                                        value={this.state.title}
                                                        onChange={value => this.handleChange("title", value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-12">
                                                <div className="form-group">
                                                    <label className="control-label">
                                                        Description <span className="required" />
                                                    </label>
                                                    <TextareaAutosize
                                                        rows={3}
                                                        className="form-control border-form-control "
                                                        value={this.state.description}
                                                        onChange={value =>
                                                            this.handleChange("description", value)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-sm-12 text-center" style={{ paddingTop: 15, paddingBottom: 20 }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => this.onClickSave()}
                                                    style={{ width: 200 }}
                                                >
                                                    {this.state.postId ? "Update News" : "Add News"}
                                                </button>

                                                {this.state.postId && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => this.onClickCancel()}
                                                        style={{ width: 200, marginLeft: 20 }}
                                                    >
                                                        Cancel Update
                                        </button>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </React.Fragment>
                            )}
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="main-title">
                                        <h6>News</h6>
                                    </div>
                                </div>
    
                                {this.props
                                    ? this.props.posts
                                        ? this.props.posts.map(p => {
                                            return (
                                                <NewsCard
                                                    user={this.props.user}
                                                    post={p}
                                                    key={p.id}
                                                    editPost={(id) => { this.handleEditPost(id) }}
                                                    deletePost={(id) => { this.handleDeletePost(id) }}
                                                />
                                            )
                                        })
                                        : null
                                    : null}
                            </div>
                        </div>
                        <hr className="mt-0" />
                    </div>
                    {/* /.container-fluid */}
                </div>
            </Menu>
        );
    }
};

export default withUser(News);
