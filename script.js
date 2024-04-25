class LifeGame {

    constructor(div, resultBlock) {
        this.div = div;

        this.resultBlock = resultBlock;
        this.width = 50;
        this.height = 50;
        this.cellSize = 10;
        this.gap = 1;

        this.cursorDotElement = null;


        this.div.addEventListener("click", (e) => {

            const [x, y] = this.getCoordinatesFromEvent(e);

            console.log(this.getCoordinatesFromEvent(e));

            if (!this.board[x]) { this.board[x] = [] }
            this.board[x][y] = this.board[x][y] ? 0 : 1;
            this.render();

        })

        this.div.addEventListener("mousemove", (e) => {

            const [left, top] = this.getCoordinatesFromEvent(e);

            this.cursorDotElement.style.left = (this.gap + left * (this.gap + this.cellSize)) + "px";

            this.cursorDotElement.style.top = (this.gap + top * (this.gap + this.cellSize)) + "px";

        })
    }



    getCoordinatesFromEvent(e) {

        const Ex = e.clientX - document.querySelector('#gameField div').getBoundingClientRect().left - this.gap - this.cellSize / 2;

        const Ey = e.clientY - document.querySelector('#gameField div').getBoundingClientRect().top - this.gap - this.cellSize / 2;

        let x = (roundTo(Ex, (this.cellSize + this.gap))) / (this.cellSize + this.gap)
        let y = (roundTo(Ey, (this.cellSize + this.gap))) / (this.cellSize + this.gap)

        return [x, y];

    }


    initBoard() {

        this.board = [];
        // this.nextBoard = [];

        for (let index = 0; index < this.height; index++) {
            this.board[index] = new Array(this.width);
        }

        // for (let index = 0; index < this.height; index++) {
        //     this.nextBoard[index] = new Array(this.width);
        // }
    }


    clearField() {
        this.initBoard();
        this.render();
    }


    fillRandom() {

        this.initBoard();
        let cnt = randomIntFromInterval(this.width, this.width * Math.min(this.height, 10000));

        for (let index = 0; index < cnt; index++) {

            const [x, y] = [randomIntFromInterval(0, this.width), randomIntFromInterval(0, this.height)]

            if (!this.board[x]) { this.board[x] = [] }


            this.board[x][y] = 1;

        }
        this.render();


    }


    evolute() {

        let t0 = performance.now();

        const nextBoard = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {

                const alive = this.board[x]?.[y] === 1;

                const aliveSiblingsCount = this.countAliveSiblings(x, y);

                if (!nextBoard[x]) nextBoard[x] = [];

                nextBoard[x][y] = alive
                    ? [2, 3].includes(aliveSiblingsCount) ? 1 : 0
                    : [3].includes(aliveSiblingsCount) ? 1 : 0

                    ;
            }

        }

        this.board = JSON.parse(JSON.stringify(nextBoard));
        this.render();
        let t1 = performance.now();

        this.showTimestamp((t1 - t0).toFixed(2));

    }


    showTimestamp(stamp) {
        this.resultBlock.innerHTML = stamp;
    }



    getSiblingCoords(x, y) {

        return [

            [x - 1, y - 1], [x - 1, y], [x - 1, y + 1],


            [x, y - 1], [x, y + 1],


            [x + 1, y - 1], [x + 1, y], [x + 1, y + 1],

        ].map(([x, y]) => {

            if (x < 0) x = this.width - 1;
            if (x > this.width - 1) x = 0;
            if (y < 0) y = this.height - 1;
            if (y > this.height - 1) y = 0;

            return [

                +x, +y

            ]


        })

    }



    countAliveSiblings(i, j) {

        let aliveAroundCounter = 0;

        for (const [x, y] of this.getSiblingCoords(+i, +j)) {
            aliveAroundCounter += +this.board[x]?.[y] || 0;

            if (aliveAroundCounter >= 4) break;
        }

        return aliveAroundCounter



    }


    toggleCellByXY(x, y) {

        const cell = this.div.querySelector(`[data-x='${x}'][data-y='${y}']`);
        this.toggleCell(cell);

    }

    toggleCell(cell) {

        cell.classList.contains("alive")
            ? cell.classList.remove("alive")
            : cell.classList.add("alive")

    }


    render() {

        let markup = `<div style="overflow:hidden;position:relative;width:${this.width * (this.cellSize + this.gap) + this.gap}px;height:${this.height * (this.cellSize + this.gap) + this.gap}px;">
        

        <div style="position:absolute; left:-20px; top:-20px;width:${this.cellSize}px;height:${this.cellSize}px;z-index:2;" class="cell cursorDot"></div>
        
        `;

        let points = [];

        for (let x = 0; x < this.width; x++) {

            for (let y = 0; y < this.height; y++) {
                if (this.board[x][y]) {
                    points.push([x, y]);
                }

            }
        }


        for (const [x, y] of points) {

            markup += `<div data-x="${x}" data-y="${y}" style="
                position:absolute;
                left:${this.gap + x * (this.cellSize + this.gap)}px;
                top:${this.gap + y * (this.cellSize + this.gap)}px;
                width:${this.cellSize}px;
                height:${this.cellSize}px;
                " class="cell`
            if (this.board[x][y]) {
                markup += ` alive`
            }
            markup += `"></div>`

        }

        markup += `</div>`;

        this.div.innerHTML = markup;

        this.cursorDotElement = this.div.querySelector(".cursorDot");
    }




}


const main = () => {

    const [
        gameField,
        resultsBlock,
        evoluteBtn,
        runBtn,
        randomBtn,
        clearBtn

    ] = [
            document.querySelector("#gameField"),
            document.querySelector("#results"),
            document.querySelector("#evolute"),
            document.querySelector("#run"),
            document.querySelector("#random"),
            document.querySelector("#clear"),
        ];



    //gameField.insertAdjacentHTML("afterbegin", "<span>Пися</span>")


    const lifeGame = new LifeGame(gameField, resultsBlock);

    lifeGame.initBoard();

    lifeGame.render();


    evoluteBtn.addEventListener("click", () => { lifeGame.evolute() });
    randomBtn.addEventListener("click", () => { lifeGame.fillRandom() });
    clearBtn.addEventListener("click", () => { lifeGame.clearField(); toggleLifeExecution(true) });


    const sizeInput = document.querySelector("#size");
    sizeInput.addEventListener("input", () => {
        const size = parseInt(sizeInput.value);
        if (!isNaN(size)) {
            lifeGame.width = size;
            lifeGame.height = size;
            lifeGame.initBoard();
            lifeGame.render();

        }

    })

    let isRunning = null;

    const toggleLifeExecution = (forceStop = false) => {
        if (isRunning) {
            clearInterval(isRunning);
            isRunning = null;
            runBtn.innerHTML = "Запустить";
        } else {
            if (forceStop) { return }
            isRunning = setInterval(() => {
                requestAnimationFrame(() => { lifeGame.evolute(); });
            }, 0);
            runBtn.innerHTML = "Остановить";
        }
    }

    runBtn.addEventListener("click", () => { toggleLifeExecution() });


}



main();



function roundTo(a, x) {
    let b = a / x;
    b = Math.round(b);
    return b * x
};


function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}
