/* ----------------------------------------
----------------- HEADER ------------------
-----------------------------------------*/

const sidebar = document.getElementById("sidebar");
const openSidebarButton = document.getElementById("openSidebarButton");

let dirtyFlags = {
    "styles": true,
    "preview": true,
    "colHints": true,
    "rowHints": true,
    "playfield": true
}

let previewInDocument = [];
let boardInDocument = [];
let rowHints = [];
let colHints = [];
let board = [];

/* ----------------------------------------
------------- EVENT LISTENERS -------------
-----------------------------------------*/

openSidebarButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");

    if (sidebar.classList.contains("open")) {
        openSidebarButton.innerHTML = "✕";
    } else {
        openSidebarButton.innerHTML = "☰";
    }
});

const creationForm = document.getElementById("creationForm");

creationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const rowValue = creationForm.querySelector("#creationRowSelector").value;
    const colValue = creationForm.querySelector("#creationColSelector").value;

    createBoard(rowValue, colValue);
    renderGame(rowValue, colValue);
    document.getElementById("outerGameWrapper").classList.remove("hidden");
    document.getElementById("creationForm").classList.add("hidden");
});

const changeSizeForm = document.getElementById("changeSizeForm");

changeSizeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const rowValue = changeSizeForm.querySelector("#changeSizeRowSelector").value;
    const colValue = changeSizeForm.querySelector("#changeSizeColSelector").value;

    if (!rowValue || !colValue) {
        console.log("Größe ändern: Ungültige Werte eingegeben");
        return;
    }

    if ((rowValue === rowHints.length) && (colValue === colHints.length)) {
        window.alert("Das Board hat bereits diese Größe!");
    } else {
        changeBoardSize(colValue, rowValue);
    }
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


/* ----------------------------------------
--------- INTERNAL BOARD & HINTS ----------
-----------------------------------------*/

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

    // create intern colHints
    colHints = [];
    for (let i = 0; i < selectedCols; i++) {
        colHints[i] = [];
    }

    // create intern rowHints
    rowHints = [];
    for (let i = 0; i < selectedRows; i++) {
        rowHints[i] = [];
    }
}

function getHint(selectedRow, selectedCol) {
    // this function searches all hints of the given row and column and outputs them into an global array
    const currentRowHints = [];
    const currentColHints = [];

    // get row hint
    let currentHint = 0;
    for (let i = 0; i < board[selectedRow].length; i++) {
        const currentValue = board[selectedRow][i];

        if (currentValue === 0) {
            if (currentHint > 0) {
                currentRowHints.push(currentHint);
            }

            currentHint = 0;
        } else if (currentValue === 1) {
            currentHint++;

            if ((i + 1) >= board[selectedRow].length) {
                currentRowHints.push(currentHint);
            }
        } else {
            console.log("Error at rowHint creation");
        }
    }

    // get col hint
    currentHint = 0;
    for (let j = 0; j < board.length; j++) {
        const currentValue = board[j][selectedCol];

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

    rowHints[selectedRow] = currentRowHints;
    colHints[selectedCol] = currentColHints;

    dirtyFlags.styles = true;
    dirtyFlags.rowHints = true;
    dirtyFlags.colHints = true;

    renderGame(rowHints.length, colHints.length);
}

function getAllHints() {
    // get all row hints
    for (let i = 0; i < board.length; i++) {
        const currentRowHints = [];
        let currentHint = 0;

        for (let j = 0; j < board[i].length; j++) {
            const currentValue = board[i][j];

            if (currentValue === 0) {
                if (currentHint > 0) {
                    currentRowHints.push(currentHint);
                }
                currentHint = 0;
            } else if (currentValue === 1) {
                currentHint++;

                if ((j + 1) >= board[j].length) {
                    currentRowHints.push(currentHint);
                }
            } else {
                console.log("Error at rowHint creation");
            }
        }
        rowHints[i] = currentRowHints;
    }

    //get all col hints
    for (let i = 0; i < board[0].length; i++) {
        const currentColHints = [];
        let currentHint = 0;

        for (let j = 0; j < board.length; j++) {
            const currentValue = board[j][i];

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
        colHints[i] = currentColHints;
    }

    console.log("rowhints",rowHints,"colhints", colHints)
}

/* ----------------------------------------
--------------- RENDERING -----------------
-----------------------------------------*/

function renderGame(selectedRows, selectedCols) {
    if (dirtyFlags.styles) updateStyles(selectedRows, selectedCols);
    if (dirtyFlags.preview) renderPreview(selectedRows, selectedCols);
    if (dirtyFlags.colHints) renderColHints(selectedCols);
    if (dirtyFlags.rowHints) renderRowHints(selectedRows);
    if (dirtyFlags.playfield) renderPlayfield(selectedRows, selectedCols);
    resetDirtyFlags();
}

function updateStyles(selectedRows, selectedCols) {
    const preview = document.getElementById("preview");

    if (preview) {
        const colHintAmount = Math.max(getLargestSubarrayLength(colHints), 1);
        const rowHintAmount = Math.max(getLargestSubarrayLength(rowHints), 1);
        const boxSize = 21;
        const minBoxSize = 1;

        if ((boxSize * colHintAmount / selectedCols) < minBoxSize || (boxSize * rowHintAmount / selectedRows) < minBoxSize) {
            preview.style.display = "none";
        } else {
            preview.style.display = "flex";
            preview.style.setProperty('--cols', selectedCols);
            preview.style.setProperty('--rows', selectedRows);

            preview.style.aspectRatio = `${selectedCols} / ${selectedRows}`;
        }
    }
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
            if (board[i][j] === 1) {
                newBox.classList.add("checked");
            }
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
            if (board[i][j] === 1) {
                newBox.classList.add("checked");
            }
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

function resetDirtyFlags() {
    for (let flag in dirtyFlags) {
        dirtyFlags[flag] = false;
    }
}

function getLargestSubarrayLength(array) {
    // helper function to get the size of the largest array in a 2d array
    let maxLength = 0;

    for (let i = 0; i < array.length; i++) {
        if (array[i].length > maxLength) {
            maxLength = array[i].length;
        }
    }

    return maxLength;
}

/* ----------------------------------------
------------- CHANGE BOARDSIZE ------------
-----------------------------------------*/

function changeBoardSize(selectedCols, selectedRows) {
    const oldBoardWidth = colHints.length;
    const oldBoardHeight = rowHints.length;

    // change height
    if (selectedRows < oldBoardHeight) reduceBoardHeight(selectedRows);
    else if (selectedRows > oldBoardHeight) increaseBoardHeight(selectedRows, selectedCols);

    // change width
    if (selectedCols < oldBoardWidth) reduceBoardWidth(selectedCols);
    else if (selectedCols > oldBoardWidth) increaseBoardWidth(selectedCols);

    // update hints
    getAllHints();

    // re-render board
    renderGame(selectedRows, selectedCols);
    console.log(colHints, rowHints)
}

function increaseBoardWidth(selectedCols) {
    // increased internal board size
    for (let i = 0; i < board.length; i++) {
        for (let j = board[i].length; j < selectedCols; j++) {
            board[i][j] = 0;
        }
    }

    // increase colHints size
    for (let i = colHints.length; i < selectedCols; i++) {
        colHints[i] = [];
    }

    // set dirty flags
    dirtyFlags.styles = true;
    dirtyFlags.preview = true;
    dirtyFlags.colHints = true;
    dirtyFlags.playfield = true;
}

function reduceBoardWidth(selectedCols) {
    //reduce internal board size
    for (let i = 0; i < board.length; i++) {
        board[i].splice(selectedCols);
    }

    // reduce colHints size
    colHints.splice(selectedCols);

    // set dirty flags
    dirtyFlags.styles = true;
    dirtyFlags.preview = true;
    dirtyFlags.colHints = true;
    dirtyFlags.playfield = true;
}

function increaseBoardHeight(selectedRows, selectedCols) {
    // increase internal board height
    for (let i = board.length; i < selectedRows; i++) {
        board[i] = [];
        for (let j = 0; j < selectedCols; j++) {
            board[i][j] = 0;
        }
    }

    // increase rowHints height
    for (let i = rowHints.length; i < selectedRows; i++) {
        rowHints[i] = [];
    }

    // set dirty flags
    dirtyFlags.styles = true;
    dirtyFlags.preview = true;
    dirtyFlags.rowHints = true;
    dirtyFlags.playfield = true;
}

function reduceBoardHeight(selectedRows) {
    // reduce internal board height
    board.splice(selectedRows);

    // reduce rowHints height
    rowHints.splice(selectedRows);

    // set dirty flags
    dirtyFlags.styles = true;
    dirtyFlags.preview = true;
    dirtyFlags.rowHints = true;
    dirtyFlags.playfield = true;
}


/* ----------------------------------------
------------------ OTHER ------------------
-----------------------------------------*/

function logData() {
    const puzzlaData = { "colHints": colHints, "rowHints": rowHints };
    const encryptedPuzzleData = btoa(JSON.stringify(puzzlaData));
    const decryptedPuzzleData = JSON.parse(atob(encryptedPuzzleData));
    console.log(puzzlaData);
    console.log(encryptedPuzzleData);
    console.log(decryptedPuzzleData);
}
