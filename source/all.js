const title = document.querySelector('.title');
const body = document.querySelector('body');
const control = document.querySelector('.control');
const startBtn = document.querySelector('.start-btn');
const score = document.querySelector('.score');
const scoreBoard = document.querySelector('.score-board');
const endPanel = document.querySelector('.end-game-panel');
const insertRank = document.getElementById('insertRank');
const rankSec = document.querySelector('.ranking-sec');

//控制方向
class Vector {

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    //v as a param that consist of { x, y };

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    set(v) {
        this.x = v.x;
        this.y = v.y;
    }

    //length() {
    //    return Math.sqrt(this.x * this.x + this.y * this.y);
    //}

    equal(v) {
        return this.x === v.x && this.y === v.y;
    }

    clone() {
        return new Vector(this.x, this.y);
    }

    mul(s) {
        return new Vector(this.x * s, this.y * s);
    }
}

//蛇本身
class Snake {

    constructor() {
        this.body = [];
        this.head = new Vector(17, 17);
        this.maxLength = 5;//initial snake body length
        this.speed = new Vector(0, -1);//initial the direction where the snake gonna go
        this.direction = 'Up';
    }

    update() {
        this.body.push(this.head);

        let newHead = this.head.add(this.speed);
        this.head = newHead;

        while (this.body.length > this.maxLength) {
            this.body.shift();
            //前進的途中維持陣列長度
        }
    }

    setDirection(dir) {
        let target = new Vector(0, -1);

        switch (dir) {
            case 'Up':
                target = new Vector(0, -1);
                break;
            case 'Down':
                target = new Vector(0, 1);
                break;
            case 'Left':
                target = new Vector(-1, 0);
                break;
            case 'Right':
                target = new Vector(1, 0);
                break;
        }

        //validate direciton is not the same and reverse way
        if (!target.equal(this.speed) && !target.equal(this.speed.mul(-1))) {
            this.speed = target;
        }

    }

    checkBoundary(gameWidth) {
        let xRange = 0 <= this.head.x && this.head.x < gameWidth;
        let yRange = 0 <= this.head.y && this.head.y < gameWidth;

        return xRange && yRange;
    }

    hitSelf() {
        let check = this.body;
        let head = this.head;

        for (let i = 0; i < check.length; i++) {
            if (check[i].x === head.x && check[i].y === head.y) {
                return true;
            }
        }

        return false;
    }
}

//遊戲整體與流程
class Game {

    constructor() {
        //set canvas
        this.blockWidth = 13; //every single block width
        this.blockGutter = 1; //gutter width among blocks
        this.gameWidth = 35 // set the map size

        this.speed = 30;
        this.snake = new Snake(); //snake mounted
        this.score = 0;
        this.foods = [];
        this.bonus = 0;

        this.start = false;
        this.rank = JSON.parse(localStorage.getItem('snakeRanking')) || [];
    }

    //initialize all game
    init() {
        //set canvas size
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.blockWidth * this.gameWidth + this.blockGutter * (this.gameWidth - 1);
        this.canvas.height = this.canvas.width;
        this.render();
        this.writeRank();

        console.log(this.rank);

        setTimeout(() => {
            this.update();
        }, 300);

        this.manyFoods(4);
    }

    startGame() {
        this.start = true;
        this.snake = new Snake();

        control.classList.add('hide');

        this.update();
        this.score = 0;
        this.speed = 25;
        this.bonus = 0;

        this.playSound('C5', -10);
        this.playSound('C6', -10, 200);
    }

    endGame() {
        this.start = false;

        scoreBoard.innerText = this.score;
        endPanel.classList.remove('d-none');

        this.playSound('C5', 0);
        this.playSound('C4', 0, 200);

    }

    updateRank() {
        let name = insertRank.value;

        if(name.length <= 0 || name.length > 5) {
            alert('5 characters limit');
            return 0;
        }

        this.rank.push({
            name: name,
            score: this.score
        })


        this.rank.sort((a, b) => {

            if(a.score > b.score) {
                return -1;
            } 

            if(a.score < b.score) {
                return 1;
            }

            return 0;
        })

        if(this.rank.length > 10) {
            this.rank.pop();
        }

        localStorage.setItem('snakeRanking', JSON.stringify(this.rank));
        this.writeRank();

        insertRank.value = '';
        this.closeEndPanel();
    }

    writeRank() {
        let str = ``

        for (let i = 0; i < this.rank.length; i++) {
            str += `<li class="ranking-item">
                        <p>${this.rank[i].name}</p>
                        <p>${this.rank[i].score}</p>
                    </li>`;
        }

        rankSec.innerHTML = str;
    }

    closeEndPanel() {
        endPanel.classList.add('d-none');
        control.classList.remove('hide');
    }

    render() {
        // render the shole canvas
        this.ctx.fillStyle = 'rgb(43, 43, 43)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // render blocks
        for (let i = 0; i < this.gameWidth; i++) {
            for (let j = 0; j < this.gameWidth; j++) {

                this.drawBlock(new Vector(i, j), '#000')

            }
        }

        this.snake.body.forEach((el) => {

            this.drawBlock(el, "#fff");

        })

        //render foods
        for (let i = 0; i < this.foods.length; i++) {

            this.drawBlock(this.foods[0], 'red');
            this.drawBlock(this.foods[i], '#05c46b');
        }

        requestAnimationFrame(() => {
            this.render();
        })
    }

    drawEffect(x, y) {
        let r = 2;
        let pos = this.getPosition(x, y);

        let effect = () => {
            r++; // 擴大
            this.ctx.strokeStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(pos.x + this.blockWidth / 2, pos.y + this.blockWidth / 2, 20 * Math.log(r / 2), 0, Math.PI * 2);
            this.ctx.stroke();
            if (r < 100) {
                requestAnimationFrame(effect);
            }
        }

        requestAnimationFrame(effect);
    }


    writeScore() {
        score.innerText = this.score;
    }

    getPosition(x, y) {

        //取得整張地圖上的確切座標
        return new Vector(this.blockWidth * x + this.blockGutter * (x - 1), this.blockWidth * y + this.blockGutter * (y - 1))
    }

    drawBlock(v, color) {

        this.ctx.fillStyle = color;

        let pos = this.getPosition(v.x, v.y);

        this.ctx.fillRect(pos.x, pos.y, this.blockWidth, this.blockWidth);
    }

    //更新遊戲內容
    update() {

        if (this.start) {
            this.snake.update(); // refresh snake's movement;

            this.foods.forEach((el, index) => {

                //if snake ate the food
                if (this.snake.head.equal(el)) {

                    this.snake.maxLength++;// snake grow up
                    this.foods.splice(index, 1); // remove the food had been eatten
                    this.generateFoods(); // readd food

                    this.score += 10;

                    if (index === 0) {
                        this.score += this.bonus * 5;
                        this.bonus++;
                    }

                }

            })

            if (this.snake.checkBoundary(this.gameWidth) === false) {
                this.endGame();
            }

            if (this.snake.hitSelf()) {
                this.endGame();
            }

            this.writeScore();

            this.speed = Math.sqrt(this.snake.body.length) + 5 + (this.bonus * 1.25);// set the snake's speed

            setTimeout(() => {
                this.update();
            }, parseInt(1000 / this.speed)); // refresh the frame in specific interval

        }
    }

    generateFoods() {
        let x = Math.floor(Math.random() * this.gameWidth);
        let y = Math.floor(Math.random() * this.gameWidth);

        this.foods.push(new Vector(x, y));

        this.drawEffect(x, y);
        this.playSound('C5', -20);
        this.playSound('F6', -20, 200);
    }

    manyFoods(num) {
        for (let i = 0; i < num; i++) {
            this.generateFoods();
        }
    }

    playSound(note = 'C4', volume = 1, when) {

        setTimeout(() => {
            const synth = new Tone.Synth().toDestination();

            synth.volume.value = volume;
            synth.triggerAttackRelease(note, '8n');

        }, when || 0)
    }


}


let game = new Game();
game.init();

body.addEventListener('keydown', function (e) {

    console.log(endPanel.classList.contains('d-none'));

    if (e.key === 'Enter' && endPanel.classList.contains('d-none')) {

        document.querySelector('.control').classList.toggle('hide');
        game.startGame();

    }
})

window.addEventListener('keydown', function (e) {
    game.snake.setDirection(e.key.replace('Arrow', ''));
})