const creationForm = document.getElementById("creationForm");
let maxRows = 0;
let maxCols = 0;
let boardInDocument = [];
let board = [];
let rowHints = [];
let colHints = [];

creationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const rowSelector = creationForm.querySelector("#rowSelector");
    const colSelector = creationForm.querySelector("#colSelector");

    createBoard(rowSelector.value, colSelector.value);
});

function createBoard(selectedRows, selectedCols) {
    const innerGameWrapper = document.getElementById("innerGameWrapper");
    const tempInnerGameWrapper = document.createElement("div");
    const rowHintsInDocument = document.getElementById("gameRowHints");
    const tempRowHintsInDocument = document.createElement("div");
    const colHintsInDocument = document.getElementById("gameColHints");
    const tempColHintsInDocument = document.createElement("div");
    maxRows = selectedRows;
    maxCols = selectedCols;

    // create the DOM elements for the board and insert board into DOM
    for (let k = 0; k < selectedRows; k++) {
        const newRow = document.createElement("div");
        newRow.classList.add("gameRow");

        const newRowHintRow = document.createElement("div");
        newRowHintRow.classList.add("gameRowHintRow");
        tempRowHintsInDocument.appendChild(newRowHintRow);

        for (let l = 0; l < selectedCols; l++) {
            const newBox = document.createElement("div");
            newBox.classList.add("gameBox");
            newBox.dataset.row = k;
            newBox.dataset.col = l;
            newRow.appendChild(newBox);
        }

        tempInnerGameWrapper.appendChild(newRow);
    }

    innerGameWrapper.innerHTML = tempInnerGameWrapper.innerHTML;
    rowHintsInDocument.innerHTML = tempRowHintsInDocument.innerHTML;

    // assign DOM board to a variable as a 2D array
    boardInDocument = Array.from(document.getElementById("innerGameWrapper").querySelectorAll(".gameRow"));
    boardInDocument = boardInDocument.map(gameRow =>
        Array.from(gameRow.querySelectorAll(".gameBox"))
    );

    // create intern board as 2D array for faster calculations
    for (let i = 0; i < selectedRows; i++) {
        board[i] = [];
        rowHints[i] = [];
        for (let j = 0; j < selectedCols; j++) {
            board[i][j] = 0;
            colHints[j] = [];
        }
    }
}

document.getElementById("outerGameWrapper").addEventListener("click", (element) => {
    const targetBox = element.target.closest(".gameBox");
    const targetRow = targetBox.dataset.row;
    const targetCol = targetBox.dataset.col;
    const targetValue = board[targetRow][targetCol];

    if (targetValue === 0) {
        // console.log("Empty space found");
        board[targetRow][targetCol] = 1;
        boardInDocument[targetRow][targetCol].classList.add("checked");
        getHint(targetRow, targetCol);
    } else if (targetValue === 1) {
        // console.log("Filled Space found");
        board[targetRow][targetCol] = 0;
        boardInDocument[targetRow][targetCol].classList.remove("checked");
        getHint(targetRow, targetCol);
    } else {
        // console.log("Error");
    }
});

function getHint(row, col) {
    const currentRowHints = [];
    const currentColHints = [];

    // get row hint
    let currentHint = 0;
    for (let i = 0; i < maxCols; i++) {
        const currentValue = board[row][i];

        if (currentValue === 0) {
            if (currentHint > 0) {
                currentRowHints.push(currentHint);
            }

            currentHint = 0;
        } else if (currentValue === 1) {
            currentHint++;

            if ((i + 1) >= maxCols) {
                currentRowHints.push(currentHint);
            }
        } else {
            // console.log("Error at rowHint creation");
        }
    }

    // get col hint
    currentHint = 0;
    for (let j = 0; j < maxRows; j++) {
        const currentValue = board[j][col];

        if (currentValue === 0) {
            if (currentHint > 0) {
                currentColHints.push(currentHint);
            }

            currentHint = 0;
        } else if (currentValue === 1) {
            currentHint++;

            if ((j + 1) >= maxRows) {
                currentColHints.push(currentHint);
            }
        } else {
            // console.log("Error at colHint creation");
        }
    }

    rowHints[row] = currentRowHints;
    colHints[col] = currentColHints;

    renderHint(row, col)
}

function renderHint(row, col) {
    const rowHintRowsInDocument = Array.from(document.getElementById("gameRowHints").querySelectorAll(".gameRowHintRow"));
    const rowHintAmount = getLargestSubarrayLength(rowHints);

    // render empty boxes
    rowHints.forEach((element, index) => {
        const tempRowHintRowInDocument = document.createElement("div");
        for (i = 0; i < rowHintAmount; i++) {
            const newHintBox = document.createElement("div");
            newHintBox.classList.add("gameRowHintBox");
            tempRowHintRowInDocument.appendChild(newHintBox);
        }
        rowHintRowsInDocument[index].innerHTML = tempRowHintRowInDocument.innerHTML;
    });

    // enter numbers into each box
    rowHints.forEach((element, i) => {
        // console.log(element)
        element.forEach((e, j) => {
            console.log(rowHintRowsInDocument[i].children[j]);
            rowHintRowsInDocument[i].children[j].textContent = e;
            console.log(e)
        })
    });

    // render col hint
}

function getLargestSubarrayLength(array) {
    maxLength = 0;

    array.forEach(element => {
        if (element.length > maxLength) {
            maxLength = element.length;
        }
    });

    return maxLength;
}

function checkAllHints() {

}
