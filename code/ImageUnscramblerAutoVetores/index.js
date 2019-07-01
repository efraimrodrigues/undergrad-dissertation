var self = require("sdk/self");
var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);
var tab = require('sdk/tabs').activeTab;
var av = require("autoVetor");
var hist = require("histogram");
var dCluster = require("dynamicCluster");

var data = require("sdk/self").data;

// Get profile directory.
let { Cc, Ci } = require('chrome');

var autoVetores;
var histograms;
var clusters;
var images;

//Função executada toda vez que uma página é carregada
//tab.on('ready',function(tab) {
	console.log("Disparou!");
	tab.on('load',function(tab) {
		
		
		var canvas = window.content.document.createElement("canvas");
		canvas.id = "canvas";
		window.content.document.body.appendChild(canvas);

		var context = canvas.getContext("2d");

		var document = window.content.document;
		images = document.getElementsByClassName("rg_ic rg_i");

		//32 pois a página do Google retorna por default 32 imagens 
		//var imagesLength = images.length > 32 ? 32 : images.length;
		var imagesLength = images.length;
		
		av.cleanAutoVetores();

		autoVetores = new Array(imagesLength);
		histograms = new Array(imagesLength);
			
		if(imagesLength > 0) {

			insertModal();
			console.log("Modal finished.");

			//var nClusters = 5;

			//window.alert("lets play a game");

			for(var i=0; i<imagesLength; i++) {
				
				if(images[i].src) {
					console.log("Imagem[" + i + "]");
					av.autoVetor(images[i]);
					hist.histogram(images[i]);
				} else {
					console.log("Parou");
					break;
				}

				if(i == 32)
					break;
			}
				
			//window.alert(hist.getHistograms().length + " histograms were generated.");

			autoVetores = av.getAutoVetores();
			histograms = hist.getHistograms();

			console.log("---------------");

			//for(var i=0; i<256; i++) {
			//	console.log(histograms[0].gray[i]);
			//}

			console.log("Auto vetores: " + autoVetores.length);

			var melhorNClusters = 3;
			var melhorDunnIndex = 0;

			var menorDunnIndex = 99999999999;
			var maiorDunnIndex = 0;
			var maiorCluster = 3;
			var menorCluster = 3;

			var clustersSugeridos = {};

			var numMaxClusters = autoVetores.length < 8 ? autoVetores.length : 8;  


			/*for(var i=3; i<numMaxClusters; i++) {
				var index = dunnIndex(dCluster.dynamicCluster(i,1,autoVetores, histograms));
				if(index > maiorDunnIndex) {
					maiorDunnIndex = index;
					maiorCluster = i;
				}
				if(index < menorDunnIndex) {
					menorDunnIndex = index;
					menorCluster = i;
				}
				if(index > melhorDunnIndex) {
					melhorDunnIndex = index;
					melhorNClusters = i;
				}
				console.log("Index: " + index);
			}*/
			console.log("Maior Dunn Index: " + maiorDunnIndex);
			console.log("Maior número de Clusters: " + maiorCluster);
			console.log("Menor Dunn Index: " + menorDunnIndex);
			console.log("Menor número de Clusters: " + menorCluster);

			console.log("-------------------------------------");
			console.log("Matriz de distâncias: ");

			for(var i=0; i<autoVetores.length; i++) {
				
				var text = "";
				for(var j=0; j<autoVetores.length; j++) {
					//text += "(" + j + " - " + parseFloat(av.autoVectorDistance(autoVetores[i], autoVetores[j])).toFixed( 5 )  + ")";
					//text += "(" + j + " - " + av.autoVectorDistance(autoVetores[i], autoVetores[j])  + ")";
					text += "(" + j + " - " + hist.histogramDistance(histograms[i], histograms[j])  + ")";
				}
				console.log("[" + i + "] : " + text);
			}

			//console.log("Melhor num: " + melhorNClusters);
			//nClusters = melhorNClusters;

			//clusters = dCluster.dynamicCluster(melhorNClusters,autoVetores);

			var nClusters = 0;
			do {
				nClusters = window.prompt("Digite 0 para cancelar. Entre com o número de clusters desejado" //, número de clusters sugerido: " +
				//maiorCluster + " e " + menorCluster
				, "Número de Clusters");
				var descriptor = -1;
				if(nClusters != 0)
					descriptor = window.prompt("Escolha o descritor a ser usado no algoritmo: (0) AutoVetor; (1) Histograma");

				if(nClusters != 0 && !isNaN(nClusters) && (descriptor == 0 || descriptor == 1)) {
					clusters = dCluster.dynamicCluster(nClusters,descriptor,autoVetores, histograms);
					displayClusters(clusters);
				}

			} while(nClusters != 0);
		}

	});
//});

function displayClusters(clusters) {
	var document = window.content.document;
	var nClusters = clusters.length;

	var parentElement = document.getElementById("center_col");

	insertTaw(nClusters);

	var taw = "taw" + nClusters;

	console.log("get element: " + taw);
	
	var insertElement = document.getElementById(taw);

	console.log(insertElement);

	var clustersParentElement = document.getElementById("ifb");
	var clustersElement = insertElement.getElementsByClassName("rg_fbl");
	

	console.log(clustersElement.length);
	if(clustersElement.length > nClusters) {
		for(var i=clustersElement.length-1; i>=nClusters; i--) {
			console.log("Removing cluster representation [" + i + "].");
			clustersElement[i].remove();
		}
		
	} else if (clustersElement.length < nClusters) {
		for(var i=clustersElement.length; i<nClusters; i++) {
			console.log("Clonou?");
			clustersParentElement.appendChild(clustersElement[0].cloneNode(true));
		}
	}

	insertElement = document.getElementById(taw);
	clustersElement = insertElement.getElementsByClassName("rg_fbl");

	if(clustersElement.length != nClusters)
		window.alert("NÚMERO DE CLUSTERS DIFERENTE DE ESPAÇOS A MOSTRAR!");

	var labels = insertElement.getElementsByClassName("_ucd");

	var insertImages = document.getElementById("ifb").getElementsByClassName("rg_i");

	console.log("Spots available: " + insertImages.length);
	console.log("Spots required: " + nClusters*4);
	console.log("labels available: " + labels.length);

	

	var imgI = 0;
	for(var i=0; i<clustersElement.length; i++) {
		console.log("" + i);
		clustersElement[i].href = "javascript: void(0)";
		clustersElement[i].onclick = function (event) {insertImagesOnModal(event, this)};
		//clustersElement[i].onclick = function(event) {console.log("Hello world. Cluster[" + event.target + "] has " +2+ " images.");};
		//Imagens do cluster a serem exibidas: Exibe a quantidade que o elemento suporta e o que o cluster tem
		var clusterLength = clustersElement[i].getElementsByClassName("rg_i").length;
		for(var j=0; j<clusterLength; j++) {

			if(j < clusters[i].length)
				clustersElement[i].getElementsByClassName("rg_i")[j].src = images[clusters[i][j]].src;
			else {
				clustersElement[i].getElementsByClassName("rg_i")[j].src = "";
				console.log("Cluster[" + i + "] removeu imagem " + j);
			}
		}
	}

	//Limpa texto dos agrupamentos
	for(var i=0; i<labels.length; i++)
		labels[i].innerHTML = "Cluster " + (i+1);			

	if(document.getElementsByClassName("gb_Sc gb_Tc gb_Lc gb_g").length > 0)
		document.getElementsByClassName("gb_Sc gb_Tc gb_Lc gb_g")[0].style.display = "none";

	if(document.getElementsByClassName("gb_Wc gb_Xc gb_Lc gb_g").length > 0)
		document.getElementsByClassName("gb_Wc gb_Xc gb_Lc gb_g")[0].style.display = "none";

}

//Quanto menor, melhor.
function dunnIndex(clusters) {

	var dmin = 10;

	for(var i=0; i<clusters.length; i++) {
		for(var j=i+1; j<clusters.length; j++) {
			for(var k=0; k<clusters[i].length; k++) {
				for(var l=0; l<clusters[j].length; l++) {
					var dist = av.autoVectorDistance(autoVetores[clusters[i][k]],autoVetores[clusters[j][l]]);
					if(dist < dmin)
						dmin = dist;
				}
			}
			
		}
	}

	var dmax = -1;

	for(var i=0; i<clusters.length; i++) {
		for(var j=0; j<clusters[i].length; j++) {
			for(var k=j+1; k<clusters[i].length; k++) {
				var dist = av.autoVectorDistance(autoVetores[clusters[i][j]], autoVetores[clusters[i][k]]);
				if(dist > dmax)
					dmax = dist;
			}
		}
	}

	if(dmax != 0)
		return dmin/dmax;
	return 0;
}

function insertImagesOnModal(event, id) {
	var clustersElement = window.content.document.getElementsByClassName("rg_fbl");
	var clusterN = 0;
	for(var i=0; i<clustersElement.length; i++) {
		
		if(id == clustersElement[i]) {
			clusterN = i;
			break;
		}
	}

	console.log(clusterN);
	
	var document = window.content.document;
	var modal = document.getElementById("myModal");

	modal.innerHTML = '';

	console.log(clusters[clusterN].length);

	var imgs = '';

	for(var i=0; i<clusters[clusterN].length; i++) {
		imgs += '<div class="mySlides" style="padding:30px">' +
			'<div class="numbertext">' + (i + 1) + '/' + clusters[clusterN].length + '</div>' +
			'<center><img src="' + images[clusters[clusterN][i]].src +  '" style="width:50%"></center>' +
		'</div>';

	}

	imgs += '<a class="prev" onclick="plusSlides(-1)">&#10094;</a>' +
    '<a class="next" onclick="plusSlides(1)">&#10095;</a>';

	for(var i=0; i<clusters[clusterN].length; i++) {
		imgs += 
		'<div class="column">' +
				'<center><img class="demo cursor" onclick="currentSlide(' + (i+1) + ')" src="' + images[clusters[clusterN][i]].src +  '" style="width:50%"></center>' +
		'</div>';
	}

	modal.innerHTML += '<div class="modal-content">' + imgs + '</div>';

	modal.style.display = "block";
	
	showSlides(1);
}

function showSlides(n) {
	console.log("vai");
  var i;
  var slideIndex = 1;
  var document = window.content.document;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  var captionText = document.getElementById("caption");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  captionText.innerHTML = dots[slideIndex-1].alt;
}

function getUrlVars(url) {
	var vars = {};
	var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

//Executa a primeira vez
exports.main = function() {

}

function insertTaw(id) {
	
	var document = window.content.document;

	var centerColHTML = document.getElementById("center_col").innerHTML;

	document.getElementById("center_col").innerHTML = '<div data-jibp="h" data-jiis="uc" id="taw' + id + '">' + read("resource://imageunscrambler/taw.html") + '</div>' + centerColHTML;

}

function read(file){
    var ioService = Cc["@mozilla.org/network/io-service;1"]
        .getService(Ci.nsIIOService);
    var scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"]
        .getService(Ci.nsIScriptableInputStream);

    var channel = ioService.newChannel2(file, null, null, null, null, null, null, null);
    var input = channel.open();
    scriptableStream.init(input);
    var str = scriptableStream.read(input.available());

    scriptableStream.close();
    input.close();
    return str;
}

function insertModal() {
	var document = window.content.document;
	document.body.innerHTML += '<div id="myModal" class="modal">' +
				'<!-- Modal content -->' + 
				'<div class="modal-content">' +
				'</div>' +
				'</div>';

	//var sheet = window.document.styleSheets[0]
	//sheet.insertRule('strong { color: red; }', sheet.cssRules.length);
	var css = document.createElement("style");

	css.type = "text/css";
	css.innerHTML = read("resource://imageunscrambler/modal.css");

	document.body.appendChild(css);

	var script = document.createElement("script");

	script.innerHTML = read("resource://imageunscrambler/modal.js");

	document.body.appendChild(script);

	// Get the modal
	var modal = document.getElementById('myModal');

	// Get the button that opens the modal
	//var btn = document.getElementById("myBtn");

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	modal.style.display = "none";
}