new p5;

var templateHTML;

function stringToHTML(str) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(str, 'text/html');
    return doc.body;
};

function loadHTML() {
    fetch('./template.html').then(function (response) {
        return response.text();
    }).then(function (html) {
        templateHTML = stringToHTML(html);
    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}

function preload() {

    var templatka, clone, insert;

    fetch('./template.html').then(function (response) {
        return response.text();
    }).then(function (html) {
        templateHTML = stringToHTML(html);

        templatka = templateHTML.querySelector("#sidebar");
        clone = templatka.content.cloneNode(true);
        insert = clone.querySelector(".sidebar-content");

        select("#sidebarContentHolder").child(insert);

    }).catch(function (err) {
        console.warn('Something went wrong.', err);
    });
}

Number.prototype.between = function (a, b) {
    let minVal = min([a, b]);
    let maxVal = max([a, b]);

    return this > minVal && this < maxVal;
};

function getLettersFromAlphabet() {
    const letters = (() => {
        return [...Array(26)].map((val, i) => String.fromCharCode(i + 65));
    })();

    return letters;
}

function merge2Objects(obj1, obj2) {
    return {
        ...obj1,
        ...obj2
    };
}

class Action {
    showModal() {}
}

const action = new Action();

class UserInterface {

    constructor() {
        this.executeQueue = {};
        this.modalOpened = false;
    }

    createInterface() {
        let sizeW = settings.squareSize * (settings.squaresBySideW + 2) + 11 * settings.squareSpacer + 6;
        let sizeH = settings.squareSize * (settings.squaresBySideH + 2) + 11 * settings.squareSpacer + 6;
        this.canvas = createCanvas(sizeW, sizeH).parent(select('.canvasDiv'));

        return this;
    }

    generateBoard() {

        this.board = [];
        let total = 1;

        for (let y = 0; y < settings.squaresBySideH + 2; y++) {
            for (let x = 0; x < settings.squaresBySideW + 2; x++) {

                let iteratorIndex = {
                    x: x,
                    y: y
                }

                let posKart = {
                    x: y - (settings.squaresBySideH + 2) / 2,
                    y: -x + (settings.squaresBySideW + 2) / 2
                }

                if (((y == 0 || y == settings.squaresBySideH + 1) && x > 0 && x < settings.squaresBySideW + 1) ||
                    ((x == 0 || x == settings.squaresBySideW + 1) && y > 0 && y < settings.squaresBySideH + 1)) {
                    //Index
                    this.board.push(new Index(iteratorIndex, posKart, total));
                } else if (y != 0 && y != settings.squaresBySideH + 1) {
                    this.board.push(new Segment(iteratorIndex, posKart, total));
                    total++;
                }



            }
        }
        return this;
    }

    checkBoardClicks() {
        if (!this.modalOpened)
            for (let segment of this.board) {
                if (!(segment instanceof Index)) {
                    if (segment.mousePointing()) segment.colorSegment();
                }
            }
    }

    refreshBoard() {
        clear();

        for (let segment of userInterface.board) {
            segment.display();
        }

        for (const fxn in this.executeQueue) {
            this.executeQueue[fxn]();
        }
    }

}

const userInterface = new UserInterface();

class Segment {
    constructor(iteratorIndex, posKart, num) {
        this.iteratorIndex = iteratorIndex;
        this.posKart = posKart;
        this.num = num;
        this.pos = createVector(
            this.iteratorIndex.x * settings.squareSize + settings.squareSpacer * this.iteratorIndex.x + 2,
            this.iteratorIndex.y * settings.squareSize + settings.squareSpacer * this.iteratorIndex.y + 2
        );
        this.stroke = settings.squareStroke;
        this.fill = settings.squareFill;
        this.round = settings.squareCurvature;
        this.textColor = settings.squareTextColor;
        this.textStroke = settings.squareTextStrokeColor;
        this.textIsInvisible = false;
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);
        stroke(this.stroke);
        fill(this.fill);

        rect(0, 0, settings.squareSize, settings.squareSize, this.round)

        if (this.txt && !this.textIsInvisible) {
            textSize(settings.squareTextSize);
            fill(this.textColor);
            stroke(this.textStroke)
            textAlign(CENTER, CENTER)
            strokeWeight(settings.squareTextWeight);
            text(this.txt, 2, 2, settings.squareSize, settings.squareSize);
        }

        pop();
    }

    mousePointing() {
        return mouseX.between(this.pos.x, this.pos.x + settings.squareSize) &&
            mouseY.between(this.pos.y, this.pos.y + settings.squareSize);
    }
}

class Index extends Segment {
    constructor(iteratorIndex) {
        super(iteratorIndex, null, null);
        this.stroke = settings.indexStroke;
        this.fill = settings.indexFill;
        this.round = settings.indexCurvature;

        this.txt = this.iteratorIndex.x;
        if (this.iteratorIndex.x == 0 || this.iteratorIndex.x == 11) this.txt = this.iteratorIndex.y;
    }

    display() {
        super.display();
    }
}

$('#modal').on('show.bs.modal', function () {
    userInterface.modalOpened = true;
})

$('#modal').on('hidden.bs.modal', function () {
    userInterface.modalOpened = false;
})