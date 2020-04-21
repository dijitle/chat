import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import "bootstrap/dist/css/bootstrap.min.css";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

function App() {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState("Guest");
  const [currentMessage, setCurrentMessage] = useState("");
  const [conn, setConn] = useState();

  useEffect(() => {
    let connection = new HubConnectionBuilder()
      .configureLogging(LogLevel.Debug)
      .withUrl("https://hub.dijitle.com/hub")
      .build();

    connection.on("message", (name, message) => {
      setMessages((m) => [...m, { n: name, m: message, d: new Date() }]);
    });

    connection.start();

    setConn(connection);
  }, []);

  const submitMessage = () => {
    conn.invoke("message", userName, currentMessage);
    setCurrentMessage("");
  };

  return (
    <div className="App">
      <div className="container-fluid mb-2">
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>User Name</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            as="input"
            placeholder="Enter UserName..."
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
        </InputGroup>
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
          disabled={!currentMessage}
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
