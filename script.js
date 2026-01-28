let maxRows = 0;
let maxCols = 0;
let boardInDocument = [];
let board = [];
let rowHints = [];
let colHints = [];

document.getElementById("creationForm").addEventListener('submit', (event) => {
    event.preventDefault();

    const rowValue = creationForm.querySelector("#rowSelector").value;
    const colValue = creationForm.querySelector("#colSelector").value;

    createBoard(rowValue, colValue);
    renderBoard(rowValue, colValue);
    renderHints();
});

document.getElementById("gameBoxContainer").addEventListener("pointerup", (element) => {
    const targetBox = element.target.closest(".gameBox");

    if (!targetBox) {
        return;
    }

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

function createBoard(selectedRows, selectedCols) {
    // create intern arrays for faster calculations
    // create intern board
    board = [];
    for (let i = 0; i < selectedRows; i++) {
        board[i] = [];
        for (let j = 0; j < selectedCols; j++) {
            board[i][j] = 0;
        }
    }

    // create intern rowHints
    rowHints = [];
    for (let i = 0; i < selectedRows; i++) {
        rowHints[i] = [];
    }

    // create intern colHints
    colHints = [];
    for (let i = 0; i < selectedCols; i++) {
        colHints[i] = [];
    }
}

function getHint(row, col) {
    // this function searches all hints of the given row and column and outputs them into an global array
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
            console.log("Error at rowHint creation");
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
            console.log("Error at colHint creation");
        }
    }

    rowHints[row] = currentRowHints;
    colHints[col] = currentColHints;

    renderHints();
}

function renderBoard(selectedRows, selectedCols) {
    const gameBoxContainer = document.getElementById("gameBoxContainer");
    const tempGameBoxContainer = document.createDocumentFragment();
    const rowHintsInDocument = document.getElementById("gameRowHints");
    const tempRowHintsInDocument = document.createDocumentFragment();
    const colHintsInDocument = document.getElementById("gameColHints");
    const tempColHintsInDocument = document.createDocumentFragment();
    maxRows = selectedRows;
    maxCols = selectedCols;

    // create the DOM elements for the board and insert board into DOM
    for (let i = 0; i < selectedRows; i++) {
        const newRow = document.createElement("div");
        newRow.classList.add("gameRow");

        for (let j = 0; j < selectedCols; j++) {
            const newBox = document.createElement("div");
            newBox.classList.add("gameBox");
            newBox.dataset.row = i;
            newBox.dataset.col = j;
            newRow.appendChild(newBox);
        }

        tempGameBoxContainer.appendChild(newRow);
    }

    for (let i = 0; i < selectedRows; i++) {
        const newRowHintRow = document.createElement("div");
        newRowHintRow.classList.add("gameRowHintRow");
        tempRowHintsInDocument.appendChild(newRowHintRow);
    }

    for (let i = 0; i < selectedCols; i++) {
        const newColHintCol = document.createElement("div");
        newColHintCol.classList.add("gameColHintCol");
        tempColHintsInDocument.appendChild(newColHintCol);
    }

    gameBoxContainer.replaceChildren(tempGameBoxContainer);
    rowHintsInDocument.replaceChildren(tempRowHintsInDocument);
    colHintsInDocument.replaceChildren(tempColHintsInDocument);

    // assign DOM board to a variable as a 2D array
    boardInDocument = Array.from(document.getElementById("gameBoxContainer").querySelectorAll(".gameRow"));
    boardInDocument = boardInDocument.map(gameRow =>
        Array.from(gameRow.querySelectorAll(".gameBox"))
    );
}

function renderHints() {
    const rowHintRowsInDocument = Array.from(document.getElementById("gameRowHints").querySelectorAll(".gameRowHintRow"));
    const colHintColsInDocument = Array.from(document.getElementById("gameColHints").querySelectorAll(".gameColHintCol"));
    const rowHintAmount = getLargestSubarrayLength(rowHints);
    const colHintAmount = getLargestSubarrayLength(colHints);

    // render row hints
    for (let i = 0; i < rowHints.length; i++) {
        const tempRowHintRowInDocument = document.createDocumentFragment();
        let boxCounter = 0;

        do {
            const newHintBox = document.createElement("div");
            newHintBox.classList.add("gameRowHintBox");
            tempRowHintRowInDocument.appendChild(newHintBox);
            boxCounter++;
        } while (boxCounter < rowHintAmount);

        console.log(rowHintRowsInDocument[i]);

        rowHintRowsInDocument[i].replaceChildren(tempRowHintRowInDocument);

    }

    // enter numbers into each box
    for (let i = 0; i < rowHints.length; i++) {

        for (let j = 1; j <= rowHints[i].length; j++) {
            rowHintRowsInDocument[i].children[rowHintAmount - j].textContent = rowHints[i][rowHints[i].length - j];
        }
    }

    // render col hint
    // render empty boxes
    for (let i = 0; i < colHints.length; i++) {
        const tempColHintColInDocument = document.createDocumentFragment();
        let boxCounter = 0;

        do {
            const newHintBox = document.createElement("div");
            newHintBox.classList.add("gameColHintBox");
            tempColHintColInDocument.appendChild(newHintBox);
            boxCounter++;
        } while (boxCounter < colHintAmount);

        colHintColsInDocument[i].replaceChildren(tempColHintColInDocument);

    }

    // enter numbers into each box
    for (let i = 0; i < colHints.length; i++) {

        for (let j = 1; j <= colHints[i].length; j++) {
            colHintColsInDocument[i].children[colHintAmount - j].textContent = colHints[i][colHints[i].length - j];
        }
    }
}

function getLargestSubarrayLength(array) {
    maxLength = 0;

    for (let i = 0; i < array.length; i++) {
        if (array[i].length > maxLength) {
            maxLength = array[i].length;
        }
    }

    return maxLength;
}
