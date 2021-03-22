// globals
var blocks = new Array();
var btn;
var cnv;
var ctx;
var blockIndexToDrag;

var dragX;
var dragY;

window.onload = () => {
    btn = document.getElementById('spawn-element');
    cnv = document.getElementById('canvas');
    ctx = cnv.getContext('2d');
    w = window.innerWidth;
    h = window.innerHeight * 0.98;
    ctx.canvas.width = w;
    ctx.canvas.height = h;

    class Square {
        constructor(size) {
            this.size = size;
            this.x = 100;
            this.y = 100;
            this.color =
                'rgb(' +
                Math.floor(Math.random() * 255) +
                ',' +
                Math.floor(Math.random() * 255) +
                ',' +
                Math.floor(Math.random() * 255) +
                ')';
        }

        isInside(x, y) {
            var xIn = true;
            var yIn = true;

            if (this.x > x || this.x + this.size < x) xIn = false;
            if (this.y > y || this.y + this.size < y) yIn = false;

            return xIn && yIn;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }

        collides(square) {
            // https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
            if (
                this.x < square.x + square.size &&
                this.x + this.size > square.x &&
                this.y < square.y + square.height &&
                this.y + this.size > square.y
            ) {
                return true;
            } else {
                return false;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        blocks.forEach((block) => {
            block.draw();
        });
    }

    // util functions
    function spawnBlock(x, y) {
        blocks.push(new Square(w * 0.02));
    }

    // event listeners
    btn.addEventListener('click', (event) => {
        spawnBlock(100, 100);
        draw();
    });

    // Drag and drop handlers
    cnv.addEventListener('mousedown', down);
    function down(event) {
        var brect = cnv.getBoundingClientRect();
        x = event.clientX - brect.left;
        y = event.clientY - brect.top;

        var index = blocks.map((item, index) => item.isInside(x, y)).findIndex((item) => item);

        // some block is found
        if (index >= 0) {
            blockIndexToDrag = index;

            var sq = blocks[blockIndexToDrag];
            dragX = x - sq.x;
            dragY = y - sq.y;
        } else {
            blockIndexToDrag = -1;
        }
        console.log(blockIndexToDrag);
    }

    cnv.addEventListener('mousemove', move);
    function move(event) {
        if (blockIndexToDrag >= 0) {
            var sq = blocks[blockIndexToDrag];

            var minX = 0;
            var maxX = canvas.width - sq.size;
            var minY = 0;
            var maxY = canvas.height - sq.size;

            var brect = cnv.getBoundingClientRect();
            x = event.clientX - brect.left;
            y = event.clientY - brect.top;

            posX = x - dragX;
            posX = posX < minX ? minX : posX > maxX ? maxX : posX;
            posY = y - dragY;
            posY = posY < minY ? minY : posY > maxY ? maxY : posY;

            sq.x = posX;
            sq.y = posY;
            draw();

            // var colliders = blocks.filter((block, index) => {
            //     if (index != blockIndexToDrag) {
            //         sq.collides(block);
            //     } else {
            //         return false;
            //     }
            // });

            // console.log(colliders);
        }
    }

    cnv.addEventListener('mouseup', up);
    function up(event) {
        blockIndexToDrag = -1;
    }
};
