import { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { connect } from "react-redux";
import { io } from "socket.io-client";
import Peer from "simple-peer";

import * as actions from "./store/actions";
import Fallback from "./containers/Fallback";
import Home from "./containers/Home";
import Layout from "./hoc/Layout";
import Login from "./containers/Login";
import Register from "./containers/Register";
import ProtectedLayout from "./hoc/ProtectedLayout";
import Contacts from "./containers/Contacts";
import Logout from "./containers/Logout";

// Hosted
// https://communicare-server.herokuapp.com/
const socket = io("http://localhost:8000/", {
  autoConnect: false,
});

function App({ onAutoSignup, userID, email }) {
  const [responseMessage, setResponseMessage] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isCallReceived, setIsCallReceived] = useState(false);
  const [stream, setStream] = useState();
  const [callSignal, setCallSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callerInfo, setCallerInfo] = useState({
    callerID: "",
    callerEmail: "",
  });

  const myMedia = useRef();
  const userMedia = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (userID) {
      socket.connect();
      socket.emit("add-user", { userID, email });
    } else {
      socket.disconnect();
    }

    onAutoSignup();
  }, [onAutoSignup, userID, email]);

  useEffect(() => {
    socket.on("get-users", (users) => setOnlineUsers(users));
    socket.on("chat message", (data) =>
      setResponseMessage((prevState) => [...prevState, data])
    );

    socket.on("call-user", ({ callerID, callerEmail, signal }) => {
      setIsCallReceived(true);
      setCallSignal(signal);
      setCallerInfo({
        callerID: callerID,
        callerEmail: callerEmail,
      });
    });
  }, []);

  const handleSubmitMessage = (message) => {
    if (message !== "") {
      socket.emit("chat message", { message, userID, email });
    }
  };

  const getUserMedia = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(stream);
      myMedia.current.srcObject = stream;
    } catch (err) {
      console.log(err);
    }
  };

  const callUser = (userToCallID) => {
    getUserMedia();
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("call-user", {
        userToCallID: userToCallID,
        callerID: userID,
        signal: data,
      });
    });

    peer.on("stream", (stream) => {
      userMedia.current.srcObject = stream;
    });

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  return (
    <Routes>
      <Route path="/auth" element={<Layout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedLayout
            isCallReceived={isCallReceived}
            callerInfo={callerInfo}
            myMedia={myMedia}
          />
        }
      >
        <Route
          index
          element={
            <Home
              onSubmitMessage={handleSubmitMessage}
              responseMessage={responseMessage}
            />
          }
        />
        <Route
          path="contacts"
          element={
            <Contacts
              onlineUsers={onlineUsers}
              contactUser={callUser}
              userID={userID}
            />
          }
        />
        <Route path="logout" element={<Logout />} />
      </Route>

      <Route path="*" element={<Fallback />} />
    </Routes>
  );
}

const mapStateToProps = (state) => {
  return {
    userID: state.auth.userID,
    email: state.auth.email,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAutoSignup: () => dispatch(actions.authCheckState()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
