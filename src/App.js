import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "bootstrap/dist/css/bootstrap.min.css";
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
  const LastMessageRef = useRef(null);
  const FirstMessageRef = useRef(null);

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
        .withUrl("https://hub.dijitle.com/hub", {
          accessTokenFactory: () => {
            return getTokenSilently();
          },
        })
        .build();

      connection.on("MessageReceived", (message) => {
        setMessages((m) => [...m, { ...message }]);
        scrollToBottom();
      });

      connection.on("GetMessages", (message) => {
        setMessages((m) => [...message, ...m]);
        scrollToTop();
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

  const scrollToTop = () => {
    FirstMessageRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottom = () => {
    LastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const submitMessage = async () => {
    conn.invoke("SendMessage", currentMessage);
    setCurrentMessage("");
  };

  const GetPreviousMessages = async () => {
    conn.invoke("GetMessages", 5, messages[0].id);
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
      <div className="text-align-left px-5 mb-5">
        {messages[0]?.previousId ? (
          <Button variant="secondary" size="sm" onClick={GetPreviousMessages}>
            Get Previous...
          </Button>
        ) : null}
        <div ref={FirstMessageRef}></div>
        {messages.map((m) => (
          <div key={m.id} className="border-3 shadow-sm p-3">
            <h3>{m.name}</h3>
            <Badge className="float-right" pill variant="secondary">
              {new Date(m.dateSent).toLocaleTimeString()}
            </Badge>
            {m.content}
          </div>
        ))}
        <div ref={LastMessageRef}></div>
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
