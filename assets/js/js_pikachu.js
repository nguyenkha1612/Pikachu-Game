let script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

function loadImage() {
    let i = 0;
    let imgArr = [];
    for (i; i < 18; i++)
        imgArr.push("./assets/image/item/img" + i + ".jpg");
    return imgArr;
}

function createGameBoard(row, col) {
    let arrGameBoard = Array.from({length: row + 2}, () => Array.from({length: col + 2}, () => 0));
    let unfilledItemList = new Array();
    let arrImage = loadImage();

    let textHtml = "";
    for (let i = 1; i < arrGameBoard.length - 1; i++) {
        textHtml += "<div class=\"game-board__row\">\n";
        for (let j = 1; j < arrGameBoard[i].length - 1; j++) {
            arrGameBoard[i][j] = 1;
            textHtml += "<button id='btn" + i + "-" + j + "' class=\"game-board__item\" x=" + i + " y=" + j + "></button>\n";
            unfilledItemList.push({x: i, y: j});
        }
        textHtml += "</div>\n";
    }
    document.querySelector(".main__game-board").innerHTML += textHtml;

    while (unfilledItemList.length > 0) {
        let rdUnfilledItem1 = unfilledItemList[Math.floor(Math.random() * unfilledItemList.length)];
        let rdX1 = rdUnfilledItem1.x;
        let rdY1 = rdUnfilledItem1.y;
        let index1 = unfilledItemList.findIndex(obj => (obj.x === rdX1 && obj.y === rdY1));
        if (index1 !== -1)
            unfilledItemList.splice(index1, 1);

        let rdUnfilledItem2 = unfilledItemList[Math.floor(Math.random() * unfilledItemList.length)];
        let rdX2 = rdUnfilledItem2.x;
        let rdY2 = rdUnfilledItem2.y;
        let index2 = unfilledItemList.findIndex(obj => (obj.x === rdX2 && obj.y === rdY2));
        if (index2 !== -1)
            unfilledItemList.splice(index2, 1);

        let bgImg = arrImage[Math.floor(Math.random() * arrImage.length)];
        $("#btn" + rdX1 + "-" + rdY1).css("background-image", "url(\"" + bgImg + "\")");
        $("#btn" + rdX2 + "-" + rdY2).css("background-image", "url(\"" + bgImg + "\")");
    }

    return arrGameBoard;
}

function createInteraction() {
    $(".game-board__item").click(function () {
        console.log($(this))
        if (selectingItem === null) {
            $(this).addClass("game-board__item--selecting");
            selectingItem = $(this)
            selectingX = Number($(this).attr("x"));
            selectingY = Number($(this).attr("y"));
        } else {
            let currentItem = $(this)
            let currentX = Number($(this).attr("x"));
            let currentY = Number($(this).attr("y"));

            if (selectingItem.css("background-image") === currentItem.css("background-image"))
                if (checkTwoPoint(selectingX, selectingY, currentX, currentY) != null) {
                    $(selectingItem).addClass("game-board__item--hidden");
                    $(selectingItem).attr("disabled", true);
                    $(this).addClass("game-board__item--hidden");
                    $(this).attr("disabled", true);

                    arrGameBoard[currentX][currentY] = 0;
                    arrGameBoard[selectingX][selectingY] = 0;
                    console.log(arrGameBoard);
                    playerData.score += 50;
                    $(".toolbar__score").text("Your score: " + playerData.score);
                }

            $(selectingItem).removeClass("game-board__item--selecting");
            selectingItem = null;
            selectingX = -1;
            selectingY = -1;
        }
    });
}

//init run
let arrGameBoard = createGameBoard(10, 15);
console.log(arrGameBoard)
createInteraction();

let selectingItem = null;
let selectingX = -1;
let selectingY = -1;
let playerData = {
    score: 0,
    currentStage: 1,
    time: 10 * 60,
};
let timeLeft = playerData.time;
let selectingButton = null;

$(".tool-btn").click(function () {
    if (selectingButton === null) {
        selectingButton = $(this).attr("id")
        $(this).addClass("active")
    } else if ($(this).attr("id") === selectingButton) {
        $(this).removeClass("active")
        selectingButton = null
    } else {
        $("#" + selectingButton).removeClass("active")
        selectingButton = $(this).attr("id")
        $(this).addClass("active")
    }
});

$(".popup-btn-js").click(function () {
    if ($(this).hasClass("btn-restart") || $(this).hasClass("btn-surrender")) {
        playerData.currentStage = 1;
        timeLeft = playerData.time + 5;
        playerData.score = 0;
        restartGame();
    } else if ($(this).hasClass("btn-time")) {
        if (playerData.score >= 2000) {
            playerData.score -= 2000;
            timeLeft += 120;
        } else
            $(".popup-overlay-notice-not-enough").css("display", "block")
    } else if ($(this).hasClass("btn-confirm"))
        $(".popup-overlay-notice").css("display", "none")
    else if ($(this).hasClass("btn-swap")) {
        if (playerData.score >= 0) {
            playerData.score -= 0;
            swapGameBoard();
        } else
            $(".popup-overlay-notice-not-enough").css("display", "block")
    }

    $(".toolbar__score").text("Your score: " + playerData.score);
    $(".popup-overlay").css("display", "none")
    $("#" + selectingButton).removeClass("active")
    selectingButton = null
})

setInterval(() => {
    timeLeft -= 1;
    let timeWidth = timeLeft / playerData.time * 100;

    if (timeWidth < 20)
        $(".time-bar__time-remaining").css("background-image", "linear-gradient(to right, #E25B45, #FEBD3B)")
    else if (timeWidth >= 20 && timeWidth < 50)
        $(".time-bar__time-remaining").css("background-image", "linear-gradient(to right, #E25B45, #FEBD3B, #FED154, #9CC869)")
    else if (timeWidth >= 50 && timeWidth < 75)
        $(".time-bar__time-remaining").css("background-image", "linear-gradient(to right, #E25B45, #FEBD3B, #FED154, #9CC869, #86CACB)")
    else {
        $(".time-bar__time-remaining").css("border-radius", "28px")
        $(".time-bar__time-remaining").css("background-image", "linear-gradient(to right, #E25B45, #FEBD3B, #FED154, #9CC869, #86CACB, #8094CF, #C6A8DC)")
    }

    if (timeWidth < 99.25) {
        $(".time-bar__time-remaining").css("border-bottom-right-radius", 0);
        $(".time-bar__time-remaining").css("border-top-right-radius", 0);
    }

    if (timeLeft <= 0) {
        $(".popup-overlay-timeout").css("display", "block")
    }

    if (selectingButton != null) {
        $(".popup-overlay-" + selectingButton).css("display", "block")
    }

    $(".time-bar__time-remaining").css("width", timeWidth + "%");
}, 1000);

// check condition
function checkLineX(y1, y2, x) {
    let min = Math.min(y1, y2);
    let max = Math.max(y1, y2);
    for (let y = min + 1; y < max; y++) // met another one
        if (arrGameBoard[x][y] != 0)
            return false;
    return true;
}

function checkLineY(x1, x2, y) {
    let min = Math.min(x1, x2);
    let max = Math.max(x1, x2);
    for (let x = min + 1; x < max; x++)
        if (arrGameBoard[x][y] != 0)
            return false;
    return true;
}

function checkRectX(x1, y1, x2, y2) {
    let pMinY = {x: x1, y: y1};
    let pMaxY = {x: x2, y: y2};
    if (y1 > y2) {
        pMinY = {x: x2, y: y2}
        pMaxY = {x: x1, y: y1}
    }
    for (let y = pMinY.y; y <= pMaxY.y; y++) {
        if (y > pMinY.y && arrGameBoard[pMinY.x][y] != 0)
            return false;
        if ((arrGameBoard[pMaxY.x][y] == 0) && checkLineY(pMinY.x, pMaxY.x, y) && checkLineX(y, pMaxY.y, pMaxY.x)) {
            console.log("(" + pMinY.x + "," + pMinY.y + ") -> ("
                + pMinY.x + "," + y + ") -> (" + pMaxY.x + "," + y
                + ") -> (" + pMaxY.x + "," + pMaxY.y + ")");
            return true;
        }
    }
    return false;
}

function checkRectY(x1, y1, x2, y2) {
    let pMinX = {x: x1, y: y1};
    let pMaxX = {x: x2, y: y2};
    if (x1 > x2) {
        pMinX = {x: x2, y: y2}
        pMaxX = {x: x1, y: y1}
    }
    for (let x = pMinX.x; x <= pMaxX.x; x++) {
        if (x > pMinX.x && arrGameBoard[x][pMinX.y] != 0)
            return false;
        if ((arrGameBoard[x][pMaxX.y] == 0) && checkLineX(pMinX.y, pMaxX.y, x) && checkLineY(x, pMaxX.x, pMaxX.y)) {
            console.log("(" + pMinX.x + "," + pMinX.y + ") -> (" + x
                + "," + pMinX.y + ") -> (" + x + "," + pMaxX.y
                + ") -> (" + pMaxX.x + "," + pMaxX.y + ")");
            return true;
        }
    }
    return false;
}

function checkMoreLineX(x1, y1, x2, y2, type) {
    let pMinY = {x: x1, y: y1};
    let pMaxY = {x: x2, y: y2};
    if (y1 > y2) {
        pMinY = {x: x2, y: y2}
        pMaxY = {x: x1, y: y1}
    }
    let y = pMaxY.y + type;
    let row = pMinY.x;
    let colFinish = pMaxY.y;
    if (type == -1) {
        colFinish = pMinY.y;
        y = pMinY.y + type;
        row = pMaxY.x;
    }

    if ((arrGameBoard[row][colFinish] == 0 || pMinY.y == pMaxY.y) && checkLineX(pMinY.y, pMaxY.y, row)) {
        while (arrGameBoard[pMinY.x][y] == 0 && arrGameBoard[pMaxY.x][y] == 0) {
            if (checkLineY(pMinY.x, pMaxY.x, y)) {
                console.log("TH X " + type)
                console.log("(" + pMinY.x + "," + pMinY.y + ") -> ("
                    + pMinY.x + "," + y + ") -> (" + pMaxY.x + "," + y
                    + ") -> (" + pMaxY.x + "," + pMaxY.y + ")")
                return true;
            }
            y += type;
        }
    }
    return false;
}

function checkMoreLineY(x1, y1, x2, y2, type) {
    let pMinX = {x: x1, y: y1};
    let pMaxX = {x: x2, y: y2};
    if (x1 > x2) {
        pMinX = {x: x2, y: y2}
        pMaxX = {x: x1, y: y1}
    }
    let x = pMaxX.x + type;
    let col = pMinX.y;
    let rowFinish = pMaxX.x;
    if (type == -1) {
        rowFinish = pMinX.x;
        x = pMinX.x + type;
        col = pMaxX.y;
    }
    console.log("x " + x)
    console.log("col " + col)
    console.log("type " + type)

    if ((arrGameBoard[rowFinish][col] == 0 || pMinX.x == pMaxX.x) && checkLineY(pMinX.x, pMaxX.x, col)) {
        while (arrGameBoard[x][pMinX.y] == 0 && arrGameBoard[x][pMaxX.y] == 0) {
            if (checkLineX(pMinX.y, pMaxX.y, x)) {
                console.log("TH Y " + type);
                console.log("(" + pMinX.x + "," + pMinX.y + ") -> ("
                    + x + "," + pMinX.y + ") -> (" + x + "," + pMaxX.y
                    + ") -> (" + pMaxX.x + "," + pMaxX.y + ")");
                return true;
            }
            x += type;
        }
    }
    return false;
}

function checkTwoPoint(x1, y1, x2, y2) {
    let p1 = {x: x1, y: y1}
    let p2 = {x: x2, y: y2}
    if (!(x1 === x2 && y1 === y2) && arrGameBoard[x1][y1] == arrGameBoard[x2][y2]) {
        if (x1 == x2) {
            if (checkLineX(y1, y2, x1)) {
                console.log("ok line x");
                return [p1, p2];
            }
        }
        // check line with y
        if (y1 == y2) {
            if (checkLineY(x1, x2, y1)) {
                console.log("ok line y");
                return [p1, p2];
            }
        }
        // check in rectangle with x
        if (checkRectX(x1, y1, x2, y2)) {
            console.log("rect x");
            return [p1, p2];
        }
        // check in rectangle with y
        if (checkRectY(x1, y1, x2, y2)) {
            console.log("rect y");
            return [p1, p2];
        }
        // check more right
        if (checkMoreLineX(x1, y1, x2, y2, 1)) {
            console.log("more right");
            return [p1, p2];
        }
        // check more left
        if (checkMoreLineX(x1, y1, x2, y2, -1)) {
            console.log("more left");
            return [p1, p2];
        }
        // check more down
        if (checkMoreLineY(x1, y1, x2, y2, 1)) {
            console.log("more down");
            return [p1, p2];
        }
        // check more up
        if (checkMoreLineY(x1, y1, x2, y2, -1)) {
            console.log("more up");
            return [p1, p2];
        }
    }
    return null;
}

function restartGame() {
    $(".main__game-board-js").empty()
    arrGameBoard = createGameBoard(10, 15)
    createInteraction()
}

function swapGameBoard() {
    for (let i = 0; i < 150; i++) {
        let x1 = Math.floor(Math.random() * 10) + 1
        let y1 = Math.floor(Math.random() * 15) + 1
        let x2 = Math.floor(Math.random() * 10) + 1
        let y2 = Math.floor(Math.random() * 15) + 1

        let i1 = $("#btn" + x1 + "-" + y1)
        let i2 = $("#btn" + x2 + "-" + y2)
        console.log(i1, i2)
        swap(i1, i2)
    }

    function swap(i1, i2) {
        let x1 = Number(i1.attr('x'))
        let y1 = Number(i1.attr('y'))
        let x2 = Number(i2.attr('x'))
        let y2 = Number(i2.attr('y'))

        let tempValue = arrGameBoard[x1][y1]
        arrGameBoard[x1][y1] = arrGameBoard[x2][y2]
        arrGameBoard[x2][y2] = tempValue

        let tempStyle = i1.attr('style')
        let tempID = i1.attr('id')

        i1.attr('x', x2)
        i1.attr('y', y2)
        i1.attr('style', i2.attr('style'))
        i1.attr('id', i2.attr('id'))

        i2.attr('x', x1)
        i2.attr('y', y1)
        i2.attr('style', tempStyle)
        i2.attr('id', tempID)
        console.log(i1, i2)
    }
}