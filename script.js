/* ----------------------------------------
----------------- HEADER ------------------
-----------------------------------------*/

const creationForm = document.getElementById("creationForm");
const sidebar = document.getElementById("sidebar");
const changeSizeForm = document.getElementById("changeSizeForm");
const openSidebarButton = document.getElementById("openSidebarButton");
const savePuzzleButton = document.getElementById("savePuzzleButton");
const loadPuzzleButton = document.getElementById("loadPuzzleButton");
const loadPuzzleForm = document.getElementById("loadPuzzleForm");
const domPlayfield = document.getElementById("playfield");
const clickInputButton = document.getElementById("clickInputButton");
const dragInputButton = document.getElementById("dragInputButton");
const lineInputButton = document.getElementById("lineInputButton");

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

let controller = null;

/* ----------------------------------------
------------- EVENT LISTENERS -------------
-----------------------------------------*/

// function to open submenus in the sidebar
openSidebarButton.addEventListener("click", openSidebar);

// save current data in localstorage
savePuzzleButton.addEventListener("click", savePuzzle);

// trigger dialog to select which puzzle to load
loadPuzzleButton.addEventListener("click", loadPuzzleList);

// load target puzzle
loadPuzzleForm.addEventListener("submit", loadPuzzle);

// create the initial board with all empty spaces
creationForm.addEventListener("submit", validateBoardCreation);

// change size of the board, will preserve playerinputs 
changeSizeForm.addEventListener("submit", validateChangeBoardSize);

// register playerinput in playfield area to check or uncheck spaces
// domPlayfield.addEventListener("pointerup", createBoardInteraction);

// change input methode to "click"
clickInputButton.addEventListener("click", () => changeInputMethod(boardClickInput));

// change input methdo to "drag"
dragInputButton.addEventListener("click", () => changeInputMethod(boardDragInput));

// change input method to "line"
lineInputButton.addEventListener("click", () => changeInputMethod(boardLineInput));

/* ----------------------------------------
--------- INTERNAL BOARD & HINTS ----------
-----------------------------------------*/

// create internal arrays for faster calculations
function createBoard(selectedRows, selectedCols) {
    // create internal board
    board = [];
    for (let i = 0; i < selectedRows; i++) {
        board[i] = [];
        for (let j = 0; j < selectedCols; j++) {
            board[i][j] = 0;
        }
    }

    // create internal colHints
    colHints = [];
    for (let i = 0; i < selectedCols; i++) {
        colHints[i] = [];
    }

    // create internal rowHints
    rowHints = [];
    for (let i = 0; i < selectedRows; i++) {
        rowHints[i] = [];
    }
}

// get the hints of only the target row and col, then update colHints and rowHints
function getHint(selectedRow, selectedCol) {
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

    // output into global arrays
    rowHints[selectedRow] = currentRowHints;
    colHints[selectedCol] = currentColHints;

    // set dirty flags
    setDirtyFlags("styles", "rowHints", "colHints")

    renderGame(rowHints.length, colHints.length);
}

// function the gather all hints in the board, used when changing board size
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
}

/* ----------------------------------------
--------------- RENDERING -----------------
-----------------------------------------*/

// render all elements with dirty flags
function renderGame(selectedRows, selectedCols) {
    if (dirtyFlags.styles) updateStyles(selectedRows, selectedCols);
    if (dirtyFlags.preview) renderPreview(selectedRows, selectedCols);
    if (dirtyFlags.colHints) renderColHints(selectedCols);
    if (dirtyFlags.rowHints) renderRowHints(selectedRows);
    if (dirtyFlags.playfield) renderPlayfield(selectedRows, selectedCols);
    resetDirtyFlags();
}

// update style sheet variables
function updateStyles(selectedRows, selectedCols) {
    const preview = document.getElementById("preview");

    if (preview) {
        const colHintAmount = Math.max(getLargestSubarrayLength(colHints), 1);
        const rowHintAmount = Math.max(getLargestSubarrayLength(rowHints), 1);
        const boxSize = 21;
        const minBoxSize = 1;

        // if preview would get too small, disable preview, otherwise update aspect ratio
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

// render preview, will also update the preview board containing preview dom elements
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

    // assign DOM board to a variable as a 2D array
    previewInDocument = Array.from(document.getElementById("preview").querySelectorAll(".previewRow"));
    previewInDocument = previewInDocument.map(previewRow =>
        Array.from(previewRow.querySelectorAll(".previewBox"))
    );
}

//render colHints
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

// render rowHints
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

// render playfield, will also update the playfield board containing preview dom elements
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

// helper function to get the size of the largest array in a 2d array
function getLargestSubarrayLength(array) {
    let maxLength = 0;

    for (let i = 0; i < array.length; i++) {
        if (array[i].length > maxLength) {
            maxLength = array[i].length;
        }
    }

    return maxLength;
}

/* ------------- DIRTY FLAGS -------------*/

// function to easily set any number of dirty flags
function setDirtyFlags(...flags) {
    flags.forEach(flag => {
        dirtyFlags[flag] = true;
    });
}

// reset dirty flags to prevent unneccessary rendering on container elements
function resetDirtyFlags() {
    for (let flag in dirtyFlags) {
        dirtyFlags[flag] = false;
    }
}

/* ----------------------------------------
------------ BOARD INTERACTION ------------
-----------------------------------------*/

function changeInputMethod(interactionFunction) {
    if (controller) controller.abort();

    controller = new AbortController();
    interactionFunction(controller.signal);
}

/* ------------ CLICK INPUT -------------*/

function boardClickInput(signal) {

    function onClick(event) {
        const targetBox = event.target.closest(".playfieldBox");

        // cancel function if input is not a valid box
        if (!targetBox) return;

        const targetRow = targetBox.dataset.row;
        const targetCol = targetBox.dataset.col;
        const targetValue = board[targetRow][targetCol];

        if (targetValue === 0) {
            board[targetRow][targetCol] = 1;
            boardInDocument[targetRow][targetCol].classList.add("checked");
            previewInDocument[targetRow][targetCol].classList.add("checked");
            getHint(targetRow, targetCol);
        } else if (targetValue === 1) {
            board[targetRow][targetCol] = 0;
            boardInDocument[targetRow][targetCol].classList.remove("checked");
            previewInDocument[targetRow][targetCol].classList.remove("checked");
            getHint(targetRow, targetCol);
        } else {
            console.log("Invalid space value");
        }
    }

    domPlayfield.addEventListener("pointerup", onClick, { signal });
}

/* ------------- DRAG INPUT -------------*/

function boardDragInput(signal) {
    let captureStarted = false;
    let targetElements = [];

    function onPointerDown(event) {
        domPlayfield.setPointerCapture(event.pointerId);

        captureStarted = true;
        let capturedBox = event.target.closest(".playfieldBox");

        if (capturedBox) {
            capturedBox.classList.add("highlighted");
            targetElements.push(capturedBox);
        }

        console.log("Pointer down", targetElements);
    }

    function onPointerMove(event) {
        if (captureStarted) {
            let capturedBox = getBoxAt(event.clientX, event.clientY);

            if (capturedBox && !targetElements.includes(capturedBox)) {
                capturedBox.classList.add("highlighted");
                targetElements.push(capturedBox);

                console.log("New Box found: ", capturedBox);
            }
        }
    }

    function onPointerUp(event) {
        domPlayfield.releasePointerCapture(event.pointerId);

        if (captureStarted) {
            captureStarted = false;

            switch (targetElements.length) {
                case 0:
                    console.log("Drag Input: No Elements found");
                    break;

                case 1:
                    console.log("Drag Input: One Element Found: ", targetElements[0]);
                    targetElements[0].classList.remove("highlighted");
                    break;

                default:
                    console.log("Drag Input: Multiple Elements found: ", targetElements);
                    targetElements.forEach(element => {
                        element.classList.remove("highlighted");
                    });
                    break;
            }
        }
        targetElements = [];
    }

    domPlayfield.addEventListener("pointerdown", onPointerDown, { signal });
    domPlayfield.addEventListener("pointermove", onPointerMove, { signal });
    domPlayfield.addEventListener("pointerup", onPointerUp, { signal });
    domPlayfield.addEventListener("pointercancel", onPointerUp, { signal });
}

/* ------------- LINE INPUT -------------*/

function boardLineInput(signal) {
    let startElement;
    let targetElement;
    captureStarted = false;

    function onPointerDown(event) {
        domPlayfield.setPointerCapture(event.pointerId);

        captureStarted = true;
        let capturedBox = event.target.closest(".playfieldBox");
        if (capturedBox) startElement = capturedBox;
        console.log("Pointer down", capturedBox);
    }

    function onPointerMove(event) {
        if (captureStarted) {
            let capturedBox = getBoxAt(event.clientX, event.clientY);

            if (!startElement && capturedBox) startElement = capturedBox;
            else if (capturedBox) targetElement = capturedBox;
        }
    }

    function onPointerUp(event) {
        domPlayfield.releasePointerCapture(event.pointerId);
    }

    domPlayfield.addEventListener("pointerdown", onPointerDown, { signal });
    domPlayfield.addEventListener("pointermove", onPointerMove, { signal });
    domPlayfield.addEventListener("pointerup", onPointerUp, { signal });
    domPlayfield.addEventListener("pointercancel", onPointerUp, { signal });
}

/* ----------- HELPER FUNCTION ----------*/

function getBoxAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el?.closest(".playfieldBox");
}

/* ----------------------------------------
------------- CHANGE BOARDSIZE ------------
-----------------------------------------*/

// function to change board size, compared to create baord, this will preserve already existing inputs
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
    setDirtyFlags("styles", "preview", "colHints", "playfield");
}

function reduceBoardWidth(selectedCols) {
    //reduce internal board size
    for (let i = 0; i < board.length; i++) {
        board[i].splice(selectedCols);
    }

    // reduce colHints size
    colHints.splice(selectedCols);

    // set dirty flags
    setDirtyFlags("styles", "preview", "colHints", "playfield");
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
    setDirtyFlags("styles", "preview", "rowHints", "playfield");
}

function reduceBoardHeight(selectedRows) {
    // reduce internal board height
    board.splice(selectedRows);

    // reduce rowHints height
    rowHints.splice(selectedRows);

    // set dirty flags
    setDirtyFlags("styles", "preview", "rowHints", "playfield");
}


/* ----------------------------------------
------------- UI & NAVIGATION -------------
-----------------------------------------*/

function validateBoardCreation(event) {
    event.preventDefault();

    const rowValue = creationForm.querySelector("#creationRowSelector").value;
    const colValue = creationForm.querySelector("#creationColSelector").value;

    createBoard(rowValue, colValue);
    renderGame(rowValue, colValue);
    // changeInputMethod(boardClickInput);

    document.getElementById("outerGameWrapper").classList.remove("hidden");
    document.getElementById("creationForm").classList.add("hidden");
}

function validateChangeBoardSize(event) {
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
}

function openSidebar() {
    sidebar.classList.toggle("open");

    if (sidebar.classList.contains("open")) {
        openSidebarButton.innerHTML = "✕";
    } else {
        openSidebarButton.innerHTML = "☰";
    }
}

function savePuzzle(event) {
    event.stopPropagation();

    if (board.length === 0) {
        window.alert("Speichern nicht möglich: Es wurde noch kein Board erstellt");
    } else {
        const saveName = prompt("Gib einen namen ein (min. 3 Zeichen)");

        if (saveName.length < 3) {
            window.alert("Der Name muss mindestens 3 Zeichen enthalten");
        } else {
            window.alert("Das Puzzle wurde gespeichert");
            const puzzleData = JSON.stringify({ "board": board, "colHints": colHints, "rowHints": rowHints });
            localStorage.setItem(saveName, puzzleData);
        }
    }
}

function loadPuzzleList(event) {
    event.stopPropagation();

    const loadPuzzleDialogInDocument = document.getElementById("loadPuzzleDialog");
    const loadPuzzleListInDocument = document.getElementById("loadPuzzleList");
    const tempLoadPuzzleList = document.createDocumentFragment();
    const puzzleAmount = localStorage.length;
    const maxLength = 10;

    for (let i = 0; i < puzzleAmount; i++) {
        const puzzleName = localStorage.key(i);
        const listEntry = document.createElement("option");

        listEntry.classList.add("loadPuzzleListEntry");
        listEntry.value = puzzleName;
        listEntry.textContent = puzzleName;

        tempLoadPuzzleList.appendChild(listEntry);
    }

    loadPuzzleListInDocument.replaceChildren(tempLoadPuzzleList);
    loadPuzzleListInDocument.setAttribute("size", Math.min(puzzleAmount, maxLength));

    loadPuzzleDialogInDocument.showModal();
}

function loadPuzzle(event) {
    event.preventDefault();

    document.getElementById("loadPuzzleDialog").close();
    const puzzleName = document.getElementById("loadPuzzleList").value;
    const puzzle = JSON.parse(localStorage.getItem(puzzleName));

    board = puzzle.board;
    colHints = puzzle.colHints;
    rowHints = puzzle.rowHints;

    setDirtyFlags("styles", "preview", "colHints", "rowHints", "playfield");
    renderGame(rowHints.length, colHints.length);

    document.getElementById("outerGameWrapper").classList.remove("hidden");
    document.getElementById("creationForm").classList.add("hidden");
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
