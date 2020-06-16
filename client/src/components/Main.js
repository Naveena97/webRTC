import React, { Component } from "react"
import socket from "./Socket"
import simplePeer from "simple-peer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from '@fortawesome/free-solid-svg-icons'
import Chat from './Chat'
const cursor = {
    cursor: 'pointer'
}
class Main extends Component {
    constructor() {
        super();
        this.state = {
            userIds: [],
            stream: null,
            id: null,
            partnerStream: null
        }
    }
    componentWillMount() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ video: true, audio: true }, this.handleVideo.bind(this), this.videoError.bind(this));
        }
        this.socket = socket;
        this.socket.on('yourID', (yourid) => {
            this.yourID = yourid
        })
        this.socket.on('allUsers', (users) => {
            Object.keys(users).map(key => {
                if (users[key] !== this.yourID) {
                    this.pushUserIds(users[key])
                }
            })
        })
        this.socket.on('hey', (data) => {
            this.setCaller(data.from);
            this.setCallerSignal(data.signal);
        })
    }
    setCaller(id) {
        this.setState({
            userIds: this.state.userIds,
            stream: this.state.stream,
            id: id,
            partnerStream: this.state.partnerStream
        })
    }
    setCallerSignal(signal) {
        this.signal = signal;
    }
    pushUserIds(userids) {
        this.setState({
            userIds: this.state.userIds.concat(userids),
            stream: this.state.stream,
            id: this.state.id,
            partnerStream: this.state.partnerStream
        })
    }
    handleVideo(stream) {
        var video = document.querySelector("video");
        video.srcObject = stream;
        this.setState({
            userIds: this.state.userIds,
            stream: stream,
            id: this.state.id,
            partnerStream: this.state.partnerStream
        })
    }
    videoError(error) {
    }
    callPeer(id) {
        const peer = new simplePeer({
            initiator: true,
            trickle: false,
            stream: this.state.stream
        })
        peer.on('error', err => console.log('error', err))

        peer.on("signal", data => {
            this.socket.emit("callUser", { userToCall: id, signalData: data, from: this.yourID })
        })

        peer.on("stream", stream => {
            this.partnerVideo = document.getElementById('partnerVideo')
            this.setState({
                userIds: this.state.userIds,
                stream: this.state.stream,
                id: this.state.id,
                partnerStream: stream
            })
            this.partnerVideo.srcObject = stream;
        })

        this.socket.on("callAccepted", signal => {
            peer.signal(signal);
        })
    }
    acceptCall() {

        const peer = new simplePeer({
            initiator: false,
            trickle: false,
            stream: this.state.stream,
        });
        peer.on("signal", data => {
            this.socket.emit("acceptCall", { signal: data, to: this.state.id })
        })

        peer.on("stream", stream => {
            this.partnerVideo = document.getElementById('partnerVideo')
            this.partnerVideo.srcObject = stream;
        });

        peer.signal(this.signal);
    }
    render() {
        const uniqueIds = this.state.userIds && Array.from(new Set(this.state.userIds));
        const userids = uniqueIds && uniqueIds.map(
            id =>
                (
                    <div className="card">
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item" key={id}>{id}
                                <FontAwesomeIcon className="ml-4" style={cursor} onClick={() => this.callPeer(id)} icon={faPhone} /></li>
                        </ul>
                    </div>
                ))
        // <button className="btn btn-outline-primary" key={userid} onClick={() => this.callPeer(userid)}>{userid}</button>)

        const Id = this.state.id && (
            <div className="mt-2">
                <p>{this.state.id} Calling.....</p>
                <button className="btn btn-success" onClick={() => this.acceptCall()}>Accept</button>
                {/* <button className="btn btn-danger" onClick={()=>this.hangUp()}></button> */}
            </div>
        )
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="mt-2 col-sm-3">
                        User Ids
                    {userids}
                        {Id}
                    </div>
                    <video autoPlay className="col-sm-3">
                    </video>
                    <video autoPlay id="partnerVideo" className="col-sm-3"></video>
                    <div className="mt-2 col-sm-3">
                        <Chat></Chat>
                    </div>
                </div>
            </div>
        )
    }
}
export default Main;