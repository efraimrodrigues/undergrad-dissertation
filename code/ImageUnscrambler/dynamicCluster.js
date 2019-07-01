var { viewFor } = require("sdk/view/core");
var window = viewFor(require("sdk/windows").browserWindows[0]);
var hist = require("histogram");

exports.dynamicCluster = dynamicCluster;

var clusters = {};
var histograms = {};

//Recebe um array de histogramas que deverão ser ordenados
function dynamicCluster(nClusters,externHistograms) {
	histograms = externHistograms;
	//var nClusters = window.prompt("Em quantos agrupamentos você deseja organizar o conjunto de imagens desta página?");
	console.log("Dynamic clustering agrupando imagens em " + nClusters + " clusters.");
	clusters = Array(nClusters);

	for(var i=0; i<nClusters; i++) {
		clusters[i] = new Array();
		clusters[i].push(i);	
		clusters[i].exemplar = i;	
	}

	//for(var i=0; i<clusters.length; i++) {
	//	console.log("Cluster[" + i + "]");
	//	for(var j=0; j<clusters[i].length; j++) {
	//		console.log(clusters[i][j]);	
	//	}
	//}

	var change = true;

	while(change) {
		representation();

		change = false;
		
		for(var i=0; i<histograms.length; i++) {
			var minDistance = clusterDistance(i, clusters[0]);
			
			var minCluster = 0;
			var currentCluster = clusters[0].indexOf(i) != -1 ? 0 : -1;
			
			for(var j=1; j<clusters.length; j++) {
				if(clusters[j].indexOf(i) != -1) {
					currentCluster = j;
					minCluster = j;
					minDistance = clusterDistance(i, clusters[j]);
					continue;
				}

				var distance = clusterDistance(i,clusters[j]);
				if(distance < minDistance) {
					minDistance = distance;
					minCluster = j;
				}
			}
			
			if(clusters[minCluster].indexOf(i) == -1) {
				if(currentCluster != -1)
					clusters[currentCluster].splice(clusters[currentCluster].indexOf(i),1);
				clusters[minCluster].push(i);
				change = true;
				break;				
			}
		
		}
	
	}
	
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

	return clusters;

	//console.log("Dist: " + hist.histogramDistance(histograms[0],histograms[1]) + ".");
}

function representation() {
	//window.alert(histograms.length);
	for(var i=0; i<clusters.length; i++)
		clusterRepresentation(clusters[i]);
}

//Argument: Array
function clusterRepresentation(cluster) {
	var exemplar = -1;
	var distance = -1;
		
	for(var i=0; i<cluster.length; i++) {
		var dist = histogramDistance(cluster[i],cluster);

		if(exemplar == -1 || dist < distance) {
			exemplar = cluster[i];
			distance = dist;
		}
	}

	cluster.exemplar = exemplar;
	
}

//Arguments: Int, Array
function histogramDistance(histogram, cluster) {
	var ret = 0.0;

	for(var i=0; i<cluster.length; i++)
		if(cluster[i] != histogram)
			ret += hist.histogramDistance(histograms[cluster[i]],histograms[histogram]);
	return ret;
}

//Arguments: Int, Array
function clusterDistance(histogram, cluster) {
	return hist.histogramDistance(histograms[histogram],histograms[cluster.exemplar]);
}

function makeCluster(clusters) {
	this.clusters = clusters;
}
