const state = {
  questions: qs.general,
  usedQuestions: [],
  questionsLeft: 0,
  questionsUsed: 0,
  answer: {
    correct: '',
    attempt: ''
  }
}

const round = document.querySelector('.js-round');
const panel = document.querySelector('.js-panel');
const panelOne = document.querySelector('.js-panelOne');
const panelTwo = document.querySelector('.js-panelTwo');
const categories = document.querySelector('.cats');

const wordSubmit = document.querySelector('.js-panelSubmit');
let wordInput = null;



/**
 * Add question to DOM and current number
 */
function generateQuestion(num) {
  panelOne.textContent = state.questions[num].english;
  panelTwo.textContent = state.questions[num].german;

  // display the round / number of questions
  let numberOfQuestions = state.questions.length + state.usedQuestions.length;
  round.innerHTML = '';
  round.innerHTML = `${(state.questionsUsed + 1)} / ${numberOfQuestions}`;

  state.questionsUsed++;

  state.usedQuestions.push(state.questions[num]);

  const filteredUsedQuestion = state.questions.filter((_, index) => {
    return index !== num;
  });
  state.questions = filteredUsedQuestion;
};

/**
 * Replace a random word in the German sentence with an input, save the german word.
 */
function replaceWordWithInput() {
  const text = panelTwo.innerHTML;
  const textArr = text.split(' ');

  const randomNum = Math.floor(Math.random() * textArr.length);

  // Get a random word from the current sentence. 
  const gerWord = textArr[randomNum];

  // Store the word as the correct answer in the state. 
  state.answer.correct = gerWord;

  // Create the input 
  const span = document.createElement('span');
  const input = document.createElement('input');
  input.classList.add('js-wordInput');
  input.style.width = `${gerWord.length + 2}ch`;
  span.appendChild(input);

  // Replace the chosen work in the array with the input
  textArr.splice(randomNum, 1, span.outerHTML);

  // Update the DOM with the inpit
  panelTwo.innerHTML = '';
  panelTwo.innerHTML = textArr.join(' ');

  // Make the input element available in the global scope
  wordInput = document.querySelector('.js-wordInput')
  wordInput.focus();
}

// Save the attempted answer to the state and reset the input. 
function handleAnswer() {
  const inputValue = wordInput.value;

  if (inputValue === "" || inputValue === " ") return;

  state.answer.attempt = inputValue;

  // I need to do this somewhere else; 
  wordInput.value = '';

  // Check whether the attempted answer equals the correct answer
  const { correct, attempt } = state.answer;

  if (correct === attempt) {
    success.render();
  } else {
    fail.render();
  }
}


/**
 * Button needs to change between giving the answer and moving onto the next question. 
 */
function replaceButton(text, callback) {
  wordSubmit.innerHTML = '';

  const btn = document.createElement('button');
  btn.classList.add('panel__button');
  btn.type = 'submit';
  btn.textContent = text;
  btn.addEventListener('click', callback);

  wordSubmit.appendChild(btn);

  if (text === 'Next Question') {
    btn.focus();
  }
}

/**
 * Clean the round results card from the DOM.
 */
function removeRoundResult() {
  const resultCard = document.querySelector('.js-resultCard');
  if (resultCard) {
    resultCard.remove();
  }
}


/** 
 * Views
 */
class View {
  constructor() {
    this.panel = document.querySelector('.panel');
  }

  render() {
    const markup = this.generateMarkup();
    this.panel.insertAdjacentHTML('beforeend', markup);
    wordInput.disabled = true;

    if (state.questionsLeft === 1) {
      replaceButton('Play Another Round', initNewRound);
    }

    if (state.questionsLeft > 1) {
      replaceButton('Next Question', initRound);
    }
  }
}

class SuccessView extends View {
  generateMarkup() {
    return `
    <div class="panel__card js-resultCard">
      <h2 class="ff-heading">success!</h2>
      <p><span class="highlighted correct">${state.answer.attempt}</span> is correct.</p>
    </div>
    `;
  }
}
const success = new SuccessView();

class FailView extends View {
  generateMarkup() {
    return `
    <div class="panel__card js-resultCard">
      <h2 class="ff-heading">Fail!</h2>
      <p>You entered <span class="highlighted incorrect">${state.answer.attempt}</span>, but we were looking for <span class="highlighted correct">${state.answer.correct}</s></p>
    </div>
    `;
  }
}
const fail = new FailView();



/**
 * Finish the game. 
 */
// function roundComplete() {
//   panel.innerHTML = '';
//   panel.innerHTML = `
//     <div class="panel__card">
//      <h2>Game Over....</h2>
//     </div>
//   `;
//   console.log('round COMPLETE!!!!!.')
// }

/**
 * initNewRound
 */
function initNewRound() {
  /* */
  state.questions = [...state.usedQuestions];
  state.usedQuestions = [];
  state.answer.attempt = '';
  state.questionsUsed = 0;
  initRound();
}

function initDiffRound(q) {
  state.questions = [...qs[q]];

  // this is the same as above.
  state.usedQuestions = [];
  state.answer.attempt = '';
  state.questionsUsed = 0;


  // I need to change the active button.
  // if (q === 'general') btn.classList.add('active');
  const questionBtns = document.querySelectorAll('.cat__button');
  const questionArr = Array.from(questionBtns);
  questionArr.map(a => {
    if (a.classList.contains('active')) {
      a.classList.remove('active');
    }

    if (q === a.textContent.toLowerCase()) {
      a.classList.add('active');
    }
  })



  initRound();
}

/**
 * Play a round
 */
function initRound() {
  state.questionsLeft = state.questions.length;
  const randomNum = Math.floor(Math.random() * state.questionsLeft);

  if (state.questionsLeft >= 1) {
    removeRoundResult();
    generateQuestion(randomNum);
    replaceWordWithInput();
    replaceButton('Submit', handleAnswer);
  }

  if (state.questionsLeft === 0) {
    roundComplete();
  }
}
initRound();

/**
 * Question categories
 */

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Create cat buttons
function createCatButtons() {
  const row = document.createElement('div');
  row.classList.add('cat__row');

  Object.keys(qs).map(q => {
    let btn = document.createElement('button');
    btn.classList.add('cat__button');

    /* check if the button is active */
    if (q === 'general') btn.classList.add('active');

    btn.type = 'button';
    btn.textContent = capitalizeFirstLetter(q);
    btn.addEventListener('click', () => initDiffRound(q));
    row.appendChild(btn);
  });

  categories.appendChild(row);
}
createCatButtons();

