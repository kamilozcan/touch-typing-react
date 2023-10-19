import { useState, useEffect } from "react";
import { generate as randomWords } from "random-words";

import "./App.css";

const NUMB_OF_WORDS = 200;
const SECONDS = 10;

function App() {
  const [words, setWords] = useState([]);
  const [countDown, setCountDown] = useState(SECONDS);
  const [currentInput, setCurrentInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correct, setCorrect] = useState(0)
  const [incorrect, setInCorrect] = useState(0)

  useEffect(() => {
    setWords(generateWords());
  }, []);

  function generateWords() {
    return new Array(NUMB_OF_WORDS).fill(null).map(() => randomWords());
  }

  function start() {
    let interval = setInterval(() => {
      setCountDown((prevCountdown) => {
        if (prevCountdown === 0) {
          clearInterval(interval);
        } else {
          return prevCountdown - 1;
        }
      });
    }, 1000);
  }

  function handleKeyDown({ keyCode }) {
    // space bar
    if (keyCode === 32) {
      checkMatch();
      setCurrentInput(""); //When you click space input getting clean
      setCurrentWordIndex(currentWordIndex + 1);
    }
  }

  function checkMatch() {
    const wordToCompare = words[currentWordIndex];
    const doesItMatch = wordToCompare === currentInput.trim();
    if(doesItMatch) {
      setCorrect(correct + 1)
    } else {
      setInCorrect(incorrect = 1)
    }
  }

  return (
    <div className="App">
      <div className="section">
        <div className="is-size-1 has-text-centered has-text-primary">
          <h2>{countDown}</h2>
        </div>
      </div>
      <div className="control is-expanded section">
        <input
          type="text"
          className="input"
          onKeyDown={handleKeyDown}
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
        />
      </div>
      <div className="section">
        <button className="button is-info is-fullwidth" onClick={start}>
          Start
        </button>
      </div>
      <div className="section">
        <div className="card">
          <div className="card-content">
            <div className="content">
              {words.map((word, i) => (
                <span key={i}>
                  <span>
                    {word.split("").map((char, idx) => (
                      <span key={idx}>{char}</span>
                    ))}
                  </span>
                  <span> </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="columns">
          <div className="column has-text-centered">
            <p className="is-size-5">Words per minute:</p>
            <p className="has-text-primary is-size-1">{correct}</p>
          </div>
          <div className="column has-text-centered">
            <div className="is-size-5">Accurancy:</div>
            <p className="has-text-info is-size-1">{Math.round((correct / (correct + incorrect)) * 100)} %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
