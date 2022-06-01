import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { findContact } from "../utils/findContact";
import { Link as RouterLink } from "react-router-dom";

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';

import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import Typography from "../components/Typography";
import Button from "../components/Button";

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
import ClosedCaptionOffIcon from '@mui/icons-material/ClosedCaptionOff';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import SendIcon from '@mui/icons-material/Send';

import TranscribeVisual from "../assets/TranscribeVisual.png";

const firebase_url = "https://communicare-4a0ec-default-rtdb.asia-southeast1.firebasedatabase.app";

const OnlineCircle = () => {
  return (
    <svg style={{ width: "8px", height: "8px", marginLeft: "8px" }}>
      <circle cx={4} cy={4} r={4} fill="#22BB72" />
    </svg>
  )
}

const Home = ({
  userID,
  email,
  socket,
  callUser,
  endCall,
  answerCall,
  myMedia,
  userMedia,
  onMedia,
  isCallSent,
  isCallReceived,
  isCallAccepted,
  isCallEnded,
  callerInfo,
  isTranscriptionEnabled,
  enableTranscription,
}) => {
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [responseMessage, setResponseMessage] = useState([]);
  const [liveTranscription, setLiveTranscription] = useState("");

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isTranscribeOn, setIsTranscribeOn] = useState(true);

  useEffect(() => {
    socket.on("get-users", (users) => setOnlineUsers(users));
    socket.on("chat message", (data) =>
      setResponseMessage((prevState) => [...prevState, data])
    );

    axios.get(`${firebase_url}/contacts/${userID}.json`).then((response) => {
      setContacts(response.data !== null ? response.data : []);
    });

    socket.on("transcribedMessage", ({ message }) => {
      setLiveTranscription(message);
    });

    onMedia();
  }, []);

  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmitMessage = () => {
    if (message !== "") {
      socket.emit("chat message", { message, userID, email });
    }
    setMessage("");
  };

  const addContactHandler = (contactID, contactEmail) => {
    let updatedContacts = [
      ...contacts,
      { userID: contactID, email: contactEmail },
    ];
    axios
      .put(`${firebase_url}/contacts/${userID}.json`, updatedContacts)
      .then((response) => setContacts(updatedContacts))
      .catch((error) => console.log("error catched: ", error));
  };

  const removeContactHandler = (item) => {
    let updatedContacts = [...contacts];

    let index = updatedContacts.findIndex((x) => x.userID === item);
    if (index > -1) {
      updatedContacts.splice(index, 1); // 2nd parameter means remove one item only
    }

    axios
      .put(`${firebase_url}/contacts/${userID}.json`, updatedContacts)
      .then((response) => setContacts(updatedContacts))
      .catch((error) => console.log("error catched: ", error));
  };

  const isInContactsHandler = (array, item) => {
    for (let index = 0; index < array.length; index++) {
      const element = array[index].userID;

      if (element === item) {
        return true;
      }
    }
  };

  return (
    <>
      {isCallReceived || isCallSent ? (                      // UI WHEN A CALL IS RECEIVED
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100vw - 300px)` },
            height: "100vh",
            p: 4,
            background: "linear-gradient(180deg, rgba(102,103,171,1) 0%, rgba(248,209,211,1) 100%)",

            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <Box />

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "white", fontSize: "32px", fontWeight: "700" }}>aso@gmail.com</Typography>
            {(isCallReceived && !isCallSent) ? (
              <Typography sx={{ color: "white", fontSize: "18px", fontWeight: "500" }}>is calling...</Typography>
            ) : (
              <Typography sx={{ color: "white", fontSize: "18px", fontWeight: "500" }}>Ringing...</Typography>
            )}
          </Box>

          <Stack direction="row" spacing={16}>
            <IconButton size="large" onClick={endCall} sx={{ backgroundColor: "#BB223E", color: "white" }}>
              <CallEndIcon />
            </IconButton>

            {(isCallReceived && !isCallSent) && (
              <IconButton size="large" onClick={answerCall} sx={{ backgroundColor: "#22BB72", color: "white" }}>
                <CallIcon />
              </IconButton>
            )}
          </Stack>
        </Box>
      ) : isCallAccepted && !isCallEnded ? (   // UI DURING A CALL
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100vw - 300px)` },
            height: "100vh",
            p: 4,
            backgroundColor: "#F9FAFF",
          }}>
          <Toolbar sx={{ display: { xs: 'block', sm: 'none' } }} />
          <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>IN CALL</Typography>
          <Grid container sx={{ height: "100%", ".MuiGrid-container.MuiGrid-item": { p: 0 }, ".MuiGrid-item": { p: 2 } }}>
            <Grid container item direction="column" xs={8}>
              <Grid item xs={7} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", }}>
                <video playsInline muted autoPlay ref={userMedia} style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "100%",
                }} />
              </Grid>

              <Grid container item xs={5}>
                <Grid item xs={8} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", }}>
                  <video playsInline muted autoPlay ref={myMedia} style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: "100%",
                  }} />
                </Grid>

                <Grid item xs={4}>
                  <Box component={Paper} sx={{
                    display: "grid",
                    width: "100%",
                    height: "100%",
                    gridTemplateRows: "auto auto",
                    gridTemplateColumns: "auto auto",
                  }}>
                    <IconButton onClick={() => setIsCamOn(!isCamOn)} sx={{ borderRadius: 0, color: "#7D7EAA" }}>
                      <Box sx={{ backgroundColor: "#ECECEC", p: 2, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isCamOn ? <VideocamIcon /> : <VideocamOffIcon />}
                      </Box>
                    </IconButton>

                    <IconButton onClick={() => setIsMicOn(!isMicOn)} sx={{ borderRadius: 0, color: "#7D7EAA" }}>
                      <Box sx={{ backgroundColor: "#ECECEC", p: 2, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isMicOn ? <MicIcon /> : <MicOffIcon />}
                      </Box>
                    </IconButton>

                    <IconButton onClick={() => setIsTranscribeOn(!isTranscribeOn)} sx={{ borderRadius: 0, color: "#7D7EAA" }}>
                      <Box sx={{ backgroundColor: "#ECECEC", p: 2, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isTranscribeOn ? <ClosedCaptionIcon /> : <ClosedCaptionOffIcon />}
                      </Box>
                    </IconButton>

                    <IconButton sx={{ borderRadius: 0, color: "white" }}>
                      <Box sx={{ backgroundColor: "#BB223E", p: 2, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CallEndIcon sx={{ backgroundColor: "#BB223E" }} />
                      </Box>
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={4}>
              <Box component={Paper} sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography sx={{ backgroundColor: "#F9FAFF", p: 2 }}>In-Call Messages</Typography>
                <Box sx={{ flex: 1 }}>
                  {responseMessage.map((data, index) => (
                    <Typography key={index}>
                      {console.log(data)}
                      {data.email}: {data.message}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField multiline onChange={handleChangeMessage} sx={{ flex: 1 }} />
                  <IconButton onClick={handleSubmitMessage}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ) : (                                    // HOME UI
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100vw - 300px)` },
            height: "100vh",
            p: 4,
            backgroundColor: "#F9FAFF",
          }}>
          <Toolbar sx={{ display: { xs: 'block', sm: 'none' } }} />
          <Typography sx={{ fontSize: "20px", fontWeight: "700" }}>HOME</Typography>
          <Grid container direction="column" flexWrap="nowrap" sx={{ height: "100%", ".MuiGrid-container.MuiGrid-item": { p: 0 }, ".MuiGrid-item": { p: 2 } }}>
            <Grid item xs={7}>
              <Box component={Paper} sx={{ height: "100%" }}>
                <Grid container item sx={{ height: "100%" }}>
                  <Grid item xs={6}>
                    <Box sx={{ backgroundColor: "#EAEFFF", height: "100%", p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <Typography sx={{ fontSize: "18px", fontWeight: "500" }}>Online</Typography>
                        <Link to={"/contacts"} component={RouterLink} underline="none" sx={{ fontSize: "14px", fontWeight: "400", color: "#22BB72" }}>See All</Link>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {onlineUsers.map((item) => (
                              <TableRow key={item.userID}>
                                <TableCell component="th" scope="row" sx={{ borderBottom: "none" }}>
                                  <Typography>
                                    {item.email} <OnlineCircle />
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Grid>

                  <Grid item xs={6}>
                    <Box sx={{ backgroundColor: "#EAEFFF", height: "100%", p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <Typography sx={{ fontSize: "18px", fontWeight: "500" }}>Contacts</Typography>
                        <Link to={"/contacts"} component={RouterLink} underline="none" sx={{ fontSize: "14px", fontWeight: "400", color: "#22BB72" }}>See All</Link>
                      </Box>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {contacts.map((item) => (
                              <TableRow key={item.userID}>
                                <TableCell component="th" scope="row" sx={{ borderBottom: "none" }}>
                                  <Typography sx={{ fontSize: "14px" }}>
                                    {item.email} {isInContactsHandler(onlineUsers, item.userID) && <OnlineCircle />}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid container item xs={5}>
              <Grid item xs={5} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                <video playsInline muted autoPlay ref={myMedia} style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "100%",
                  padding: "16px",
                  objectFit: "cover",
                }} />
              </Grid>

              <Grid item xs={7}>
                <Box component={Paper} sx={{ height: "100%", p: 2 }}>
                  <Typography>TRANSCRIBE</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", p: 1 }}>
                    <Typography>How to use?</Typography>

                    <Grid container>
                      <Grid item xs={6}>
                        <List component="ol" sx={{ listStyleType: "decimal", listStylePosition: "inside", textAlign: "left" }}>
                          <ListItem sx={{ display: "list-item" }}>Speak and this tool will transcribe the words spoken into written text.</ListItem>
                          <ListItem sx={{ display: "list-item" }}>Make sure the speaking voice is clear for better translation quality.</ListItem>
                          <ListItem sx={{ display: "list-item" }}>Click the button to start transcribing.</ListItem>
                        </List>
                      </Grid>

                      <Grid item xs={6} sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Box
                          component="img"
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "auto",
                            width: "100%",
                          }}
                          alt="Transcription Visual"
                          src={TranscribeVisual}
                        />
                      </Grid>
                    </Grid>
                    <Button to="transcribe" component={RouterLink} sx={{ backgroundColor: "#6667AB" }}>Transcribe Now</Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    userID: state.auth.userID,
    email: state.auth.email,
  };
};

export default connect(mapStateToProps)(Home);

/*
<div>
  Home
  <div>
    <video playsInline muted autoPlay ref={myMedia} />
    {isCallAccepted && !isCallEnded ? (
      <>
        <div>
          {isTranscriptionEnabled ? (
            <div>
              <h3>{liveTranscription && liveTranscription}</h3>
              <button onClick={enableTranscription}>
                Disable Transcription
              </button>
            </div>
          ) : (
            <div>
              <h3>Transcription is off</h3>
              <button onClick={enableTranscription}>
                Enable Transcription
              </button>
            </div>
          )}
        </div>
        <button onClick={endCall}>Hang up</button>
        <video playsInline autoPlay ref={userMedia} />
      </>
    ) : null}
  </div>
  <div>
    <label>Your message: </label>
    <input type="text" value={message} onChange={handleChangeMessage} />
    <button onClick={handleSubmitMessage}>Send</button>
  </div>
  <div>
    <h4>CONVO: </h4>
    {responseMessage.map((data, index) => (
      <p key={index}>
        {data.email}: {data.message}
      </p>
    ))}
  </div>
  <h3>Your Contacts</h3>
  <div style={{ border: "1px solid grey", marginBottom: 10 }}>
    {contacts.map((user) => (
      <div key={user.userID}>
        <p style={{ color: "blue" }}>{user.email} </p>
        {findContact(onlineUsers, user.userID) ? (
          <>
            <p>(Online)</p>
            <button onClick={() => callUser(user.userID)}>Call</button>
          </>
        ) : (
          "(Offline)"
        )}

        <button onClick={() => removeContactHandler(user.userID)}>
          Remove in contacts
        </button>
      </div>
    ))}
  </div>
  <h3>Online Users</h3>
  {onlineUsers.map((user) => (
    <div
      key={user.userID}
      style={{ border: "1px dashed grey", marginBottom: 10 }}
    >
      {user.userID !== userID ? (
        <div>
          <p style={{ color: "brown" }}>{user.email}</p>
          <button onClick={() => callUser(user.userID)}>Call</button>

          {!findContact(contacts, user.userID) && (
            <button
              onClick={() => addContactHandler(user.userID, user.email)}
            >
              Add into contacts
            </button>
          )}
        </div>
      ) : (
        <p style={{ color: "green" }}>{user.email} (You)</p>
      )}
    </div>
  ))}
</div>
*/