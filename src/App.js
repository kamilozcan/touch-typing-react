import { useState, useEffect } from "react";
import { generate as randomWords } from "random-words";

import "./App.css";

const NUMB_OF_WORDS = 200;
const SECONDS = 60;

function App() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    setWords(generateWords());
  }, []);

  function generateWords() {
    return new Array(NUMB_OF_WORDS).fill(null).map(() => randomWords());
  }

  return (
    <div className="App">
      <div className="control is-expanded section">
        <input type="text" className="input"/>

      </div>
      <div className="section">
        <div className="card">
          <div className="card-content">
            <div className="content">
              {words.map((word, i) => (
                <>
                <span>
                  {word}
                </span>
                <span> </span>
                </>
                
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
