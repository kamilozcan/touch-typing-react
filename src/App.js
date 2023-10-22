import React, { useState, useEffect, useRef } from "react";
import { generate as randomWords } from "random-words";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Col, Card } from "react-bootstrap";
import Confetti from "react-confetti";

import "./App.css";

const NUMB_OF_WORDS = 200;
const SECONDS = 60;

function App() {
  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(SECONDS);
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1);
  const [currentChar, setCurrentChar] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [status, setStatus] = useState("waiting");
  const [isRunning, setIsRunning] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);
  const [previousAccuracy, setPreviousAccuracy] = useState(0);

  const [showConfetti, setShowConfetti] = useState(false);

  const textInput = useRef(null);

  const intervalRef = useRef();

  const [wordCorrectness, setWordCorrectness] = useState(
    Array(NUMB_OF_WORDS).fill(true)
  );

  useEffect(() => {
    const storedPreviousScore = localStorage.getItem("previousScore");
    if (storedPreviousScore) {
      setPreviousScore(parseInt(storedPreviousScore));
    }

    const storedPreviousAccuracy = localStorage.getItem("previousAccuracy");
    if (storedPreviousAccuracy) {
      setPreviousAccuracy(parseInt(storedPreviousAccuracy));
    }
  }, []);

  useEffect(() => {
    setWords(generateWords());
  }, []);

  useEffect(() => {
    if (status === "started") {
      textInput.current.focus();
    }
  }, [status]);

  function generateWords() {
    return new Array(NUMB_OF_WORDS).fill(null).map(() => randomWords());
  }

  function start() {
    if (status === "finished" || !isRunning) {
      setWords(generateWords());
      setCurrentWordIndex(0);
      setCorrect(0);
      setIncorrect(0);
      setCurrentCharIndex(-1);
      setCurrentChar("");
      setCountDown(SECONDS);
      setWordCorrectness(Array(NUMB_OF_WORDS).fill(true));
    }

    if (status !== "started") {
      setStatus("started");
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setCountDown((prevCountdown) => {
          if (prevCountdown === 0) {
            clearInterval(intervalRef.current);
            setStatus("finished");
            setCurrentInput("");
            setIsRunning(false);

            setShowConfetti(true);
            // setTimeout(hideConfetti, 5000)

            localStorage.setItem("previousScore", correct);
            setPreviousScore(correct);

            const totalWords = correct + incorrect;

            const accuracy = Math.round((correct / totalWords) * 100);
            localStorage.setItem("previousAccuracy", accuracy);
            setPreviousAccuracy(accuracy);

            return SECONDS;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
    }
  }

  // const hideConfetti = () => {
  //   setShowConfetti(false);
  // };

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setStatus("finished");
    setWords([]);
    setCurrentWordIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setCurrentCharIndex(-1);
    setCurrentChar("");
    setCountDown(SECONDS);
    setCurrentInput("");
  }

  function handleKeyDown({ keyCode, key }) {
    if (keyCode === 32) {
      checkMatch();
      setCurrentInput("");
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentCharIndex(-1);
    } else if (keyCode === 8) {
      setCurrentCharIndex(currentCharIndex - 1);
      setCurrentChar("");
    } else {
      setCurrentCharIndex(currentCharIndex + 1);
      setCurrentChar(key);
    }
  }

  function checkMatch() {
    const wordToCompare = words[currentWordIndex];
    const doesItMatch = wordToCompare === currentInput.trim();
    if (!doesItMatch) {
      const updatedCorrectness = [...wordCorrectness];
      updatedCorrectness[currentWordIndex] = false;
      setWordCorrectness(updatedCorrectness);
    }
    if (doesItMatch) {
      setCorrect(correct + 1);
    } else {
      setIncorrect(incorrect + 1);
    }
  }

  function getCharClass(wordIdx, charIdx, char) {
    if (status === "finished") {
      return "";
    }

    const isCurrentWord = wordIdx === currentWordIndex;
    const isCorrectChar =
      isCurrentWord && charIdx === currentCharIndex && char === currentChar;
    const isIncorrectChar =
      isCurrentWord && charIdx === currentCharIndex && char !== currentChar;
    const isIncorrectWord = !wordCorrectness[wordIdx];

    if (isCorrectChar) {
      return "has-background-success";
    } else if (isIncorrectChar) {
      return "has-background-danger";
    } else if (isIncorrectWord) {
      return "has-background-danger";
    }

    if (isCurrentWord) {
      return "";
    } else if (charIdx >= words[wordIdx].length) {
      return "has-background-danger";
    }

    return "";
  }

  return (
    <Container>
      <Row className="countdown">
        <Col className="text-center">
          <h2 className="display-4">{countDown}</h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <div className="input-group mb-3">
            <input
              ref={textInput}
              type="text"
              className="form-control"
              disabled={status !== "started"}
              onKeyDown={handleKeyDown}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="You will automatically start typing after you click the start button!"
            />
            <div className="input-group-append">
              {!isRunning && (
                <Button variant="info" onClick={start}>
                  Start
                </Button>
              )}
              {isRunning && (
                <Button variant="danger" onClick={stop}>
                  Stop
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
      {status === "started" && (
        <div className="section-content">
          <Card>
            <Card.Body>
              <Card.Text>
                {words.map((word, i) => (
                  <span key={i} className="content-words">
                    <span>
                      {word.split("").map((char, idx) => (
                        <span className={getCharClass(i, idx, char)} key={idx}>
                          {char}
                        </span>
                      ))}
                    </span>
                    <span> </span>
                  </span>
                ))}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      )}
      {status === "finished" && (
        <Row className="mt-4">
          <Col className="text-center">
            <p className="h5">Words per minute:</p>
            <p className="display-4 text-primary">{correct}</p>
          </Col>
          <Col className="text-center">
            <p className="h5">Accuracy:</p>
            <p className="display-4 text-info">
              {Math.round((correct / (correct + incorrect)) * 100)} %
            </p>
          </Col>
        </Row>
      )}
      {status === "finished" && (
        <Row>
          <Col className="text-center">
            <h4 className="display-6">Previous Results</h4>
          </Col>
        </Row>
      )}
      {status === "finished" && (
        <Row className="mt-4">
          <Col className="text-center">
            <p className="h5">Words per minute:</p>
            <p className="display-4 text-primary">{previousScore}</p>
          </Col>
          <Col className="text-center">
            <p className="h5">Accuracy:</p>
            <p className="display-4 text-info">{previousAccuracy}%</p>
          </Col>
        </Row>
      )}

      {showConfetti && <Confetti />}
    </Container>
  );
}

export default App;
