var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);
var base64 = require("sdk/base64");
var xhr = require("sdk/net/xhr");

var histogramsGenerated = 0;
var histograms = new Array();
var httpRequests = new Array();

exports.histogram = histogram;
exports.histogramWebService = histogramWebService;
exports.getHistograms = getHistograms;
exports.histogramDistance = histogramDistance;

function histogramDistance(histogram1, histogram2) {
	var dist = 0.0;

	for(var i=0; i<256; i++)
		dist += Math.abs(histogram1.gray[i] - histogram2.gray[i]);
	
	return dist/2.0;
}

function histogramWebService(image) {
	var imageUrl = decodeURIComponent(getUrlVars(image.parentElement.href)["imgurl"]);
	http = new xhr.XMLHttpRequest();
	httpRequests.push(http);

	var url = "http://les.ufersa.edu.br/imgun/index.php?imgurl=" + imageUrl;
	//console.log("GET: " + url);

	http.addEventListener("readystatechange", processRequest, false);

	http.onReadyStateChange = processRequest; 

	function processRequest (e) {
		if(http.readyState == 4 && http.status == 200) {
			window.alert("1");
			var response = JSON.parse(http.responseText);
			console.log(histograms.length);
			histograms.push(makeHistogram(response.red, response.green, response.blue, response.gray));
		}
	}

	http.open("GET", url , false);

	http.send();

}

function getHistograms() {
	return histograms;
}

function getUrlVars(url) {
	var vars = {};
	var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

function histogram(image) {

	var red = new Array(256);
	var green = new Array(256);
	var blue = new Array(256);
	var gray = new Array(256);

	for(var i=0; i<256; i++) {
		red[i] = 0.0;
		green[i] = 0.0;
		blue[i] = 0.0;
		gray[i] = 0.0;
	}

	var canvas = window.content.document.getElementById("canvas");
	var context = canvas.getContext("2d");

	context.drawImage(image,0,0);

	var imageData = context.getImageData(0,0, image.width, image.height);

	//var imageData = context.createImageData(image);
	//var imageData = new ImageData(base64.decode(image), image.width, image.height);

	var grayPosition = 0;

	for(var x=0; x<image.width; x++) {
		for(var y=0; y<image.height; y++) {
			var index = (y*imageData.width + x)*4;
			
			red[imageData.data[index]]++;
			green[imageData.data[index+1]]++;
			blue[imageData.data[index+2]]++;
			
			grayPosition = Math.trunc(1*((0.299 * imageData.data[index]) + (0.587*imageData.data[index+1]) + (0.114*imageData.data[index+2])));
			
			gray[grayPosition]++;

			//console.log("(x,y) = (" + x + "," + y + ");");
			//console.log(gray[0.299 * imageData.data[index] + 0.587*imageData.data[index+1] + 0.144*imageData.data[index+2]]);
			//console.log("Red: " + imageData.data[index]);
			//console.log("Green: " + imageData.data[index+1]);
			//console.log("Blue: " + imageData.data[index+2]);
			//console.log("Alpha: " + imageData.data[index+3]);
		}
	}

	var numberOfPixels = image.width*image.height;

	for(var i=0; i<256; i++) {
		red[i] = red[i]/numberOfPixels;
		green[i] = green[i]/numberOfPixels;
		blue[i] = blue[i]/numberOfPixels;
		gray[i] = gray[i]/numberOfPixels;
	}

	
	histograms.push(new makeHistogram(red,green,blue,gray));
	return histograms[histograms.length - 1];
}

function makeHistogram(red,green,blue,gray) {
	this.red = red;
	this.green = green;
	this.blue = blue;
	this.gray = gray;

	return this;
}
