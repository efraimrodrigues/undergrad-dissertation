var self = require("sdk/self");
var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);
var tab = require('sdk/tabs').activeTab;
var hist = require("histogram");
var dCluster = require("dynamicCluster");

//Função executada toda vez que uma página é carregada
//tab.on('ready',function(tab) {
	console.log("Disparou!");
	tab.on('load',function(tab) {
		var canvas = window.content.document.createElement("canvas");
		canvas.id = "canvas";
		window.content.document.body.appendChild(canvas);

		var context = canvas.getContext("2d");

		var document = window.content.document;
		var images = document.getElementsByClassName("rg_ic rg_i");

		//32 pois a página do Google retorna por default 32 imagens 
		var imagesLength = images.length > 32 ? 32 : images.length;

		var histograms = new Array(imagesLength);
			
		if(imagesLength > 0) {

			var nClusters = 5;

			//window.alert("lets play a game");

			for(var i=0; i<imagesLength; i++) {
				//console.log(decodeURIComponent(getUrlVars(images[i].parentElement.href)["imgurl"]));
				console.log(i);
				//window.alert(i);
				hist.histogram(images[i]);
			}
				
			//window.alert(hist.getHistograms().length + " histograms were generated.");

			histograms = hist.getHistograms();

			console.log("---------------");

			//for(var i=0; i<256; i++) {
			//	console.log(histograms[0].gray[i]);
			//}

			console.log(histograms.length);
		
			var clusters = dCluster.dynamicCluster(nClusters,histograms);

			var parentElement = document.getElementById("center_col");
			//Clona a barra onde os clusters serão exibidos
			var insertElement = document.getElementById("taw").cloneNode(true);	

			//var events = document.getElementById("taw").getEventListeners();
			
			//for(var p in events) {
			//	events[p].forEach(function(ev) {
			//		insertElement.addEventListener(p, ev.listener, ev.useCapture);
					
			//	});				
			//}		
			
			document.getElementById("ifb").setAttribute("id","ifb2");
			document.getElementById("taw").setAttribute("id","taw2");

			parentElement.insertBefore(insertElement, parentElement.childNodes[0]); 

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

			insertElement = document.getElementById("taw");
			clustersElement = insertElement.getElementsByClassName("rg_fbl");

			if(clustersElement.length != nClusters)
				window.alert("NÚMERO DE CLUSTERS DIFERENTE DE ESPAÇOS A MOSTRAR!");

			var labels = insertElement.getElementsByClassName("_ucd");

			var insertImages = document.getElementById("ifb").getElementsByClassName("rg_i");

			console.log("Spots available: " + insertImages.length);
			console.log("Spots required: " + nClusters*4);
			console.log("rg_fbl available: " + document.getElementById("taw").getElementsByClassName("rg_fbl").length);
			console.log("labels available: " + labels.length);

			var imgI = 0;
			for(var i=0; i<clustersElement.length; i++) {
				clustersElement[i].href = "";
				//Imagens do cluster a serem exibidas: Exibe a quantidade que o elemento suporta e o que o cluster tem
				var clusterLength = clusters[i].length < clustersElement[i].getElementsByClassName("rg_i").length ? clusters[i].length : clustersElement[i].getElementsByClassName("rg_i").length;
				for(var j=0; j<clustersElement[i].getElementsByClassName("rg_i").length; j++) {

					if(j < clusters[i].length)
						clustersElement[i].getElementsByClassName("rg_i")[j].src = images[clusters[i][j]].src;
					else
						clustersElement[i].getElementsByClassName("rg_i")[j].remove();
				}
			}

			//for(var i=0; i<insertImages.length; i++)
			//	insertImages[i].src = images[i].src;

			//Limpa texto dos agrupamentos
			for(var i=0; i<labels.length; i++)
				labels[i].innerHTML = "Cluster " + (i+1);
		}

	});
//});

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
