import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import BackspaceIcon from "@mui/icons-material/BackspaceOutlined";
import four_letters from "./words/four_letters.json";
import five_letters from "./words/five_letters.json";
import six_letters from "./words/six_letters.json";
import toast, { Toaster } from "react-hot-toast";
import anime from "animejs";
// import anime from "animejs/lib/anime.es.js";

const LETTERS = [
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
];

const GREEN = "green";
const ORANGE = "darkorange";

const shake = () => {
  anime({
    targets: ".currentGuess",
    translateX: [
      {
        value: 16,
      },
      {
        value: -16,
      },
      {
        value: 8,
      },
      {
        value: -8,
      },
      {
        value: 0,
      },
    ],
    duration: 300,
    easing: "easeInOutSine",
  });
};

function App() {
  const [gameType, setGameType] = useState(5);
  const [WORDS, setWordsList] = useState(five_letters);

  const [solution, setSolution] = useState(null);

  const [gameEnded, setGameEnded] = useState(false);
  const [currentGuess, setCurrentGuess] = useState(1);
  const [guessedWords, setGuessedWords] = useState({
    word1: [],
    word2: [],
    word3: [],
    word4: [],
    word5: [],
    word6: [],
  });

  const [greenLetters, setGreenLetters] = useState([]);
  const [orangeLetters, setOrangeLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);

  const resetGame = () => {
    setGameEnded(false);
    setCurrentGuess(1);
    setGuessedWords({
      word1: [],
      word2: [],
      word3: [],
      word4: [],
      word5: [],
      word6: [],
    });
    setGreenLetters([]);
    setOrangeLetters([]);
    setWrongLetters([]);
  };

  useEffect(() => {
    setSolution(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }, [WORDS]);

  const setKeyboardLetters = useCallback(
    (guess) => {
      guess.forEach((letter, i) => {
        if (letter === solution[i]) {
          setGreenLetters((prev) => [...prev, letter]);
        } else if (solution.split("").includes(letter)) {
          setOrangeLetters((prev) => [...prev, letter]);
        } else {
          setWrongLetters((prev) => [...prev, letter]);
        }
      });
    },
    [solution]
  );

  const handleChange = useCallback(
    (letter, current) => {
      if (guessedWords[current].length < gameType)
        setGuessedWords({
          ...guessedWords,
          [current]: [...guessedWords[current], letter],
        });
    },
    [gameType, guessedWords]
  );

  const handleDelete = useCallback(
    (current) => {
      const wordCopy = guessedWords[current];
      wordCopy.pop();
      setGuessedWords({ ...guessedWords, [current]: wordCopy });
    },
    [guessedWords]
  );

  const handleSubmit = useCallback(
    (current) => {
      console.log("solution :>> ", solution);
      const guess = guessedWords[current];

      if (guess.length !== gameType) {
        shake();
        toast.error("Not enough letters");
      } else if (!WORDS.includes(guess.join(""))) {
        shake();
        toast.error("Not in word list");
      } else {
        const animation = anime({
          targets: ".currentGuess",
          translateY: [
            {
              value: -12,
            },
            {
              value: 0,
            },
          ],
          duration: 500,
          easing: "easeInQuad",
        });
        animation.finished.then(() => {
          setKeyboardLetters(guess);
          setCurrentGuess(currentGuess + 1);
          if (guess.join("") === solution) {
            setGameEnded(true);
            anime({
              targets: ".winner",
              translateY: [
                {
                  value: 16,
                },
                {
                  value: -16,
                },
                {
                  value: 0,
                },
              ],
              duration: 600,
              easing: "easeInOutSine",
              delay: anime.stagger(200),
            });
            toast.success(
              `Congrats! You got it in ${currentGuess} ${
                currentGuess > 1 ? "tries" : "try"
              }!`
            );
          }
          if (currentGuess === 6) {
            setGameEnded(true);
            toast.error(`You lost this round! The solution is ${solution}.`);
          }
        });
      }
    },
    [WORDS, currentGuess, gameType, guessedWords, setKeyboardLetters, solution]
  );

  const keyListener = useCallback(
    (event) => {
      if (!gameEnded) {
        if (event.keyCode === 13) {
          handleSubmit("word" + currentGuess);
        }
        if (event.keyCode === 8) {
          handleDelete("word" + currentGuess);
        }
        if (LETTERS.includes(event.key.toUpperCase())) {
          handleChange(event.key.toUpperCase(), "word" + currentGuess);
        }
      }
    },
    [currentGuess, gameEnded, handleChange, handleDelete, handleSubmit]
  );

  useEffect(() => {
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("keydown", keyListener);
    };
  }, [keyListener]);

  const keyboardButtonStyles = (letter) => {
    if (greenLetters.includes(letter)) {
      return GREEN;
    } else if (orangeLetters.includes(letter)) {
      return ORANGE;
    } else if (wrongLetters.includes(letter)) {
      return "#444";
    } else {
      return "grey";
    }
  };

  const guessBoxStyles = (letter, guess, letterIndex, guessIndex) => {
    if (guessIndex + 1 < currentGuess) {
      if (
        (letter === solution[letterIndex] &&
          guess.indexOf(letter) === letterIndex) ||
        guess.join("") === solution
      ) {
        return GREEN;
      } else if (
        solution.split("").includes(letter) &&
        guess.indexOf(letter) === letterIndex
      ) {
        return ORANGE;
      } else if (!letter) {
        return "#121213";
      } else {
        return "#444";
      }
    }
  };

  const letterButton = (letter) => {
    return (
      <Button
        key={letter}
        variant="contained"
        className="letterButton"
        style={{ backgroundColor: keyboardButtonStyles(letter) }}
        onClick={() => handleChange(letter, "word" + currentGuess)}
        disabled={gameEnded}
      >
        {letter}
      </Button>
    );
  };

  return (
    <div className="App">
      <Toaster />
      <Grid
        className={window.outerWidth > 600 ? "root" : undefined}
        container
        direction="column"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid container direction="column" alignItems="center">
          <h1>Word Game</h1>
          <Grid container justifyContent="center">
            <Button
              className="switchButton"
              onClick={() => {
                setGameType(4);
                setWordsList(four_letters);
                resetGame();
              }}
            >
              FOUR
            </Button>
            <Button
              className="switchButton"
              onClick={() => {
                setGameType(5);
                setWordsList(five_letters);
                resetGame();
              }}
            >
              FIVE
            </Button>
            <Button
              className="switchButton"
              onClick={() => {
                setGameType(6);
                setWordsList(six_letters);
                resetGame();
              }}
            >
              SIX
            </Button>
          </Grid>
        </Grid>

        <Grid item>
          {Object.values(guessedWords).map((guess, i) => (
            <Grid key={i} container style={{ width: "auto" }}>
              <Box
                className={`letterBox ${
                  i + 1 === currentGuess && "currentGuess"
                } ${i + 2 === currentGuess && gameEnded && "winner"}`}
                style={{
                  backgroundColor: guessBoxStyles(guess[0], guess, 0, i),
                }}
              >
                <h1>{guess[0]}</h1>
              </Box>
              <Box
                className={`letterBox ${
                  i + 1 === currentGuess && "currentGuess"
                } ${i + 2 === currentGuess && gameEnded && "winner"}`}
                style={{
                  backgroundColor: guessBoxStyles(guess[1], guess, 1, i),
                }}
              >
                <h1>{guess[1]}</h1>
              </Box>
              <Box
                className={`letterBox ${
                  i + 1 === currentGuess && "currentGuess"
                } ${i + 2 === currentGuess && gameEnded && "winner"}`}
                style={{
                  backgroundColor: guessBoxStyles(guess[2], guess, 2, i),
                }}
              >
                <h1>{guess[2]}</h1>
              </Box>
              <Box
                className={`letterBox ${
                  i + 1 === currentGuess && "currentGuess"
                } ${i + 2 === currentGuess && gameEnded && "winner"}`}
                style={{
                  backgroundColor: guessBoxStyles(guess[3], guess, 3, i),
                }}
              >
                <h1>{guess[3]}</h1>
              </Box>
              {gameType > 4 && (
                <Box
                  className={`letterBox ${
                    i + 1 === currentGuess && "currentGuess"
                  } ${i + 2 === currentGuess && gameEnded && "winner"}`}
                  style={{
                    backgroundColor: guessBoxStyles(guess[4], guess, 4, i),
                  }}
                >
                  <h1>{guess[4]}</h1>
                </Box>
              )}
              {gameType > 5 && (
                <Box
                  className={`letterBox ${
                    i + 1 === currentGuess && "currentGuess"
                  } ${i + 2 === currentGuess && gameEnded && "winner"}`}
                  style={{
                    backgroundColor: guessBoxStyles(guess[5], guess, 5, i),
                  }}
                >
                  <h1>{guess[5]}</h1>
                </Box>
              )}
            </Grid>
          ))}
        </Grid>

        <Grid item>
          <Grid container justifyContent="center" style={{ width: 500 }}>
            {LETTERS.slice(0, 10).map((letter) => letterButton(letter))}
          </Grid>
          <Grid container justifyContent="center" style={{ width: 500 }}>
            {LETTERS.slice(10, 19).map((letter) => letterButton(letter))}
          </Grid>
          <Grid container justifyContent="center" style={{ width: 500 }}>
            <Button
              variant="contained"
              className="letterButton"
              style={{ backgroundColor: "grey" }}
              onClick={() => handleSubmit("word" + currentGuess)}
              disabled={gameEnded}
            >
              ENTER
            </Button>
            {LETTERS.slice(19, 26).map((letter) => letterButton(letter))}
            <Button
              variant="contained"
              className="letterButton"
              style={{ backgroundColor: "grey" }}
              onClick={() => handleDelete("word" + currentGuess)}
              disabled={gameEnded}
            >
              <BackspaceIcon style={{ margin: "0 8px" }} />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
