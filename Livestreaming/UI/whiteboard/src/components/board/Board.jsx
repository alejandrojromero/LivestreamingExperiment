import React from 'react';
import io from 'socket.io-client';
import './style.css';


class Board extends React.Component 
{
    timeout;
    socket = io.connect();
    ctx;
    isDrawing = false;

    constructor(props){
        super(props);

        this.socket.on("canvas-data", function(data){
            var root = this;
            var interval = setInterval(function(){
                if(root.isDrawing) return;
                root.isDrawing = true;
                clearInterval(interval);
                var image = new Image();
                var canvas = document.querySelector('#board');
                var ctx = canvas.getContext('2d');
                image.onload = function(){
                    ctx.drawImage(image, 0 , 0);

                    root.isDrawing = false;
                };
                image.src = data;
            }, 200)
    })
    }

    componentDidMount(){
        this.drawOnCanvas();
        this.movePuck();
    }

    //Get drawing context data to send to other clients, not sure if this works
    componentWillReceiveProps(newProps){
        this.ctx.strokeStyle = newProps.color;
        this.ctx.lineWidth = newProps.size;
    }

    //moving video puck around with WASD
    movePuck(){
            let circle = document.querySelector('.puck');
            let moveBy = 20;

            window.addEventListener('load', ()=> {
                circle.style.position = 'absolute';
                circle.style.left = 0;
                circle.style.top = 0;
            });

            //event listener for WASD key interactions
            window.addEventListener('keydown', (e)=> {
                switch(e.keyCode){
                    case 65: //a
                        circle.style.left = parseInt(circle.style.left) - moveBy + 'px';
                        break;
                    case 68: //d
                        circle.style.left = parseInt(circle.style.left) + moveBy + 'px';
                        break;
                    case 87: //w
                        circle.style.top = parseInt(circle.style.top) - moveBy + 'px';
                        break;
                    case 83: //s
                        circle.style.top = parseInt(circle.style.top) + moveBy + 'px';
                        break;
                }
            });
    }

    //function for drawing with pen
    drawOnCanvas(){
        var canvas = document.querySelector('#board');
        this.ctx = canvas.getContext('2d');
        var ctx = this.ctx;

        var sketch = document.querySelector('#sketch');
        var sketch_style = getComputedStyle(sketch);
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));

        var mouse = {x: 0, y: 0};
        var last_mouse = {x: 0, y: 0};

        //Capture mouse location
        canvas.addEventListener('mousemove', function(e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);


        //Actually drawing on canvas
        ctx.lineWidth = this.props.size;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.props.color;

        canvas.addEventListener('mousedown', function(e) {
            canvas.addEventListener('mousemove', onPaint, false);
        }, false);

        canvas.addEventListener('mouseup', function() {
            canvas.removeEventListener('mousemove', onPaint, false);
        }, false);

        var root = this;
        var onPaint = function() {
            ctx.beginPath();
            ctx.moveTo(last_mouse.x, last_mouse.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.closePath();
            ctx.stroke();

            //Timeout for sending strokes to other users, not really working oops
            if(root.timeout != undefined) clearTimeout(root.timeout);
            root.timeout = setTimeout(function(){
                //Save drawing data to base 64 and emit 
                var base64ImageData = canvas.toDataURL("image/png");
                root.socket.emit("canvas-data", base64ImageData);
            }, 1000)
        };
    }

    render(){
        return (
            <div class="sketch" id="sketch">
                <canvas className="board" id="board"></canvas>
            </div>
        )
    }

}

export default Board