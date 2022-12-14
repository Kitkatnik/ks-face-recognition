import React from 'react';

import './App.css';
import ParticlesBg from 'particles-bg'
// import Clarifai from 'clarifai';

import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const USER_ID = 'adhdcoder';
// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = 'bf604ccf0cc54ae8a91711967c79b462';
const APP_ID = 'facerecognitionbrain';
// Change these to whatever model and image URL you want to use
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false
    }
  }
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }
  calculateFaceLocation = (data) => {
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: data.left_col * width,
      topRow: data.top_row * height,
      rightCol: width - (data.right_col * width),
      bottomRow: height - (data.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box});
  }
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: JSON.stringify({
        "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
        },
        "inputs": [
          {
            "data": {
              "image": {
                "url": this.state.input 
              }
            }
          }
        ]
      })
    })
      .then(response => response.json()) 
      .then(result => this.displayFaceBox(this.calculateFaceLocation(result.outputs[0].data.regions[0].region_info.bounding_box)))

      .catch(error => console.log('error', error));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState({isSignedIn: false});
    } else if(route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route});
  }
  render(){
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <ParticlesBg 
          className='particles' 
          type='cobweb' 
          color='#ffffff' 
          num={100} 
          bg={true} 
        />
        <Navigation 
          onRouteChange={this.onRouteChange} 
          isSignedIn={isSignedIn}
        />
        { route === 'home' 
          ? 
            <div>
              <Logo />
              <Rank />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit} 
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : route === 'signin' 
            ? <Signin onRouteChange={this.onRouteChange} />
            : <Register onRouteChange={this.onRouteChange} />
        }
      </div>
    )
  }
}

export default App;
