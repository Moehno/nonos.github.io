let previewInDocument = [];
let boardInDocument = [];
let rowHints = [];
let colHints = [];
let board = [];

document.getElementById("creationForm").addEventListener('submit', (event) => {
    event.preventDefault();

    const rowValue = creationForm.querySelector("#rowSelector").value;
    const colValue = creationForm.querySelector("#colSelector").value;

    createBoard(rowValue, colValue);
    renderGame(rowValue, colValue);
    // renderHints();
});

document.getElementById("playfield").addEventListener("pointerup", (element) => {
    const targetBox = element.target.closest(".playfieldBox");

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
        previewInDocument[targetRow][targetCol].classList.add("checked");
        getHint(targetRow, targetCol);
    } else if (targetValue === 1) {
        // console.log("Filled Space found");
        board[targetRow][targetCol] = 0;
        boardInDocument[targetRow][targetCol].classList.remove("checked");
        previewInDocument[targetRow][targetCol].classList.remove("checked");
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
    for (let i = 0; i < board[row].length; i++) {
        const currentValue = board[row][i];

        if (currentValue === 0) {
            if (currentHint > 0) {
                currentRowHints.push(currentHint);
            }

            currentHint = 0;
        } else if (currentValue === 1) {
            currentHint++;

            if ((i + 1) >= board[row].length) {
                currentRowHints.push(currentHint);
            }
        } else {
            console.log("Error at rowHint creation");
        }
    }

    // get col hint
    currentHint = 0;
    for (let j = 0; j < board.length; j++) {
        const currentValue = board[j][col];

        if (currentValue === 0) {
            if (currentHint > 0) {
                currentColHints.push(currentHint);
            }

            currentHint = 0;
        } else if (currentValue === 1) {
            currentHint++;

            if ((j + 1) >= board.length) {
                currentColHints.push(currentHint);
            }
        } else {
            console.log("Error at colHint creation");
        }
    }

    rowHints[row] = currentRowHints;
    colHints[col] = currentColHints;

    renderColHints(colHints.length);
    renderRowHints(rowHints.length);
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

function renderGame(selectedRows, selectedCols) {
    renderPreview(selectedRows, selectedCols);
    renderColHints(selectedCols);
    renderRowHints(selectedRows);
    renderPlayfield(selectedRows, selectedCols);
}

function renderPreview(selectedRows, selectedCols) {
    const preview = document.getElementById("preview");
    const tempPreview = document.createDocumentFragment();

    for (let i = 0; i < selectedRows; i++) {
        const newRow = document.createElement("div");
        newRow.classList.add("previewRow");

        for (let j = 0; j < selectedCols; j++) {
            const newBox = document.createElement("div");
            newBox.classList.add("previewBox");
            newRow.appendChild(newBox);
        }

        tempPreview.appendChild(newRow);
    }

    preview.replaceChildren(tempPreview);

    previewInDocument = Array.from(document.getElementById("preview").querySelectorAll(".previewRow"));
    previewInDocument = previewInDocument.map(previewRow =>
        Array.from(previewRow.querySelectorAll(".previewBox"))
    );
}

function renderColHints(selectedCols) {
    const colHintsInDocument = document.getElementById("colHints");
    const tempColHintsInDocument = document.createDocumentFragment();
    const colHintAmount = getLargestSubarrayLength(colHints);

    for (let i = 0; i < selectedCols; i++) {
        const newColHintCol = document.createElement("div");
        newColHintCol.classList.add("colHintCol");
        tempColHintsInDocument.appendChild(newColHintCol);

        let boxCounter = 0;

        do {
            const newHintBox = document.createElement("div");
            newHintBox.classList.add("colHintBox");
            newColHintCol.appendChild(newHintBox);
            boxCounter++;
        } while (boxCounter < colHintAmount);

        // enter numbers into each box
        for (let j = 1; j <= colHints[i].length; j++) {
            newColHintCol.children[colHintAmount - j].textContent = colHints[i][colHints[i].length - j];
        }
    }

    colHintsInDocument.replaceChildren(tempColHintsInDocument);
}

function renderRowHints(selectedRows) {
    const rowHintsInDocument = document.getElementById("rowHints");
    const tempRowHintsInDocument = document.createDocumentFragment();
    const rowHintAmount = getLargestSubarrayLength(rowHints);

    for (let i = 0; i < selectedRows; i++) {
        const newRowHintRow = document.createElement("div");
        newRowHintRow.classList.add("rowHintRow");
        tempRowHintsInDocument.appendChild(newRowHintRow);

        let boxCounter = 0;

        do {
            const newHintBox = document.createElement("div");
            newHintBox.classList.add("rowHintBox");
            newRowHintRow.appendChild(newHintBox);
            boxCounter++;
        } while (boxCounter < rowHintAmount);

        // enter numbers into each box
        for (let j = 1; j <= rowHints[i].length; j++) {
            newRowHintRow.children[rowHintAmount - j].textContent = rowHints[i][rowHints[i].length - j];
        }
    }

    rowHintsInDocument.replaceChildren(tempRowHintsInDocument);
}

function renderPlayfield(selectedRows, selectedCols) {
    const playfield = document.getElementById("playfield");
    const tempPlayfield = document.createDocumentFragment();

    for (let i = 0; i < selectedRows; i++) {
        const newRow = document.createElement("div");
        newRow.classList.add("playfieldRow");

        for (let j = 0; j < selectedCols; j++) {
            const newBox = document.createElement("div");
            newBox.classList.add("playfieldBox");
            newBox.dataset.row = i;
            newBox.dataset.col = j;
            newRow.appendChild(newBox);
        }

        tempPlayfield.appendChild(newRow);
    }

    playfield.replaceChildren(tempPlayfield);

    // assign DOM board to a variable as a 2D array
    boardInDocument = Array.from(document.getElementById("playfield").querySelectorAll(".playfieldRow"));
    boardInDocument = boardInDocument.map(playfieldRow =>
        Array.from(playfieldRow.querySelectorAll(".playfieldBox"))
    );
}
