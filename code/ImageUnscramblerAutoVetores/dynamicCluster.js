var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);
var av = require("autoVetor");
var hist = require("histogram");

exports.dynamicCluster = dynamicCluster;

var clusters = {};
var autoVetores = {};
var histograms = {};
var descriptor;

//Recebe um array de autoVetores que deverão ser ordenados
function dynamicCluster(nClusters,externDescriptor,externAutoVetores, externHistograms) {
	descriptor = externDescriptor;
	autoVetores = externAutoVetores;
	histograms = externHistograms;
	//var nClusters = window.prompt("Em quantos agrupamentos você deseja organizar o conjunto de imagens desta página?");
	console.log("Dynamic clustering agrupando imagens em " + nClusters + " clusters.");
	clusters = Array(nClusters);

	for(var i=0; i<nClusters; i++) {
		clusters[i] = new Array();
		//clusters[i].push(i);	
		//clusters[i].exemplar = i;	
	}

	var change = true;

	while(change) {
		representation();

		change = false;
		
		for(var i=0; i<autoVetores.length; i++) {
			var minDistance = clusterDistance(i, clusters[0]);

			//window.alert("Distância Imagem[" + i + "] a cluster[0]: " + minDistance);
			//displayCluster();
			
			var minCluster = 0;
			var currentCluster = clusters[0].indexOf(i) != -1 ? 0 : -1;
			
			/**
			 * Tenta colocar a imagem i nos clusters j
			 */
			for(var j=1; j<clusters.length; j++) {
				/**
				 * Se o element i estiver no cluster j
				 */
				if(clusters[j].indexOf(i) != -1) {
					currentCluster = j;
					minCluster = j;
					minDistance = clusterDistance(i, clusters[j]);
					//window.alert("Imagem[" + i + "] já está em " + j);
					//displayCluster();
					continue;
				}

				var distance = clusterDistance(i,clusters[j]);
				//window.alert("Distância Imagem[" + i + "] a cluster[" + j + "]: " + distance);
				//window.alert("Distância Imagem[" + i + "] a cluster[" + currentCluster + "]: " + distance);
				if(distance < minDistance) { //colocar <=?????
					//window.alert("Imagem[" + i + "] melhor em " + j + ". Distance: " + distance + ". MinDistance: " + minDistance);
					//displayCluster();
					minDistance = distance;
					minCluster = j;
				}
			}
			/**
			 * Se o item não estiver inserido no cluster mínimo, adicione-o
			 */
			if(clusters[minCluster].indexOf(i) == -1) {
				if(currentCluster != -1) {
					clusters[currentCluster].splice(clusters[currentCluster].indexOf(i),1);
					//window.alert("Imagem[" + i + "] removida de " + currentCluster);
					//displayCluster();
				}
				if(i == 0)
					console.log("Imagem 0. Min dist: " + minDistance + ". Best Cluster: " + minCluster);
				clusters[minCluster].push(i);
				//window.alert("Imagem[" + i + "] adicionada a " + minCluster);
				//displayCluster();
				change = true;
				break;				
			}
		
		}
	}
	
	displayCluster();

	return clusters;
}

function displayCluster() {
	var elements = '\n';
	for(var i=0; i<clusters.length; i++) {
		elements += "Cluster[" + i + "] : ";
		for(var j=0; j<clusters[i].length; j++) {
			if(clusters[i][j] == clusters[i].exemplar)
				elements += "[" + clusters[i][j] + "] ";
			else
				elements += clusters[i][j] + ",";	
		}
		elements += '\n';
	}

	console.log(elements);
}

function representation() {
	for(var i=0; i<clusters.length; i++)
		clusterRepresentation(clusters[i]);
}

function histogramDistance(histogram, cluster) {
	var ret = 0.0;

	for(var i=0; i<cluster.length; i++)
		if(cluster[i] != histogram)
			ret += hist.histogramDistance(histograms[cluster[i]],histograms[histogram]);
	return ret;
}

//Argument: Array
function clusterRepresentation(cluster) {
	var exemplar = -1;
	var distance = -1;
		
	for(var i=0; i<cluster.length; i++) {
		var dist = descriptor == 0 ? autoVectorDistance(cluster[i],cluster) : histogramDistance(cluster[i], cluster);
 
		if(exemplar == -1 || dist < distance) {
			exemplar = cluster[i];
			distance = dist;
		}
	}

	cluster.exemplar = exemplar;
	
}

//Arguments: Int, Array
function autoVectorDistance(autoVetor, cluster) {
	var ret = 0.0;

	for(var i=0; i<cluster.length; i++)
		if(cluster[i] != autoVetor)
			ret += av.autoVectorDistance(autoVetores[cluster[i]],autoVetores[autoVetor]);
	return ret;
}

//Arguments: Int, Array
function clusterDistance(element, cluster) {
	//console.log(cluster.exemplar);
	if(cluster.exemplar == undefined || cluster.exemplar == -1)
		return 0;
	else if(descriptor == 0) {
		//Calcula o exemplar como sendo a média das outras imagens
		var exemplar = {};
		exemplar.red = Array(autoVetores[cluster.exemplar].red.length);
		exemplar.green = Array(autoVetores[cluster.exemplar].green.length);
		exemplar.blue = Array(autoVetores[cluster.exemplar].blue.length);
		exemplar.gray = Array(autoVetores[cluster.exemplar].gray.length);

		for(var i=0; i<exemplar.red.length; i++) {
			exemplar.red[i] = autoVetores[cluster.exemplar].red[i];
			exemplar.green[i] = autoVetores[cluster.exemplar].green[i];
			exemplar.blue[i] = autoVetores[cluster.exemplar].blue[i];
			exemplar.gray[i] = autoVetores[cluster.exemplar].gray[i];
		}

		var size;
		for(var i=0; i<cluster.length; i++) {
			if(i != cluster.exemplar) {
				size = autoVetores[cluster[i]].red.length < autoVetores[cluster.exemplar].red.length ? autoVetores[cluster[i]].red.length : autoVetores[cluster.exemplar].red.length;
				for(var j=0; j<size; j++) {
					exemplar.red[j] += autoVetores[cluster[i]].red[j];
					exemplar.green[j] += autoVetores[cluster[i]].green[j];
					exemplar.blue[j] += autoVetores[cluster[i]].blue[j];
					exemplar.gray[j] += autoVetores[cluster[i]].gray[j];

					exemplar.red[j] = exemplar.red[j]/2;
					exemplar.green[j] = exemplar.green[j]/2;
					exemplar.blue[j] = exemplar.blue[j]/2;
					exemplar.gray[j] = exemplar.gray[j]/2;
				}
			}
		}
		if(element != cluster.exemplar)
			return av.autoVectorDistance(autoVetores[element],exemplar);
		else
			return 0.0;
	} else if(descriptor == 1) {
		//Calcula o exemplar como sendo a média das outras imagens
		var exemplar = {};
		exemplar.red = Array(histograms[cluster.exemplar].red.length);
		exemplar.green = Array(histograms[cluster.exemplar].green.length);
		exemplar.blue = Array(histograms[cluster.exemplar].blue.length);
		exemplar.gray = Array(histograms[cluster.exemplar].gray.length);

		for(var i=0; i<exemplar.red.length; i++) {
			exemplar.red[i] = histograms[cluster.exemplar].red[i];
			exemplar.green[i] = histograms[cluster.exemplar].green[i];
			exemplar.blue[i] = histograms[cluster.exemplar].blue[i];
			exemplar.gray[i] = histograms[cluster.exemplar].gray[i];
		}

		for(var i=0; i<cluster.length; i++) {
			if(i != cluster.exemplar) {
				for(var j=0; j<256; j++) {
					exemplar.red[j] += histograms[cluster[i]].red[j];
					exemplar.green[j] += histograms[cluster[i]].green[j];
					exemplar.blue[j] += histograms[cluster[i]].blue[j];
					exemplar.gray[j] += histograms[cluster[i]].gray[j];

					exemplar.red[j] = exemplar.red[j]/2;
					exemplar.green[j] = exemplar.green[j]/2;
					exemplar.blue[j] = exemplar.blue[j]/2;
					exemplar.gray[j] = exemplar.gray[j]/2;
				}
			}
		}

		return hist.histogramDistance(histograms[element],exemplar);
	}
}

function makeCluster(clusters) {
	this.clusters = clusters;
}
