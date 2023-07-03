import { useState,useEffect,useRef } from 'react';
import { collection, addDoc } from "firebase/firestore"; 
import { db } from '../firebaseConfig.js';
import Game from "./Game.js";
import AIMode from "./AIMode.js";


const Room = () => {
  const [createRoomStyle,setCreateRoomStyle]=useState({
    display:'none'
  });
  const [creator,setCreator]=useState(null);
  const [roomId,setRoomId]=useState(null);
  const [joinRoomStyle,setJoinRoomStyle]=useState({
    display:'none'
  });
  
  const[startAIMode,setStartAIMode]=useState(false);
  //Hacker Text Effect
 const pRef = useRef(null);
 
 function applyHackerTextEffect(ref){
   const textElement = ref.current;
   
const originalText = textElement.innerHTML;

function scrambleText() {
  let scrambledText = '';
  ref.current.style.color="lime";
  for (let i = 0; i < originalText.length; i++) {
    if (Math.random() < 0.5) {
      scrambledText += String.fromCharCode(Math.random() * 94 + 33);
    } else {
      scrambledText += originalText[i];
    }
  }

  scrambledText = scrambledText.substring(0, originalText.length);

  textElement.innerHTML = scrambledText;
}

let id=setInterval(scrambleText, 50);
setTimeout(()=>{
  clearInterval(id);
  ref.current.innerHTML=originalText;
  ref.current.style.color="white";
},1300);

 }
  useEffect(() => {
    applyHackerTextEffect(pRef);
  }, []);
 
 
  const createRoomClick=()=>{
     setCreateRoomStyle({
       display:'block',
       marginTop:'3rem',
       marginBottom:'3rem'
     });
     setJoinRoomStyle({
      display:'none'
     });
     createNewRoom();
     document.getElementById('room').innerText="";
     setCreator(true);
   }
  const joinRoomClick=()=>{
      setJoinRoomStyle({
       display:'block',
       marginTop:'3rem',
       marginBottom:'3rem'
     });
     setCreateRoomStyle({
      display:'none'
     });
     
     document.getElementById('roomId').innerText="";
     document.getElementById('room').innerText="";
     setCreator(false);
     
   }
  const[containerStyle,setContainerStyle]=useState({
    display:'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    padding: '1rem',
  });
  //Game Configz
  const [gameStart,setGameStart]=useState(false);
  const GameStart=(e)=>{
    if(document.getElementById('roomId').innerText.trim() || document.getElementById('room').innerText.trim())
    {
      setContainerStyle({display:'none'});
      if(creator==false){
        setRoomId(document.getElementById('room').innerText);
      }
      document.getElementById('roomId').innerText="";
      document.getElementById('room').innerText="";
       
      startTheGameMan(true);
    }
  }
  const backContainer=()=>{
    setGameStart(false);
    setContainerStyle({
      display:'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      padding: '1rem'
    });
    setCreateRoomStyle({
      display:'none'
     });
     setJoinRoomStyle({
      display:'none'
     });
     setCreator(null);
  }
  
  
  //FireBase 
  const createNewRoom = async () => {
  try {
    const docRef = await addDoc(collection(db, "rooms"), {
      user1:'',
      user2:'',
      pos:null,
      reset:0,
    });
    setRoomId(docRef.id);
  } catch (error) {
    setRoomId("In Maintenance");
    setGameStart(false);
  }
};
 const  startTheGameMan=()=>{
   setGameStart(true);
 };
 
 const startAIGame=()=>{
   setContainerStyle({display:'none'});
   document.getElementById('roomId').innerText="";
      document.getElementById('room').innerText="";
      setStartAIMode(true);
 }
 
 
  return (
    <>
      <div style={containerStyle} class="roomContainer">
        <div data-value="Tic Tac Boom" class="title">
          <p ref={pRef}>Tic Tac Boom</p>
        </div>
        <div class="roomBody">
          <div onClick={()=>{createRoomClick()}} class="createRoom">
            <p>Create Room</p>
          </div>
          <div onClick={()=>{
          startAIGame();
        }} class="ai">
        <p>+</p>
        </div>
          <div onClick={()=>{joinRoomClick()}}  class="joinRoom">
            <p>Join Room</p>
          </div>
          
        </div>
        <div style={createRoomStyle} class="createRoomDetails">
          <h3>Room ID *</h3>
          <p id="roomId">{roomId}</p>
          <small>Note: Send this ID to your Friend</small>
          <div onClick={(e)=>{GameStart(e)}} class="startBtn">
            <p onClick={()=>{
              startTheGameMan();
            }}>Start</p>
          </div>
        </div>
        <div style={joinRoomStyle} class="joinRoomDetails">
          <h3>Enter Room ID * </h3>
          <div contenteditable="true" id="room"></div>
          <div onClick={(e)=>{GameStart(e)}} class="joinBtn">
            <p>Join</p>
          </div>
        </div>
        
      </div>
      {gameStart && <Game creator={creator} roomId={roomId} back ={backContainer}/>}
      {
        startAIMode && (<AIMode back={backContainer} gameStart={setStartAIMode}/>)
      }
    </>
  );
};
export default Room;
