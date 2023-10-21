import { useState, useEffect, useRef } from "react";
import { generate as randomWords } from "random-words";

import "./App.css";

const NUMB_OF_WORDS = 100;
const SECONDS = 60;

function App() {
  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(SECONDS);
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(-1); // -1 because when we hit the key it is going to 0(zero)
  const [currentChar, setCurrentChar] = useState("");
  const [correct, setCorrect] = useState(0);
  const [incorrect, setInCorrect] = useState(0);
  const [status, setStatus] = useState("waiting");
  const [isRunning, setIsRunning] = useState(false);
  const [previousScore, setPreviousScore] = useState(0);
  const [previousAccuracy, setPreviousAccuracy] = useState(0);

  //After click start button, we can start to type in input textbox
  const textInput = useRef(null);

  const intervalRef = useRef();

  //track the correctness of each word
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
      setInCorrect(0);
      setCurrentCharIndex(-1);
      setCurrentChar("");
      setCountDown(SECONDS);
      // Reset word correctness to all true
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

            localStorage.setItem("previousScore", correct);
            setPreviousScore(correct);

            // Save WPM and Accuracy scores
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

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setStatus("finished");
    setWords([]);
    setCurrentWordIndex(0);
    setCorrect(0);
    setInCorrect(0);
    setCurrentCharIndex(-1);
    setCurrentChar("");
    setCountDown(SECONDS);
    setCurrentInput("");
  }
  function handleKeyDown({ keyCode, key }) {
    // space bar
    if (keyCode === 32) {
      checkMatch();
      setCurrentInput(""); //When you click space input gets cleared
      setCurrentWordIndex(currentWordIndex + 1);
      setCurrentCharIndex(-1);

      //backspace
    } else if (keyCode === 8) {
      setCurrentCharIndex(currentCharIndex - 1);
      setCurrentChar("");
    } else {
      setCurrentCharIndex(currentCharIndex + 1);
      setCurrentChar(key); // tracking the chars
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
      setInCorrect(incorrect + 1);
    }
  }

  // Modify the getCharClass function to apply "has-background-danger" to incorrect words.
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
    <div className="App">
      <div className="top-right">
        <p className="small-font">
          Previous Score: {previousScore} WPM, {previousAccuracy}% Accuracy
        </p>
      </div>
      <div className="section">
        <div className="is-size-1 has-text-centered has-text-primary">
          <h2>{countDown}</h2>
        </div>
      </div>
      <div className="control is-expanded section">
        <input
          ref={textInput}
          disabled={status !== "started"}
          type="text"
          className="input"
          onKeyDown={handleKeyDown}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="You will automatically start typing after you click the start button!"
        />
      </div>
      <div className="section">
        {!isRunning && (
          <button className="button is-info is-fullwidth" onClick={start}>
            Start
          </button>
        )}
        {isRunning && (
          <button className="button is-danger is-fullwidth" onClick={stop}>
            Stop
          </button>
        )}
      </div>
      {/* if statement for status start*/}
      {status === "started" && (
        <div className="section-content">
          <div className="card">
            <div className="card-content">
              <div className="content">
                {words.map((word, i) => (
                  <span key={i}>
                    <span>
                      {word.split("").map((char, idx) => (
                        // i= coming from word, idx= coming from char, char= value of current character
                        <span className={getCharClass(i, idx, char)} key={idx}>
                          {char}
                        </span>
                      ))}
                    </span>
                    <span> </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* if statement for status finish */}
      {status === "finished" && (
        <div className="section">
          <div className="columns">
            <div className="column has-text-centered">
              <p className="is-size-5">Words per minute:</p>
              <p className="has-text-primary is-size-1">{correct}</p>
            </div>
            <div className="column has-text-centered">
              <div className="is-size-5">Accurancy:</div>
              <p className="has-text-info is-size-1">
                {Math.round((correct / (correct + incorrect)) * 100)} %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
