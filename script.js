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
    const oldInnerGameWrapper = document.getElementById("innerGameWrapper");
    const newInnerGameWrapper = document.createElement("div");
    maxRows = selectedRows;
    maxCols = selectedCols;

    // create the DOM elements for the board and insert board into DOM
    for (let k = 0; k < selectedRows; k++) {
        const newRow = document.createElement("div");
        newRow.classList.add("gameRow");
        for (let l = 0; l < selectedCols; l++) {
            const newBox = document.createElement("div");
            newBox.classList.add("gameBox");
            newBox.dataset.row = k;
            newBox.dataset.col = l;
            newRow.appendChild(newBox);
        }

        newInnerGameWrapper.appendChild(newRow);
    }

    oldInnerGameWrapper.innerHTML = newInnerGameWrapper.innerHTML;

    // assign DOM board to a variable as a 2D Array
    boardInDocument = Array.from(document.getElementById("innerGameWrapper").querySelectorAll(".gameRow"));
    boardInDocument = boardInDocument.map(gameRow =>
        Array.from(gameRow.querySelectorAll(".gameBox"))
    );

    // create 2D intern board for faster calculations
    for (let i = 0; i < selectedRows; i++) {
        board[i] = [];
        rowHints[i] = [];
        for (let j = 0; j < selectedCols; j++) {
            board[i][j] = 0;
            colHints[j] = [];
        }
    }


    console.log(oldInnerGameWrapper);
    console.log(rowHints);
    console.log(colHints);
}




document.getElementById("outerGameWrapper").addEventListener("click", (element) => {
    const targetBox = element.target.closest(".gameBox");
    const targetRow = targetBox.dataset.row;
    const targetCol = targetBox.dataset.col;
    const targetValue = board[targetRow][targetCol];

    if (targetValue === 0) {
        console.log("Empty space found");
        board[targetRow][targetCol] = 1;
        boardInDocument[targetRow][targetCol].classList.add("checked");
        createHints(targetRow, targetCol);
    } else if (targetValue === 1) {
        console.log("Filled Space found");
        board[targetRow][targetCol] = 0;
        boardInDocument[targetRow][targetCol].classList.remove("checked");
        createHints(targetRow, targetCol);
    } else {
        console.log("Error");
    }
});

function createHints(row, col) {
    const currentRowHints = [];
    const currentColHints = [];

    //create row hint
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
            console.log("Error at rowHint creation")
        }
    }

    // create col hint
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
            console.log("Error at colHint creation")
        }
    }

    rowHints[row] = currentRowHints;
    colHints[col] = currentColHints;
    console.log(rowHints, colHints);
}


function checkAllHints() {

}
