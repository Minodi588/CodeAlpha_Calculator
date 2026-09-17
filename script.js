/* =========================================================
   CASIO STYLE PROFESSIONAL CALCULATOR
   CodeAlpha - Task 2
   Fully Working JavaScript
========================================================= */

"use strict";

/* =========================================================
   DOM ELEMENTS
========================================================= */

const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const memoryIndicator = document.getElementById("memoryIndicator");

const historyModal = document.getElementById("historyModal");
const historyList = document.getElementById("historyList");
const closeHistoryButton = document.getElementById("closeHistory");
const clearHistoryButton = document.getElementById("clearHistory");


/* =========================================================
   CALCULATOR STATE
========================================================= */

let currentInput = "0";
let previousInput = null;
let operator = null;

let waitingForOperand = false;

let memory = 0;

let history = [];


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    display.textContent = formatNumber(currentInput);

    if (previousInput !== null && operator !== null) {

        expressionDisplay.textContent =
            `${formatNumber(previousInput)} ${operator}`;

    } else if (!expressionDisplay.textContent.includes("=")) {

        expressionDisplay.textContent = "";
    }

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(value) {

    if (value === "Error") {
        return "Error";
    }

    if (
        value === "" ||
        value === "-" ||
        value === "." ||
        value === "-."
    ) {
        return value;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Error";
    }

    /*
       Keep decimal input such as 5.
       Do not convert it to 5.
    */

    if (
        typeof value === "string" &&
        value.endsWith(".")
    ) {
        return value;
    }

    /*
       Scientific notation for very large/small numbers
    */

    if (
        Math.abs(number) >= 1e12 ||
        (Math.abs(number) > 0 && Math.abs(number) < 1e-10)
    ) {

        return number.toExponential(8);
    }

    return String(value);
}


/* =========================================================
   ROUND RESULT
========================================================= */

function roundResult(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    return Number(number.toPrecision(12));
}


/* =========================================================
   INPUT NUMBER
========================================================= */

function inputNumber(number) {

    if (currentInput === "Error") {
        clearAll();
    }

    if (waitingForOperand) {

        currentInput = String(number);

        waitingForOperand = false;

    } else if (currentInput === "0") {

        currentInput = String(number);

    } else {

        /*
           Prevent unnecessary leading zeros
        */

        if (currentInput === "-0") {
            currentInput = "-" + number;
        } else {
            currentInput += String(number);
        }
    }

    updateDisplay();
}


/* =========================================================
   DECIMAL
========================================================= */

function inputDecimal() {

    if (currentInput === "Error") {
        clearAll();
    }

    if (waitingForOperand) {

        currentInput = "0.";
        waitingForOperand = false;

    } else if (!currentInput.includes(".")) {

        currentInput += ".";
    }

    updateDisplay();
}


/* =========================================================
   CALCULATE
========================================================= */

function calculate(a, b, op) {

    switch (op) {

        case "+":

            return a + b;

        case "−":

            return a - b;

        case "×":

            return a * b;

        case "÷":

            if (b === 0) {
                return "Error";
            }

            return a / b;

        default:

            return b;
    }
}


/* =========================================================
   OPERATOR
========================================================= */

function handleOperator(nextOperator) {

    if (currentInput === "Error") {
        return;
    }

    const inputValue = parseFloat(currentInput);

    if (!Number.isFinite(inputValue)) {
        return;
    }


    /*
       If user presses another operator
       change the operator instead of calculating.
    */

    if (
        operator !== null &&
        waitingForOperand
    ) {

        operator = nextOperator;

        updateDisplay();

        return;
    }


    /*
       Existing calculation
    */

    if (
        previousInput !== null &&
        operator !== null
    ) {

        const result = calculate(
            parseFloat(previousInput),
            inputValue,
            operator
        );

        if (result === "Error") {

            showError();

            return;
        }

        currentInput = String(roundResult(result));

        previousInput = currentInput;

    } else {

        previousInput = currentInput;
    }


    operator = nextOperator;

    waitingForOperand = true;

    expressionDisplay.textContent =
        `${formatNumber(previousInput)} ${operator}`;

    updateDisplay();
}


/* =========================================================
   EQUALS
========================================================= */

function calculateResult() {

    if (
        previousInput === null ||
        operator === null ||
        currentInput === "Error"
    ) {
        return;
    }

    const a = parseFloat(previousInput);
    const b = parseFloat(currentInput);

    if (
        !Number.isFinite(a) ||
        !Number.isFinite(b)
    ) {

        showError();

        return;
    }


    const calculation =
        `${formatNumber(previousInput)} ${operator} ${formatNumber(currentInput)}`;


    const result = calculate(
        a,
        b,
        operator
    );


    if (result === "Error") {

        showError();

        return;
    }


    const finalResult = roundResult(result);


    /*
       Add calculation to history
    */

    addHistory(
        calculation,
        finalResult
    );


    /*
       Show completed expression
    */

    expressionDisplay.textContent =
        `${calculation} =`;


    /*
       Show result
    */

    currentInput = String(finalResult);

    previousInput = null;
    operator = null;

    waitingForOperand = true;

    display.textContent =
        formatNumber(currentInput);
}


/* =========================================================
   CLEAR ALL
========================================================= */

function clearAll() {

    currentInput = "0";

    previousInput = null;

    operator = null;

    waitingForOperand = false;

    expressionDisplay.textContent = "";

    updateDisplay();
}


/* =========================================================
   DELETE LAST CHARACTER
========================================================= */

function deleteLast() {

    if (
        currentInput === "Error" ||
        waitingForOperand
    ) {
        return;
    }

    if (
        currentInput.length <= 1 ||
        (
            currentInput.length === 2 &&
            currentInput.startsWith("-")
        )
    ) {

        currentInput = "0";

    } else {

        currentInput =
            currentInput.slice(0, -1);
    }

    updateDisplay();
}


/* =========================================================
   PLUS / MINUS
========================================================= */

function toggleSign() {

    if (
        currentInput === "Error" ||
        currentInput === "0"
    ) {
        return;
    }

    if (currentInput.startsWith("-")) {

        currentInput =
            currentInput.substring(1);

    } else {

        currentInput =
            "-" + currentInput;
    }

    updateDisplay();
}


/* =========================================================
   PERCENTAGE
========================================================= */

function percentage() {

    if (currentInput === "Error") {
        return;
    }

    const value =
        parseFloat(currentInput);

    if (!Number.isFinite(value)) {
        return;
    }

    /*
       If there is an existing operator,
       calculate percentage relative to first value.

       Example:
       200 + 10% = 220
    */

    if (
        previousInput !== null &&
        operator !== null
    ) {

        const base =
            parseFloat(previousInput);

        if (Number.isFinite(base)) {

            if (
                operator === "+" ||
                operator === "−"
            ) {

                currentInput =
                    String(roundResult(
                        base * value / 100
                    ));

            } else {

                currentInput =
                    String(roundResult(
                        value / 100
                    ));
            }

        }

    } else {

        currentInput =
            String(roundResult(value / 100));
    }

    waitingForOperand = false;

    updateDisplay();
}


/* =========================================================
   SCIENTIFIC FUNCTIONS
========================================================= */

function scientificFunction(func) {

    if (currentInput === "Error") {
        return;
    }

    const value =
        parseFloat(currentInput);

    if (!Number.isFinite(value)) {
        return;
    }

    let result;
    let label;


    switch (func) {

        /* Square Root */

        case "sqrt":

            if (value < 0) {

                showError();

                return;
            }

            result = Math.sqrt(value);

            label = `√(${formatNumber(currentInput)})`;

            break;


        /* Square */

        case "square":

            result = value * value;

            label =
                `(${formatNumber(currentInput)})²`;

            break;


        /* Reciprocal */

        case "reciprocal":

            if (value === 0) {

                showError();

                return;
            }

            result = 1 / value;

            label =
                `1/(${formatNumber(currentInput)})`;

            break;


        /* Sine - Degree Mode */

        case "sin":

            result =
                Math.sin(
                    value * Math.PI / 180
                );

            label =
                `sin(${formatNumber(currentInput)})`;

            break;


        /* Cosine - Degree Mode */

        case "cos":

            result =
                Math.cos(
                    value * Math.PI / 180
                );

            label =
                `cos(${formatNumber(currentInput)})`;

            break;


        /* Tangent - Degree Mode */

        case "tan":

            /*
               Avoid obvious undefined values
               around 90 + 180n degrees.
            */

            const radians =
                value * Math.PI / 180;

            if (
                Math.abs(Math.cos(radians)) < 1e-12
            ) {

                showError();

                return;
            }

            result = Math.tan(radians);

            label =
                `tan(${formatNumber(currentInput)})`;

            break;


        /* LOG */

        case "log":

            if (value <= 0) {

                showError();

                return;
            }

            result = Math.log10(value);

            label =
                `log(${formatNumber(currentInput)})`;

            break;


        /* NATURAL LOG */

        case "ln":

            if (value <= 0) {

                showError();

                return;
            }

            result = Math.log(value);

            label =
                `ln(${formatNumber(currentInput)})`;

            break;


        default:

            return;
    }


    result = roundResult(result);


    if (result === "Error") {

        showError();

        return;
    }


    addHistory(
        label,
        result
    );


    expressionDisplay.textContent =
        `${label} =`;


    currentInput =
        String(result);

    waitingForOperand = true;

    updateDisplay();

    /*
       Restore completed expression
    */

    expressionDisplay.textContent =
        `${label} =`;
}


/* =========================================================
   MEMORY INDICATOR
========================================================= */

function updateMemoryIndicator() {

    memoryIndicator.style.visibility =
        memory !== 0
            ? "visible"
            : "hidden";
}


/* =========================================================
   MEMORY CLEAR
========================================================= */

function memoryClear() {

    memory = 0;

    updateMemoryIndicator();
}


/* =========================================================
   MEMORY RECALL
========================================================= */

function memoryRecall() {

    currentInput =
        String(roundResult(memory));

    waitingForOperand = true;

    updateDisplay();
}


/* =========================================================
   MEMORY ADD
========================================================= */

function memoryAdd() {

    const value =
        parseFloat(currentInput);

    if (!Number.isFinite(value)) {
        return;
    }

    memory += value;

    memory =
        roundResult(memory);

    updateMemoryIndicator();
}


/* =========================================================
   MEMORY SUBTRACT
========================================================= */

function memorySubtract() {

    const value =
        parseFloat(currentInput);

    if (!Number.isFinite(value)) {
        return;
    }

    memory -= value;

    memory =
        roundResult(memory);

    updateMemoryIndicator();
}


/* =========================================================
   ERROR
========================================================= */

function showError() {

    currentInput = "Error";

    previousInput = null;

    operator = null;

    waitingForOperand = true;

    expressionDisplay.textContent =
        "Math ERROR";

    display.textContent = "Error";


    setTimeout(() => {

        clearAll();

    }, 1600);
}


/* =========================================================
   HISTORY
========================================================= */

function addHistory(expression, result) {

    history.unshift({

        expression: expression,

        result: result,

        time:
            new Date().toLocaleTimeString()
    });


    /*
       Maximum 20 records
    */

    if (history.length > 20) {

        history.pop();
    }


    renderHistory();
}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    if (history.length === 0) {

        historyList.innerHTML = `
            <p class="empty-history">
                No calculations yet.
            </p>
        `;

        return;
    }


    historyList.innerHTML =
        history.map(item => {

            return `
                <div class="history-item">

                    <div class="history-expression">
                        ${escapeHTML(item.expression)}
                    </div>

                    <div class="history-result">
                        = ${escapeHTML(String(item.result))}
                    </div>

                    <small style="
                        display:block;
                        margin-top:5px;
                        color:#777;
                        font-size:10px;
                    ">
                        ${escapeHTML(item.time)}
                    </small>

                </div>
            `;

        }).join("");
}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   BUTTON EVENTS - DATA VALUE
========================================================= */

document
    .querySelectorAll("[data-value]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const value =
                button.dataset.value;


            /* Number */

            if (/^[0-9]$/.test(value)) {

                inputNumber(value);

                return;
            }


            /* Decimal */

            if (value === ".") {

                inputDecimal();

                return;
            }


            /* Percentage */

            if (value === "%") {

                percentage();

                return;
            }


            /* Operators */

            if (
                value === "+" ||
                value === "−" ||
                value === "×" ||
                value === "÷"
            ) {

                handleOperator(value);

                return;
            }

        });

    });


/* =========================================================
   ACTION BUTTONS
========================================================= */

document
    .querySelectorAll("[data-action]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const action =
                button.dataset.action;


            switch (action) {

                case "clear":

                    clearAll();

                    break;


                case "delete":

                    deleteLast();

                    break;


                case "sign":

                    toggleSign();

                    break;


                case "equals":

                    calculateResult();

                    break;


                case "memory-clear":

                    memoryClear();

                    break;


                case "memory-recall":

                    memoryRecall();

                    break;


                case "memory-add":

                    memoryAdd();

                    break;


                case "memory-subtract":

                    memorySubtract();

                    break;


                case "history":

                    openHistory();

                    break;
            }

        });

    });


/* =========================================================
   SCIENTIFIC BUTTONS
========================================================= */

document
    .querySelectorAll("[data-function]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const func =
                button.dataset.function;

            scientificFunction(func);

        });

    });


/* =========================================================
   HISTORY MODAL
========================================================= */

function openHistory() {

    renderHistory();

    historyModal.classList.add("active");
}


function closeHistory() {

    historyModal.classList.remove("active");
}


closeHistoryButton.addEventListener(
    "click",
    closeHistory
);


clearHistoryButton.addEventListener(
    "click",
    () => {

        history = [];

        renderHistory();
    }
);


/*
   Close when clicking outside modal
*/

historyModal.addEventListener(
    "click",
    event => {

        if (event.target === historyModal) {

            closeHistory();
        }

    }
);


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        /* Numbers */

        if (/^[0-9]$/.test(key)) {

            inputNumber(key);

            return;
        }


        /* Decimal */

        if (key === ".") {

            inputDecimal();

            return;
        }


        /* Operators */

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            const operatorMap = {

                "+": "+",

                "-": "−",

                "*": "×",

                "/": "÷"
            };


            handleOperator(
                operatorMap[key]
            );

            return;
        }


        /* Enter */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculateResult();

            return;
        }


        /* Backspace */

        if (key === "Backspace") {

            event.preventDefault();

            deleteLast();

            return;
        }


        /* Escape */

        if (key === "Escape") {

            clearAll();

            return;
        }


        /* Percentage */

        if (key === "%") {

            percentage();

            return;
        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

updateDisplay();

updateMemoryIndicator();

renderHistory();