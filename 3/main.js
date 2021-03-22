// globals
var blocks = new Array();
var btn;
var cnv;
var ctx;

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
    }

    // util functions
    function spawnBlock(x, y) {
        blocks.push(new Square(w * 0.02));
    }

    // event listeners
    btn.addEventListener('click', (event) => {
        spawnBlock(100, 100);
        blocks.forEach((block, index) => {
            block.draw();
        });
    });

    // Drag and drop handler
    
};
