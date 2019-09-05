import React, { Component } from 'react';
import Hls from 'hls.js';

export default class HLSSource extends Component {
    
    constructor(props, context) {
        super(props, context);
        const { startTime } = this.props;
        console.log('############### HLSSource.constructor startTime =', startTime)
        const config = {
            startPosition: startTime,
        }
        this.hls = new Hls(config);
    }

    componentDidMount() {
        console.log('############### HLSSource.componentDidMount')
        const { src, video } = this.props;
        if (Hls.isSupported()) {
            this.hls.loadSource(src);
            this.hls.attachMedia(video);
            // this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            //     video.play();
            // });
        }
    }

    componentDidUpdate() {
        console.log('############### HLSSource.componentDidUpdate')
    }

    componentWillUnmount() {
        console.log('############### HLSSource.componentWillUnmount')
        if (this.hls) {
            this.hls.destroy();
        }
    }

    render() {
        return (
            <source
                src={this.props.src}
                type={this.props.type || 'application/x-mpegURL'}
            />
        );
    }
}