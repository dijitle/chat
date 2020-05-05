import React, { useEffect, useState } from "react";
import "./App.css";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "bootstrap/dist/css/bootstrap.min.css";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import { useAuth0 } from "./login";
import Profile from "./profile";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [conn, setConn] = useState();
  const [userName, setUserName] = useState(null);

  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    getTokenSilently,
    user,
  } = useAuth0();

  useEffect(() => {
    toast.configure({
      autoClose: 2342,
      draggable: false,
      pauseOnHover: true,
      position: "top-right",
    });

    if (isAuthenticated && user && !userName) {
      if (user.nickname !== "") {
        setUserName(user.nickname);
      } else if (user.name !== "") {
        setUserName(user.name);
      }
    }
    if (isAuthenticated && user && userName) {
      let connection = new HubConnectionBuilder()
        .configureLogging(LogLevel.Debug)
        .withUrl("https://localhost:5001/hub", {
          accessTokenFactory: () => {
            return getTokenSilently();
          },
        })
        .build();

      connection.on("MessageReceived", (name, message) => {
        setMessages((m) => [...m, { n: name, m: message, d: new Date() }]);
      });

      connection
        .start()
        .then(() => {
          toast.success("Connected!, Welcome " + userName);
        })
        .catch((err) => {
          toast.error("Error: " + err);
        });

      setConn(connection);
    }
  }, [isAuthenticated, user, userName]);

  const submitMessage = async () => {
    conn.invoke("SendMessage", currentMessage);
    setCurrentMessage("");
  };

  return (
    <div className="App">
      <Profile></Profile>
      <div>
        {!isAuthenticated && (
          <button onClick={() => loginWithRedirect({})}>Log in</button>
        )}

        {isAuthenticated && <button onClick={() => logout()}>Log out</button>}
      </div>
      <div className="text-align-left mx-5 my-1">
        {messages.map((m) => (
          <div key={m.d} className="border-3 shadow-sm p-3">
            <h3>{m.n}</h3>
            <Badge className="float-right" pill variant="secondary">
              {m.d.toLocaleTimeString()}
            </Badge>
            {m.m}
          </div>
        ))}
      </div>
      <div className="container-fluid fixed-bottom">
        <Form.Control
          as="textarea"
          placeholder="Enter message..."
          value={currentMessage}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (currentMessage) {
                submitMessage();
              }
            }
          }}
          onChange={(e) => {
            setCurrentMessage(e.target.value);
          }}
        />
        <Button
          className="mb-3 mt-1"
          block
          disabled={!currentMessage || !isAuthenticated}
          variant="success"
          onClick={() => {
            submitMessage();
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default App;
