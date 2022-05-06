let script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

function loadImage() {
    let url = "./assets/image/stage" + playerData.currentStage + "/img";
    let extension = ".png";
    let imgArr = [];
    for (let i = 0; i < 18; i++) {
        if ((playerData.currentStage === 2 && i >= 16) || (playerData.currentStage === 3 && i >= 17))
            imgArr.push(url + 0 + extension)
        else imgArr.push(url + i + extension)
    }
    return imgArr;
}

function createGameBoard(row, col) {
    $(".toolbar__stage").text("Stage " + playerData.currentStage)

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

    if (playerData.currentStage === 3) {
        for (let i = 1; i < arrGameBoard.length - 1; i++)
            for (let j = 1; j < arrGameBoard[i].length - 1; j++) {
                let btn = $("#btn" + i + "-" + j)
                let backgroundImage = btn.css("background-image")
                if (backgroundImage.substring(backgroundImage.length - 10, backgroundImage.length - 2) === 'img0.png') {
                    btn.addClass("game-board__item--ice")
                    btn.attr("disabled", true)
                }
            }
    }

    // background & rule
    $('.popup-overlay-notice-rule').css('display', 'block')
    switch (playerData.currentStage) {
        case 1:
            $('.message-rule').text("Try to match all pokemons to win!")
            break
        case 2:
            $('.message-rule').text("Collect all suns to win!")
            break
        case 3:
            $('.message-rule').text("Ice block prevents you from winning!")
            break
        case 4:
            $('.message-rule').text("Water type Pokemon that dives and emerges continuously!")
            break
        case 5:
            $('.message-rule').text("Ghost type Pokemon steal your time & points whenever you failed to match them!")
            break
        case 6:
            $('.message-rule').text("The wind blows them to the left side of the board!")
            break
        default:
            $('.message-rule').text("Try your best!")
    }
    $("#main-container").css("background-image", "url('./assets/image/background/background-" + playerData.currentStage + ".jpg')")

    return arrGameBoard;
}

function createInteraction() {
    $(".game-board__item").click(function () {
        if (selectingItem === null) {
            $(this).addClass("game-board__item--selecting");
            selectingItem = $(this)
            selectingX = Number($(this).attr("x"));
            selectingY = Number($(this).attr("y"));
        } else {
            let currentItem = $(this)
            let currentX = Number($(this).attr("x"));
            let currentY = Number($(this).attr("y"));

            if (selectingItem.css("background-image") === currentItem.css("background-image")) {
                if (checkTwoPoint(selectingX, selectingY, currentX, currentY) != null) {
                    $(selectingItem).addClass("game-board__item--hidden");
                    $(selectingItem).attr("disabled", true);
                    $(this).addClass("game-board__item--hidden");
                    $(this).attr("disabled", true);

                    arrGameBoard[currentX][currentY] = 0;
                    arrGameBoard[selectingX][selectingY] = 0;
                    playerData.score += 50;
                    $(".toolbar__score").text("Your score: " + playerData.score);

                    console.log(arrGameBoard)
                    moveToLeftSide()
                    checkWinCondition()
                } else stealTimeScore()
            } else stealTimeScore()


            $(selectingItem).removeClass("game-board__item--selecting");
            selectingItem = null;
            selectingX = -1;
            selectingY = -1;

        }
    })
}

//init run
let playerData = {
    score: 0,
    currentStage: 1,
    maxStage: 6,
    time: 10 * 60,
    win: false,
}

let arrGameBoard = createGameBoard(10, 15)
createInteraction()

let selectingItem = null
let selectingX = -1
let selectingY = -1

let timeLeft = playerData.time
let selectingButton = null

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
        switch ($(this).attr('typeBtn')) {
            case 'btn-restart':
                restartGame()
                break
            case 'btn-surrender':
                restartGame()
                break
            case 'btn-time':
                if (playerData.score >= 2000) {
                    playerData.score -= 2000
                    timeLeft += 120
                } else
                    $(".popup-overlay-notice-not-enough").css("display", "block")
                break
            case 'btn-swap':
                if (playerData.score >= 2000) {
                    playerData.score -= 2000
                    swapGameBoard()
                } else
                    $(".popup-overlay-notice-not-enough").css("display", "block")
                break
            case 'btn-boom':
                if (playerData.score >= 500) {
                    playerData.score -= 500
                    destroyPokemon()
                    moveToLeftSide()
                    setTimeout(function () {
                        checkWinCondition()
                    }, 2500)
                } else
                    $(".popup-overlay-notice-not-enough").css("display", "block")
                break
            case 'btn-confirm':
                $(".popup-overlay-notice").css("display", "none")
                break
            case 'btn-won':
                $(".popup-overlay-won").css("display", "none")
                playerData.win = false
                playerData.currentStage += 1
                timeLeft = playerData.time + 5
                nextStage()
                break
            default:
        }

        $(".toolbar__score").text("Your score: " + playerData.score)
        $(".popup-overlay").css("display", "none")
        $("#" + selectingButton).removeClass("active")
        selectingButton = null
    }
)

// 1s loop
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

    $(".time-bar__time-remaining").css("width", timeWidth + "%")
}, 1000)

setInterval(() => {
    if (playerData.currentStage === 4)
        swim()
}, 5000)

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
    playerData.currentStage = 1
    timeLeft = playerData.time + 5
    playerData.score = 0

    $(".main__game-board-js").empty()
    arrGameBoard = createGameBoard(10, 15)
    createInteraction()
}

function nextStage() {
    $(".main__game-board-js").empty()
    setTimeout(function () {
        arrGameBoard = createGameBoard(10, 15)
        createInteraction()
    }, 500)
}

function swapGameBoard() {
    let arrImage = loadImage()

    let existList = []
    for (let i = 1; i < arrGameBoard.length - 1; i++)
        for (let j = 1; j < arrGameBoard[i].length - 1; j++)
            if (arrGameBoard[i][j] != 0)
                existList.push("#btn" + i + "-" + j)

    while (existList.length > 0) {
        let rdIndex = Math.floor(Math.random() * existList.length)
        let item = existList[rdIndex]
        if (rdIndex > -1)
            existList.splice(rdIndex, 1)
        for (let i = 0; i < existList.length; i++)
            if ($(existList[i]).css("background-image") === $(item).css("background-image")) {
                let rdImage = arrImage[Math.floor(Math.random() * arrImage.length)]
                $(item).css("background-image", "url(\"" + rdImage + "\"")
                $(existList[i]).css("background-image", "url(\"" + rdImage + "\"")
                existList.splice(i, 1)
                break
            }
    }
}

function destroyPokemon() {
    let existList = []
    for (let i = 1; i < arrGameBoard.length - 1; i++)
        for (let j = 1; j < arrGameBoard[i].length - 1; j++)
            if (arrGameBoard[i][j] != 0)
                existList.push("#btn" + i + "-" + j)
    let selectedList = []

    if (existList.length > 10)
        while (selectedList.length < 10) {
            let rdIndex = Math.floor(Math.random() * existList.length)
            let item = existList[rdIndex]
            selectedList.push(item)
            let temp
            let isFound = false
            if (rdIndex > -1)
                temp = existList.splice(rdIndex, 1)

            for (let i = 0; i < existList.length; i++)
                if ($(existList[i]).css("background-image") === $(item).css("background-image")) {
                    selectedList.push($(existList[i]))
                    existList.splice(i, 1)
                    isFound = true
                    break
                }
            if (!isFound) {
                existList.push(temp)
                selectedList.pop()
            }
        }
    else selectedList = existList

    for (const e of selectedList) {
        let x = Number($(e).attr('x'))
        let y = Number($(e).attr('y'))

        $(e).addClass('game-board__item--boom')
        arrGameBoard[x][y] = 0
        $(e).attr("disabled", true)
        setTimeout(function () {
            $(e).addClass('game-board__item--hidden')
            if (playerData.currentStage === 3)
                $(e).removeClass('game-board__item--ice')
        }, 2500)
    }

}

function checkWinCondition() {
    let isFound = false
    if (playerData.currentStage === 2)
        for (let i = 1; i < arrGameBoard.length - 1; i++)
            for (let j = 1; j < arrGameBoard[i].length - 1; j++) {
                let backgroundImage = $("#btn" + i + "-" + j).css("background-image")
                if (backgroundImage.substring(backgroundImage.length - 10, backgroundImage.length - 2) === "img0.png") {
                    isFound = true
                    break
                }
            }
    else if (playerData.currentStage === 3)
        for (let i = 1; i < arrGameBoard.length - 1; i++)
            for (let j = 1; j < arrGameBoard[i].length - 1; j++) {
                let backgroundImage = $("#btn" + i + "-" + j).css("background-image")
                if (backgroundImage.substring(backgroundImage.length - 10, backgroundImage.length - 2) !== "img0.png")
                    if (arrGameBoard[i][j] !== 0) {
                        isFound = true
                        break
                    }
            }
    else {
        for (let i = 1; i < arrGameBoard.length - 1; i++)
            for (let j = 1; j < arrGameBoard[i].length - 1; j++)
                if (arrGameBoard[i][j] !== 0) {
                    isFound = true
                    break
                }
    }

    if (!isFound) {
        playerData.win = true
        if (playerData.currentStage < playerData.maxStage)
            $(".popup-overlay-notice-won").css("display", "block")
        else
            $('.notice-won--lastStage').css('display', 'block')
    }
}

function swim() {
    let emptyList = []
    let existList = []
    for (let i = 1; i < arrGameBoard.length - 1; i++)
        for (let j = 1; j < arrGameBoard[i].length - 1; j++)
            if (arrGameBoard[i][j] === 0)
                emptyList.push('#btn' + i + '-' + j)
            else existList.push('#btn' + i + '-' + j)

    if (emptyList.length > 0) {
        let rdEmpty = emptyList[Math.floor(Math.random() * emptyList.length)]
        let rdItem = existList[Math.floor(Math.random() * existList.length)]

        if (rdItem !== $(selectingItem).attr('id')) {
            $('.btn-boom--js').attr('disabled', true)
            $('.btn-boom--js').css('cursor', 'not-allowed')

            let itemImage = $(rdItem).css('background-image')
            $(rdItem).addClass('game-board__item--dive')
            $(rdItem).attr('disabled', true)
            setTimeout(function () {
                arrGameBoard[Number($(rdEmpty).attr('x'))][Number($(rdEmpty).attr('y'))] = 1
                arrGameBoard[Number($(rdItem).attr('x'))][Number($(rdItem).attr('y'))] = 0
                $(rdItem).css('background-image', $(rdEmpty).css('background-image'))
                $(rdEmpty).css('background-image', itemImage)
                $(rdItem).attr('disabled', true)
                $(rdEmpty).attr('disabled', false)
                $(rdItem).addClass('game-board__item--hidden')
                $(rdEmpty).removeClass('game-board__item--hidden')

                $(rdItem).attr('disabled', false)
                $(rdItem).removeClass('game-board__item--dive')
                $(rdEmpty).removeClass('game-board__item--boom')
                $(rdItem).removeClass('game-board__item--boom')

                $('.btn-boom--js').attr('disabled', false)
                $('.btn-boom--js').css('cursor', 'pointer')
            }, 1000)
        }
    }
}

function stealTimeScore() {
    if (playerData.currentStage === 5) {
        playerData.score -= 100
        timeLeft -= 60
        $(".time-bar__time-remaining").addClass("time-bar__time-remaining--stolen")
        $(".toolbar__score").addClass("toolbar__score--stolen")
        $(".toolbar__score").text("Your score: " + playerData.score)
        $(".time-bar__time-remaining").css("width", timeLeft / playerData.time * 100 + "%")
        setTimeout(() => {
            $(".time-bar__time-remaining").removeClass("time-bar__time-remaining--stolen")
            $(".toolbar__score").removeClass("toolbar__score--stolen")
        }, 1500)
    }
}

function moveToLeftSide() {
    if (playerData.currentStage === 6)
        for (let i = 1; i < arrGameBoard.length - 1; i++)
            for (let j = 2; j < arrGameBoard[i].length - 1; j++)
                if (arrGameBoard[i][j] !== 0) {
                    let k = j
                    while (k > 1)
                        if (arrGameBoard[i][k - 1] === 0)
                            swap($('#btn' + i + '-' + k), $('#btn' + i + '-' + --k))
                        else break
                }


    function swap(item, empty) {
        let itemImage = $(item).css('background-image')
        arrGameBoard[Number($(empty).attr('x'))][Number($(empty).attr('y'))] = 1
        arrGameBoard[Number($(item).attr('x'))][Number($(item).attr('y'))] = 0
        $(item).css('background-image', $(item).css('background-image'))
        $(empty).css('background-image', itemImage)
        $(item).attr('disabled', true)
        $(empty).attr('disabled', false)
        $(item).addClass('game-board__item--hidden')
        $(empty).removeClass('game-board__item--hidden')
        $(empty).removeClass('game-board__item--boom')
        $(item).removeClass('game-board__item--boom')
    }
}