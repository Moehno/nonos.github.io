const creationForm = document.getElementById("creationForm");
let board = [];

creationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const rowSelector = creationForm.querySelector("#rowSelector");
    const colSelector = creationForm.querySelector("#colSelector");

    createBoard(rowSelector.value, colSelector.value);
});

function createBoard(maxRows, maxCols) {
    const outerGameWrapper = document.getElementById("outerGameWrapper");

    for (let i = 0; i < maxRows; i++) {
        board[i] = [];
        for (let j = 0; j < maxCols; j++) {
            board[i][j] = 0;
        }
    }

    const innerGameWrapper = document.createElement("div");
    innerGameWrapper.setAttribute("id", innerGameWrapper);

    for (let k = 0; k < maxRows; k++) {
        const newRow = document.createElement("div");
        newRow.classList.add("gameRow");
        for (let l = 0; l < maxCols; l++) {
            const newBox = document.createElement("div");
            newBox.classList.add("gameBox");
            newBox.dataset.row = k;
            newBox.dataset.col = l;
            newRow.appendChild(newBox);
        }

        innerGameWrapper.appendChild(newRow);
    }

    outerGameWrapper.appendChild(innerGameWrapper);
    console.log(outerGameWrapper);
}


document.getElementById("outerGameWrapper").addEventListener("click", (element) => {
    targetBox = element.closest(".gameBox");
    console.log(targetBox);
});