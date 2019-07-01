var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);
var base64 = require("sdk/base64");
var xhr = require("sdk/net/xhr");

var autoVetores = new Array();

exports.autoVetor = autoVetor;
exports.autoVectorDistance = autoVectorDistance;
exports.autoVectorEuclideanDistance = autoVectorEuclideanDistance;
exports.getAutoVetores = getAutoVetores;
exports.cleanAutoVetores = cleanAutoVetores;
exports.makeDescriptor = makeDescriptor;

function getAutoVetores() {
    return autoVetores;
}

function cleanAutoVetores() {
    autoVetores = new Array();
}

function autoVetor(image) {

	var canvas = window.content.document.getElementById("canvas");
	var context = canvas.getContext("2d");

    var imageN = image.width > image.height ? image.width : image.height;

    context.canvas.width = imageN;
    context.canvas.height = imageN;

	context.drawImage(image,0,0);

    var canvasImage = context.canvas.toDataURL("image/jpeg");

    var DOM_img = window.content.document.createElement("img");
    DOM_img.id = "imagemQ";
    DOM_img.src = canvasImage;

    context.drawImage(DOM_img,0,0);

    /* Esta parte substitui as imagens originais pelas imagens alteradas.
    */
    //image.src = canvasImage;
    //image.width = imageN;
    //image.height = imageN;
    
    var imageData = context.getImageData(0,0,imageN,imageN); 

    /* Esta parte limpa a parte que foi adicionada a imagem para deixá-la quadrada */
    if(imageN - image.width != 0) {
      for(var i=image.width; i<imageN; i++) {
          for(var j=0; j<context.canvas.height; j++) {
              var index = (j*imageN + i)*4;

              imageData.data[index] = 0;
              imageData.data[index+1] = 0;
              imageData.data[index+2] = 0;
          }
      }
    } else if(imageN - image.height != 0){
      for(var i=0; i<context.canvas.width; i++) {
            for(var j=image.height; j<imageN; j++) {
                var index = (j*imageN + i)*4;
                imageData.data[index] = 0;
                imageData.data[index+1] = 0;
                imageData.data[index+2] = 0;
            }
        }
    }
    /* Fim */

    //context.putImageData(imageData,0,0);

    /* Multiplicação da imagem por o vetor */
    var redVector = new Array(imageN);
    var greenVector = new Array(imageN);
    var blueVector = new Array(imageN);
    var grayVector = new Array(imageN);
    
    for(var i=0; i<imageN; i++) {
        redVector[i] = 1;
        greenVector[i] = 1;
        blueVector[i] = 1;
	    grayVector[i] = 1;
    }
    
    for(var i=0; i<15; i++) {      
        for(var i=0; i<imageN; i++) {
            /*redVector[i] = 0;
            greenVector[i] = 0;
            blueVector[i] = 0;
            grayVector[i] = 0;*/
            for(var j=0; j<imageN; j++) {
                    var index = (j*imageN + i)*4;
                    //redVector[i] += imageData.data[index];
                    //greenVector[i] += imageData.data[index+1];
                    //blueVector[i] += imageData.data[index+2];
                    


                    var gray = Math.trunc(1*((0.299 * imageData.data[index]) + (0.587*imageData.data[index+1]) + (0.114*imageData.data[index+2])));
                    
                    //grayVector[i] += gray*grayVector[i];
                    grayVector[i] += grayVector[i] * (gray/255.0);
                    //console.log(gray);
                    //console.log(grayVector[i]);
            }
        }

    /* Fim */

    /* Normalização */

        redVector = norma(redVector);
        greenVector = norma(greenVector);
        blueVector = norma(blueVector);
        grayVector = norma(grayVector);
    }

    //console.log("----");
    //for(var i=0; i<imageN; i++)
    //    console.log("[" + i + "]:" + grayVector[i]);
    //console.log("----");

    /* Fim */
    autoVetores.push(new makeDescriptor(redVector,greenVector, blueVector, grayVector));

    //console.log(autoVetores[autoVetores.length - 1]);
    var text = "";
    for(var i=0; i<grayVector.length; i++)
        text += "[" + grayVector[i] + "] "
    
    //console.log(text);

	return autoVetores[autoVetores.length - 1];
}

function autoVectorDistance(descriptor1, descriptor2) {
    var ret = 0.0;

    //ret += Math.acos(produtoInterno(descriptor1.red,descriptor2.red));
    //ret += Math.acos(produtoInterno(descriptor1.green,descriptor2.green));
    //ret += Math.acos(produtoInterno(descriptor1.blue,descriptor2.blue));

    ret = Math.acos(produtoInterno(descriptor1.gray,descriptor2.gray));

    //console.log(ret);

    /*var vector1 = descriptor1.gray;
    var vector2 = descriptor2.gray;

    //console.log("2: " + vector1);
    //console.log("1: " + vector2);

    var size = vector1.length < vector2.length ? vector1.length : vector2.length;
    ret = 0;
    for(var i=0; i<size; i++) {
        ret += Math.pow(vector1[i] - vector2[i], 2);
        //console.log(Math.pow(vector1[i] - vector2[i], 2));
    }

    ret = Math.sqrt(ret);
    //console.log(ret);*/


    //console.log("arccos: " + ret);

    return ret;
}

function autoVectorEuclideanDistance(descriptor1, descriptor2) {
    var vector1 = descriptor1.gray;
    var vector2 = descriptor2.gray;

    var ret = 0.0;

    var size = vector1.length < vector2.length ? vector1.length : vector2.length;
    var ret = 0;
    for(var i=0; i<size; i++) {
        ret += Math.pow(vector1[i] - vector2[i], 2);
    }

    ret = Math.sqrt(ret);

    //console.log(ret);

    return ret;
}

function produtoInterno(vector1, vector2) {
    var size = vector1.length < vector2.length ? vector1.length : vector2.length;
    var ret = 0.0;
    for(var i=0; i<size; i++)
        ret += vector1[i]*vector2[i];

    return ret;
}

function norma(vector) {
    var sum = 0;
    for(var i=0; i<vector.length; i++)
        sum += Math.pow(vector[i],2);

     console.log(sum);

    var norm = Math.sqrt(sum);

    for(var i=0; i<vector.length; i++)
        vector[i] = vector[i]/norm;

    return vector;
}

function makeDescriptor(red,green,blue,gray) {
	this.red = red;
	this.green = green;
	this.blue = blue;
	this.gray = gray;

	return this;
}