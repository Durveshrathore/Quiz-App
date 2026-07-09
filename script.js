document.addEventListener("DOMContentLoaded", () => {
  // ── DOM refs ──────────────────────────────────────────────
  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const startBtn = document.getElementById("start-btn");
  const nextBtn = document.getElementById("next-btn");
  const restartBtn = document.getElementById("restart-btn");
  const questionText = document.getElementById("question-text");
  const choicesList = document.getElementById("choices-list");
  const questionCounter = document.getElementById("question-counter");
  const timeLeft = document.getElementById("time-left");
  const progressBar = document.getElementById("progress-bar");
  const scoreText = document.getElementById("score-text");
  const scoreMessage = document.getElementById("score-message");
  const reviewList = document.getElementById("review-list");
  const resultIcon = document.getElementById("result-icon");
  const categorySelect = document.getElementById("category");

  // ── Question bank ─────────────────────────────────────────
  const questionBank = {
    general: [
      {
        question: "What is the capital of France?",
        choices: ["Paris", "London", "Berlin", "Madrid"],
        answer: "Paris",
      },
      {
        question: "Which planet is known as the Red Planet?",
        choices: ["Mars", "Venus", "Jupiter", "Saturn"],
        answer: "Mars",
      },
      {
        question: "Who wrote 'Hamlet'?",
        choices: [
          "Charles Dickens",
          "Jane Austen",
          "William Shakespeare",
          "Mark Twain",
        ],
        answer: "William Shakespeare",
      },
      {
        question: "What is the largest ocean on Earth?",
        choices: ["Atlantic", "Pacific", "Indian", "Arctic"],
        answer: "Pacific",
      },
      {
        question: "How many sides does a hexagon have?",
        choices: ["5", "6", "7", "8"],
        answer: "6",
      },
    ],
    science: [
      {
        question: "What is the chemical symbol for water?",
        choices: ["H2O", "CO2", "O2", "NaCl"],
        answer: "H2O",
      },
      {
        question: "What is the speed of light (approx)?",
        choices: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000 km/s"],
        answer: "300,000 km/s",
      },
      {
        question: "Which gas do plants absorb?",
        choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        answer: "Carbon Dioxide",
      },
      {
        question: "What is the powerhouse of the cell?",
        choices: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"],
        answer: "Mitochondria",
      },
      {
        question: "What force keeps planets in orbit?",
        choices: ["Magnetism", "Gravity", "Friction", "Nuclear force"],
        answer: "Gravity",
      },
    ],
    history: [
      {
        question: "In which year did WW2 end?",
        choices: ["1943", "1944", "1945", "1946"],
        answer: "1945",
      },
      {
        question: "Who was the first US President?",
        choices: [
          "Abraham Lincoln",
          "Thomas Jefferson",
          "George Washington",
          "John Adams",
        ],
        answer: "George Washington",
      },
      {
        question: "The Great Wall of China was built to defend against whom?",
        choices: ["Mongols", "Romans", "Japanese", "Persians"],
        answer: "Mongols",
      },
      {
        question: "Which empire was ruled by Julius Caesar?",
        choices: ["Greek", "Ottoman", "Roman", "Byzantine"],
        answer: "Roman",
      },
      {
        question: "In which year did India gain independence?",
        choices: ["1945", "1947", "1950", "1952"],
        answer: "1947",
      },
    ],
  };

  // ── State ─────────────────────────────────────────────────
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let answered = false;
  let timerInterval = null;
  let secondsLeft = 15;
  let userAnswers = [];

  const TIME_PER_QUESTION = 15;

  // ── Event listeners ───────────────────────────────────────
  startBtn.addEventListener("click", startQuiz);
  nextBtn.addEventListener("click", goNext);
  restartBtn.addEventListener("click", resetToStart);

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (quizScreen.classList.contains("hidden")) return;
    const keys = ["1", "2", "3", "4"];
    const idx = keys.indexOf(e.key);
    if (idx !== -1) {
      const items = choicesList.querySelectorAll("li");
      if (items[idx] && !answered) items[idx].click();
    }
    if (e.key === "Enter" && !nextBtn.classList.contains("hidden")) goNext();
  });

  // ── Functions ─────────────────────────────────────────────
  function startQuiz() {
    const category = categorySelect.value;
    questions = [...questionBank[category]].sort(() => Math.random() - 0.5);
    currentIndex = 0;
    score = 0;
    userAnswers = [];

    show(quizScreen);
    hide(startScreen);
    hide(resultScreen);
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    nextBtn.classList.add("hidden");

    const q = questions[currentIndex];
    questionText.textContent = q.question;
    questionCounter.textContent = `Question ${currentIndex + 1} of ${questions.length}`;

    // Progress bar
    const pct = (currentIndex / questions.length) * 100;
    progressBar.style.width = pct + "%";

    // Render choices with keyboard hint
    choicesList.innerHTML = "";
    q.choices.forEach((choice, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="key-hint">${i + 1}</span> ${choice}`;
      li.setAttribute("tabindex", "0");
      li.setAttribute("role", "button");
      li.setAttribute("aria-label", choice);
      li.addEventListener("click", () => selectAnswer(choice, li));
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") selectAnswer(choice, li);
      });
      choicesList.appendChild(li);
    });

    startTimer();
  }

  function selectAnswer(choice, selectedLi) {
    if (answered) return;
    answered = true;
    clearInterval(timerInterval);

    const correct = questions[currentIndex].answer;
    const isCorrect = choice === correct;
    if (isCorrect) score++;

    userAnswers.push({
      question: questions[currentIndex].question,
      chosen: choice,
      correct,
      isCorrect,
    });

    // Visual feedback on all choices
    choicesList.querySelectorAll("li").forEach((li) => {
      const liText = li.textContent.slice(2).trim(); // strip key hint
      li.classList.add("disabled");
      if (liText === correct) li.classList.add("correct");
      else if (li === selectedLi && !isCorrect) li.classList.add("wrong");
    });

    nextBtn.classList.remove("hidden");
    nextBtn.textContent =
      currentIndex === questions.length - 1
        ? "See Results →"
        : "Next Question →";
  }

  function goNext() {
    currentIndex++;
    if (currentIndex < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {
    hide(quizScreen);
    show(resultScreen);
    clearInterval(timerInterval);

    const pct = Math.round((score / questions.length) * 100);
    scoreText.textContent = `You scored ${score} out of ${questions.length} (${pct}%)`;

    if (pct >= 80) {
      scoreMessage.textContent = "🎉 Excellent! You really know your stuff.";
      resultIcon.textContent = "🏆";
    } else if (pct >= 50) {
      scoreMessage.textContent =
        "👍 Good effort! A bit more practice and you'll ace it.";
      resultIcon.textContent = "😊";
    } else {
      scoreMessage.textContent = "📚 Keep studying — you'll get there!";
      resultIcon.textContent = "💪";
    }

    // Answer review
    reviewList.innerHTML = "<h3>Review</h3>";
    userAnswers.forEach((a) => {
      const div = document.createElement("div");
      div.className =
        "review-item " + (a.isCorrect ? "review-correct" : "review-wrong");
      div.innerHTML = `
        <p class="review-q">${a.question}</p>
        <p class="review-a">Your answer: <strong>${a.chosen}</strong>${!a.isCorrect ? ` · Correct: <strong>${a.correct}</strong>` : ""}</p>
      `;
      reviewList.appendChild(div);
    });
  }

  function resetToStart() {
    hide(resultScreen);
    show(startScreen);
    clearInterval(timerInterval);
  }

  function startTimer() {
    secondsLeft = TIME_PER_QUESTION;
    timeLeft.textContent = secondsLeft;
    timeLeft.parentElement.style.color = "";
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      secondsLeft--;
      timeLeft.textContent = secondsLeft;
      if (secondsLeft <= 5) timeLeft.parentElement.style.color = "#cf6679";
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        autoTimeout();
      }
    }, 1000);
  }

  function autoTimeout() {
    if (answered) return;
    answered = true;
    userAnswers.push({
      question: questions[currentIndex].question,
      chosen: "No answer (timed out)",
      correct: questions[currentIndex].answer,
      isCorrect: false,
    });

    choicesList.querySelectorAll("li").forEach((li) => {
      const liText = li.textContent.slice(2).trim();
      li.classList.add("disabled");
      if (liText === questions[currentIndex].answer)
        li.classList.add("correct");
    });

    nextBtn.classList.remove("hidden");
    nextBtn.textContent =
      currentIndex === questions.length - 1
        ? "See Results →"
        : "Next Question →";
  }

  function show(el) {
    el.classList.remove("hidden");
  }
  function hide(el) {
    el.classList.add("hidden");
  }
});
