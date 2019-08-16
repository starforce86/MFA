import React, { Component } from "react";
import dynamic from 'next/dynamic'
import { Collapse, Modal, notification } from 'antd';
import 'antd/dist/antd.css';
import * as Scroll from 'react-scroll';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import ReactHashTag from 'react-hashtag';
import HtmlToReact from 'html-to-react'
import logger from "../../util/logger";
import {withUser} from "../../util/auth";
const CKEditor = dynamic(() => import('../../components/ckeditor'), {
    ssr: false
})

const log = logger('Curriculum');
const { Panel } = Collapse;
const scroll = Scroll.animateScroll;
const HtmlToReactParser = HtmlToReact.Parser;

const styles = {
    pageDesc: {
        fontSize: 20
    },
    titleLabel: {
        fontSize: 60,
        lineHeight: 0,
        color: '#bc1e3e',
        position: 'relative',
        left: 80,
        bottom: 60
    }
};

class Curriculum extends Component {

    constructor(props) {
        super(props);

        this.state = {
            curriculumId: '',
            title: '',
            text: '',
            order: 0
        }
    }

    transform = (node) => {
        if (node.type === 'tag' && node.name === 'span' && node.attribs.class === 'mention') {
            const tag = node.attribs['data-mention'].substring(1);
            var htmlInput = `<a href="/?search=${tag}">#${tag}</a>`;
            var htmlToReactParser = new HtmlToReactParser();
            var reactElement = htmlToReactParser.parse(htmlInput);
            return reactElement;
        }
    }

    handleEdit = (e) => {
        const id = e.target.getAttribute('curriculumid');
		const curriculum = this.props.curricula.find(d => d.id == id);
        this.setState({
            curriculumId: id,
            title: curriculum.title,
            text: curriculum.text,
            order: curriculum.order
        }, () => {
            scroll.scrollToTop();
        });
    };

    handleDelete = (e) => {
        const id = e.target.getAttribute('curriculumid');
		Modal.confirm({
			title: `Are you sure delete?`,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: () => this.deleteCurriculum(id),
		});
    };
    
    deleteCurriculum = async (id) => {
        const result = await this.props.deleteCurriculum(id);
        if (!result.error) {
            location.reload();
        } else {
            notification['error']({
                message: 'Error!',
                description: 'Failed to delete!',
            });
        }
    }
    
    handleCancel = (e) => {
        this.setState({
            curriculumId: '',
            title: '',
            text: '',
            order: ''
        });
	};

    handleSave = async () => {
        const result = await this.props.saveCurriculum(
            this.state.curriculumId,
            this.state.title,
            this.state.text,
            this.state.order,
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
            case "order":
                try {
                    const val = event.target.value;
                    const intVal = parseInt(val);
                    if(intVal) {
                        this.setState({ order: intVal });
                    } else {
                        this.setState({ order: "" });
                    }
                } catch (e) {
                    console.log('############ e', e)
                }
                break;
        }
    }

    collapseCallback = (key) => {
        // console.log(key);
    }

    render() {
        const { title, text, order } = this.state;
        const { user, curricula, tags } = this.props;

        return (
            <div id="content-wrapper">
                <div className="container-fluid pb-0">
                    <div className="video-block section-padding">
                        {this.props.user && this.props.user.role == "ADMIN" && (
                            <React.Fragment>
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
                                                value={this.state.title}
                                                onChange={value => this.handleChange("title", value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <label className="control-label">
                                                Content <span className="required" />
                                            </label>
                                            <div className="lesson-editor">
                                                <CKEditor
                                                    data={text}
                                                    tags={tags}
                                                    onInit={editor => {
                                                        // You can store the "editor" and use when it is needed.
                                                        console.log('Editor is ready to use!', editor);
                                                    }}
                                                    onChange={(event, editor) => {
                                                        const data = editor.getData();
                                                        console.log({ event, editor, data });
                                                        this.setState({ text: data });
                                                    }}
                                                    onBlur={editor => {
                                                        console.log('Blur.', editor);
                                                    }}
                                                    onFocus={editor => {
                                                        console.log('Focus.', editor);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="form-group">
                                            <label className="control-label">
                                                Display Order <span className="required" />
                                            </label>
                                            <input
                                                className="form-control border-form-control"
                                                placeholder=""
                                                type="text"
                                                value={this.state.order}
                                                onChange={value => this.handleChange("order", value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-12 text-center" style={{ paddingTop: 15, paddingBottom: 20 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => this.handleSave()}
                                            style={{ width: 200 }}
                                        >
                                            {this.state.curriculumId ? "Update Lesson" : "Add Lesson"}
                                        </button>

                                        {this.state.curriculumId && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={this.handleCancel}
                                                style={{ width: 100, marginLeft: 20 }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        
                    </div>
                </div>
                <div className="curriculum-banner">
                    <img className="img-fluid w-100" src="static/assets/img/Man-Image-min.png" />
                    <div style={styles.titleLabel}>My Curriculum</div>
                </div>
                <div className="container-fluid pt-0">
                    <div className="row">
                        <div className="col-sm-12 lesson">
                            <p style={styles.pageDesc}>The curriculum I have in mind is a strategy of imparting knowledge  that will give an artist the full understanding of painting concepts on an  intellectual level as well as the fundamental skills necessary to achieve high art.</p>
                            <p style={styles.pageDesc}>Like any art other art form, such as writing, music, or dance, a clear grasp of the fundamentals is necessary.  One must learn to walk before he can run.  In painting, this requires an expert grasp of these elements:</p>

                            {curricula.length > 0 && (
                                <Collapse defaultActiveKey={[curricula[0].id]} onChange={this.collapseCallback}>
                                    {curricula.map(c => (
                                        <Panel header={c.title} key={c.id}>
                                            {user && user.role == "ADMIN" && (
                                                <React.Fragment>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        curriculumid={c.id}
                                                        onClick={this.handleEdit}
                                                        style={{ width: 120, marginBottom: 10 }}
                                                    >Edit Lesson</button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm"
                                                        curriculumid={c.id}
                                                        onClick={this.handleDelete}
                                                        style={{ width: 120, marginLeft: 20, marginBottom: 10 }}
                                                    >Delete Lesson</button>
                                                </React.Fragment>
                                            )}
                                            {ReactHtmlParser(c.text, {transform: this.transform})}
                                        </Panel>
                                    ))}
                                </Collapse>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default withUser(Curriculum);
