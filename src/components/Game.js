import {useRef,useState,useEffect} from 'react';
import { db } from '../firebaseConfig.js';
import { increment ,updateDoc, doc, getDoc ,setDoc ,onSnapshot } from "firebase/firestore";
import Loading from './Loading.js';

const ObstructLayer=({creator,turn,win})=>{
    const isOddTurn = turn % 2 !== 0;
    if(!win){
    if ((creator && isOddTurn) || (!creator && !isOddTurn)) {
       return (<div class="layer"></div>);
    }else{
    return null; 
  }
    }else{
      return null;
    }

}

const Game = ({ creator, roomId, back }) => {
      //Control Variables 
      const [gameStart,setGameStart]=useState(false);
      
      const [reset,setReset]=useState(0);
      const [pos,setPos]=useState(null);
      const spanT00=useRef(null);
      const spanT01=useRef(null);
      const spanT02=useRef(null);
      const spanT10=useRef(null);
      const spanT11=useRef(null);
      const spanT12=useRef(null);
      const spanT20=useRef(null);
      const spanT21=useRef(null);
      const spanT22=useRef(null);
      const refMap={
        'span00':spanT00,
        'span01':spanT01,
        'span02':spanT02,
        'span10':spanT10,
        'span11':spanT11,
        'span12':spanT12,
        'span20':spanT20,
        'span21':spanT21,
        'span22':spanT22,
      }
      const [winFlag,setWinFlag]=useState(false);
      let [ crossArray,setCrossArray] = useState([]);
      let [ circleArray,setCircleArray] = useState([]);
      let countX = 0;
      let countO = 0;
      let timeout= false;
      const [turn,setTurn]=useState(0);
      //Firebase 
      const getRoomData = async (documentId) => {
      try {
        // Get the document by ID
        const roomRef = doc(db, "rooms", documentId);
        const roomSnapshot = await getDoc(roomRef);
        // Check if the document exists
        if (roomSnapshot.exists()) {
          // Extract the data
          const roomData = roomSnapshot.data();
          //alert(roomData.turn);
          return roomData;
        } else {
          console.log("No matching room data found.");
          return null;
        }
      } catch (error) {
        alert("Error retrieving room data:", error);
        return null;
      }
}
     
      const updateRoomField = async(documentId, field, value )=> {
          try {
            const roomRef = doc(db, "rooms", documentId);
        
            // Update the specific field with the provided value
            await updateDoc(roomRef, {
              [field]: value,
            });
            console.log("Room field updated successfully!");
          } catch (error) {
            console.log("Error updating room field:", error);
          }
        }
        

      const listenToDataChanges = ( documentId) => {
        const docRef = doc(db,"rooms", documentId);
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            // Do something with the listenToDataChanges
            if(data.user1==1 && data.user2==1)
            {
              setGameStart(true);
            }else{
              setGameStart(false);
            }
            setPos(data.pos);
            setReset(data.reset);
            return data;
          } else {
            // Document doesn't exist
            console.log('Document does not exist');
          }
        });
      
        // Return the unsubscribe function
        return unsubscribe;
      };
      
      listenToDataChanges(roomId);
      //updating user[1,2]
    
      //user online status
      useEffect(()=>{
        if(creator){
          updateRoomField(roomId,'user1',1);
        }
        else if (creator===false){
          updateRoomField(roomId,'user2',1);
        }
      },[]);
      useEffect(()=>{
        resetGame();
      },[reset]);
      
      function resetFn(){
        updateRoomField(roomId,'reset',Math.random());
      }
      
      
      const [popupStyle,setPopupStyle]=useState({
        display:'none'
      });
      const [resetStyle,setResetStyle]=useState({
        display:'none'
      });
      
      //go back handling
      const goBack=()=>{
        //CleanUps
        setGameStart(false);
        resetGame();
        back();
        if(creator){
          updateRoomField(roomId,'user1',0);
        }
        else if (creator===false){
          updateRoomField(roomId,'user2',0);
        }
       
      }
     
      
      //Game logic
      const win = [
        ["00", "01", "02"],
        ["10", "11", "12"],
        ["20", "21", "22"],
        ["00", "10", "20"],
        ["01", "11", "21"],
        ["02", "12", "22"],
        ["00", "11", "22"],
        ["02", "11", "20"],
      ];
      //creating X and O
       function clicker(refS){
        const ref=refMap[refS];
        if (ref && ref.current) {
          if(ref.current.innerHTML==""){
            ref.current.click();
            //incrementTurn(roomId);
          }
        }
      }
      useEffect(()=>{
        clicker("span"+pos);
      },[pos]);
     
      const createText=(e)=>{
          let pTag = document.createElement("p");
          e.target.append(pTag);
          e.target.style.background = "white";
          if (turn % 2 == 0 ) {
           pTag.innerText = "×";
          setCrossArray(prevArray=>[...prevArray,e.target.id]);
           //checkWin(crossArray);
           updateRoomField(roomId,'pos',e.target.id);
           
          } else {
            pTag.innerText = "⊙";
            pTag.style.fontSize = "4rem";
            setCircleArray(prevArray=>[...prevArray,e.target.id]);
            //checkWin(circleArray);
            updateRoomField(roomId,'pos',e.target.id);
            
          }
          
          e.target.style.pointerEvents = "none";
          setTurn(prev=>prev+1);
          
          
      };
      //checking For winner 🏆
      useEffect(()=>{
        checkWin(circleArray);
      },[circleArray]);
      
      useEffect(()=>{
        checkWin(crossArray);
      },[crossArray]);
      
      
      function onWin(turn){
        setPopupStyle({
          display:'flex'
        });
        setResetStyle({
          display:'flex'
        });
        throwConfetti();
        document.getElementById("popup").click();
        document.getElementById('popup').style.opacity="0";
        if(turn%2==0){
        document.querySelector("#popup p").innerText = "×";
        }else{
          document.querySelector("#popup p").innerText = "⊙";
        }
        setTimeout(() => {
          setPopupStyle({
            display:'none'
          });
          
        }, 4500);
        
      }
      
      window.addEventListener("click", () => {
        if (turn == 9 && !winFlag) {
          setResetStyle({
            display:'flex'
          });
        }
      });
       //logic
       const checkWin = (array) => {
        if (!winFlag) {
          for (let i = 0; i < win.length; i++) {
            countX = 0;
            countO = 0;
            for (let j = 0; j < win[0].length; j++) {
              for (let k = 0; k < array.length; k++) {
                if (turn % 2 == 0) {
                  if (win[i][j] == array[k]) {
                    countX++;
                    //console.log(countX);
                  }
                  if (countX == 3) {
                    //alert("Player X Won");
                    setWinFlag(true);
                    //updateRoomField(roomId,"win",true);
                    onWin(turn-1);
                    break;
                  }
                } else {
                  if (win[i][j] == array[k]) {
                    countO++;
                  }
                  if (countO == 3) {
                    // alert("Player O Won");
                    setWinFlag(true);
                   // updateRoomField(roomId,"win",true);
                    onWin(turn-1);
                    break;
                  }
                }
              }
            }
          }
        }
      };
      
      
       function resetGame() {
          updateRoomField(roomId,'pos',null);
          setWinFlag(false);
          setCrossArray([]);
          setCircleArray([]);
          setTurn(0);
          countX = 0;
          countO = 0;
          setPopupStyle({
            display:'none'
          });
          setResetStyle({
            display:'none'
          });
          document.querySelectorAll(".box").forEach((item) => {
            item.innerHTML = "";
            item.style.backgroundColor = "black";
            item.style.pointerEvents = "auto";
            
          });
          document.documentElement.style.pointerEvents="auto";
          if(document.getElementById('game')){
          document.getElementById('game').style.pointerEvents = "auto";
          }
         
        }
       //For Full Screen
       function toggleFullScreen() {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          
        }else{
          document.exitFullscreen();
        }
      }
       function throwConfetti () {
        // Globals
        var random = Math.random,
          cos = Math.cos,
          sin = Math.sin,
          PI = Math.PI,
          PI2 = PI * 2,
          timer = undefined,
          frame = undefined,
          confetti = [];

        var particles = 10,
          spread = 0,
          sizeMin = 6,
          sizeMax = 12 - sizeMin,
          eccentricity = 10,
          deviation = 200,
          dxThetaMin = -0.1,
          dxThetaMax = -dxThetaMin - dxThetaMin,
          dyMin = 0.13,
          dyMax = 0.18,
          dThetaMin = 0.4,
          dThetaMax = 0.7 - dThetaMin;

        var colorThemes = [
          function () {
            return color(
              (200 * random()) | 0,
              (200 * random()) | 0,
              (200 * random()) | 0
            );
          },
          function () {
            var black = (200 * random()) | 0;
            return color(200, black, black);
          },
          function () {
            var black = (200 * random()) | 0;
            return color(black, 200, black);
          },
          function () {
            var black = (200 * random()) | 0;
            return color(black, black, 200);
          },
          function () {
            return color(200, 100, (200 * random()) | 0);
          },
          function () {
            return color((200 * random()) | 0, 200, 200);
          },
          function () {
            var black = (256 * random()) | 0;
            return color(black, black, black);
          },
          function () {
            return colorThemes[random() < 0.5 ? 1 : 2]();
          },
          function () {
            return colorThemes[random() < 0.5 ? 3 : 5]();
          },
          function () {
            return colorThemes[random() < 0.5 ? 2 : 4]();
          },
        ];
        function color(r, g, b) {
          return "rgb(" + r + "," + g + "," + b + ")";
        }

        // Cosine interpolation
        function interpolation(a, b, t) {
          return ((1 - cos(PI * t)) / 2) * (b - a) + a;
        }

        // Create a 1D Maximal Poisson Disc over [0, 1]
        var radius = 1 / eccentricity,
          radius2 = radius + radius;
        function createPoisson() {
          // domain is the set of points which are still available to pick from
          // D = union{ [d_i, d_i+1] | i is even }
          var domain = [radius, 1 - radius],
            measure = 1 - radius2,
            spline = [0, 1];
          while (measure) {
            var dart = measure * random(),
              i,
              l,
              interval,
              a,
              b,
              c,
              d;

            // Find where dart lies
            for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
              a = domain[i];
              b = domain[i + 1];
              interval = b - a;
              if (dart < measure + interval) {
                spline.push((dart += a - measure));
                break;
              }
              measure += interval;
            }
            c = dart - radius;
            d = dart + radius;

            // Update the domain
            for (i = domain.length - 1; i > 0; i -= 2) {
              l = i - 1; a = domain[l];
              b = domain[i];
              // c---d          c---d  Do nothing
              //   c-----d  c-----d    Move interior
              //   c--------------d    Delete interval
              //         c--d          Split interval
              //       a------b
              if (a >= c && a < d)
                if (b > d) domain[l] = d; // Move interior (Left case)
                else domain.splice(l, 2);
              // Delete interval
              else if (a < c && b > c)
                if (b <= d) domain[i] = c; // Move interior (Right case)
                else domain.splice(i, 0, c, d); // Split interval
            }

            // Re-measure the domain
            for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
              measure += domain[i + 1] - domain[i];
          }

          return spline.sort();
        }

        // Create the overarching container
        var container = document.createElement("div");
        container.style.transition="all 5.5s";
        container.style.position = "fixed";
        container.style.animation="fade ease 4s forwards "
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "0";
        container.style.overflow = "visible";
        container.style.zIndex = "9999";

        // Confetto constructor
        function Confetto(theme) {
          this.frame = 0;
          this.outer = document.createElement("div");
          this.inner = document.createElement("div");
          this.outer.appendChild(this.inner);

          var outerStyle = this.outer.style,
            innerStyle = this.inner.style;
          outerStyle.position = "absolute";
          outerStyle.width = sizeMin + sizeMax * random() + "px";
          outerStyle.height = sizeMin + sizeMax * random() + "px";
          innerStyle.width = "100%";
          innerStyle.height = "100%";
          innerStyle.backgroundColor = theme();

          outerStyle.perspective = "50px";
          outerStyle.transform = "rotate(" + 360 * random() + "deg)";
          this.axis =
            "rotate3D(" +
            cos(360 * random()) +
            "," +
            cos(360 * random()) +
            ",0,";
          this.theta = 360 * random();
          this.dTheta = dThetaMin + dThetaMax * random();
          innerStyle.transform = this.axis + this.theta + "deg)";

          this.x = window.innerWidth * random();
          this.y = -deviation;
          this.dx = sin(dxThetaMin + dxThetaMax * random());
          this.dy = dyMin + dyMax * random();
          outerStyle.left = this.x + "px";
          outerStyle.top = this.y + "px";

          // Create the periodic spline
          this.splineX = createPoisson();
          this.splineY = [];
          for (var i = 1, l = this.splineX.length - 1; i < l; ++i)
            this.splineY[i] = deviation * random();
          this.splineY[0] = this.splineY[l] = deviation * random();

          this.update = function (height, delta) {
            this.frame += delta;
            this.x += this.dx * delta;
            this.y += this.dy * delta;
            this.theta += this.dTheta * delta;

            // Compute spline and convert to polar
            var phi = (this.frame % 7777) / 7777,
              i = 0,
              j = 1;
            while (phi >= this.splineX[j]) i = j++;
            var rho = interpolation(
              this.splineY[i],
              this.splineY[j],
              (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
            );
            phi *= PI2;

            outerStyle.left = this.x + rho * cos(phi) + "px";
            outerStyle.top = this.y + rho * sin(phi) + "px";
            innerStyle.transform = this.axis + this.theta + "deg)";
            return this.y > height + deviation;
          };
        }

        function poof() {
          if (!frame && !timeout) {
            // Append the container
            document.body.appendChild(container);

            // Add confetti
            var theme = colorThemes[0],
              count = 0;
            (function addConfetto() {
              var confetto = new Confetto(theme);
              confetti.push(confetto);
              container.appendChild(confetto.outer);
              timer = setTimeout(addConfetto, spread * random());
            })(0);

            // Start the loop
            var prev = undefined;
            requestAnimationFrame(function loop(timestamp) {
              var delta = prev ? timestamp - prev : 0;
              prev = timestamp;
              var height = window.innerHeight;

              for (var i = confetti.length - 1; i >= 0; --i) {
                if (confetti[i].update(height, delta)) {
                  container.removeChild(confetti[i].outer);
                  confetti.splice(i, 1);
                }
              }

              if (timer || confetti.length)
              setTimeout(()=>{
            cancelAnimationFrame(frame);
            container.remove();
          },4000);
                return (frame = requestAnimationFrame(loop)
                );

              // Cleanup
              document.body.removeChild(container);
              frame = undefined;
            });
          };
          
        }

        poof();
       
      };
  
  
  return (
    <>
    {
      <ObstructLayer  turn={turn} creator={creator} win={winFlag}/>
    }
    
    {
      gameStart ? 
    (<div id="wrapper" class="wrapper">
      <div id="game" class="game">
        <span ref={spanT00} id="00" onClick={(e)=>{createText(e)}}  class="box"></span>
        <span ref={spanT01} id="01" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT02} id="02" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT10} id="10" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT11} id="11" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT12} id="12" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT20} id="20" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT21} id="21" onClick={(e)=>{createText(e)}} class="box"></span>
        <span ref={spanT22} id="22" onClick={(e)=>{createText(e)}} class="box"></span>
      </div>
        <button onClick={()=>{
          resetFn();
        }} style={resetStyle} id="reset">
          <p>Play</p>
        </button>
        <div style={popupStyle} id="popup">
          <p></p>
        </div>
      
      <div onClick={()=>{toggleFullScreen()}} id="fullScr" class="fullScr">
        ∅
      </div>
      <div onClick={()=>{goBack()}} class="backBtn">
        ∷
      </div>
    </div>)
    : (<Loading/>)
    }
    </>
  );
};
export default Game;
