import React from 'react';
import Board from '../board/Board';
import './style.css';

class Container extends React.Component
{
    constructor(props){
        super(props);

        //bind video feed
        this.streamCamVideo= this.streamCamVideo.bind(this);

        //Set initia state for brush size and color
        this.state = {
            color: "#000000",
            size: "5"
        }

    }

    //Function for streaming video
    streamCamVideo() {
        //Set constraints
        var constraints = { audio: true, video: { width: 80, height: 80 } };
        navigator.mediaDevices
          .getUserMedia(constraints)
          //get actual video
          .then(function(mediaStream) {
            var video = document.querySelector("video");
    
            video.srcObject = mediaStream;
            video.onloadedmetadata = function(e) {
              video.play();
            };
          })
          //check for errors at the end
          .catch(function(err) {
            console.log(err.name + ": " + err.message);
          }); 
      }

    //set current color to selected color
    changeColor(params){
        this.setState({
            color: params.target.value
        })
    }

    //set current brush size to selected size
    changeSize(params){
        this.setState({
            size: params.target.value
        })
    }

    


    render(){
        return(
            <div className="container">
                <div class="tools-section"> 
                    <div className="color-picker-container">
                        Select Brush Color: &nbsp;
                        <input type="color" value ={this.state.color} onChange={this.changeColor.bind(this)}/>
                    </div>
                    <div className="brushsize-container">
                        Select Brush Size: &nbsp;
                        <select value={this.state.size} onChange={this.changeSize.bind(this)}> 
                            <option> 5</option>
                            <option> 10</option>
                            <option> 15</option>
                            <option> 20</option>
                            <option> 25</option>
                            <option> 30</option>
                        </select>
                    </div>
                </div>

               <div class="puck">
                    <div id="videocontainer">
                            
                        <video autoPlay={true} id="videoElement" controls></video>
                    </div>
               </div>
               
                <div class="startstream">
                    <button onClick={this.streamCamVideo}>Start streaming</button>
                </div>
               

                <div class="board-container"> 
                <Board color={this.state.color} size={this.state.size}></Board>
                </div>
            </div>
        )
    }
}

export default Container
