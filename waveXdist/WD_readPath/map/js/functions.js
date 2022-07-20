function initMap_leaflet(mapid,options){
	const map_source="https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmFuY3kxMDExIiwiYSI6ImNpenJ0d2I1cDAwZ20yd3BnNDN1Y3pmejIifQ.tEHvhvW79LDbjWMa4Raz4w";
	//map = L.map('map').setView([24.5, 121], 8);
	const map = L.map(mapid, {
		center: [23.5,121],
		//maxBounds:[[20.885,119.03],[26.315,123.01]],
		//maxZoom: 15,
		minZoom:7,
		zoom: 2,
		trackResize:true,
		//preferCanvas: true ,
		worldCopyJump: true,
		inertia: false
	}).locate();
	const Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
		/*,
		noWrap: true*/
	}).addTo(map);
	const basemap=L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2hpZmFuZyIsImEiOiJja2ZuYmNlMnQwc2cxMnpwMmJydXdvdGwwIn0.lFQ252Opp7N5mMrrNgWhMA', {
		maxZoom: 15,
		
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery 穢 <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
	});
	const Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
		maxZoom: 15
	});
	
	L.control.layers({
		'Street Map (EN)':Esri_WorldStreetMap,
		'Street Map':basemap,
		//'Terrain':Stamen_TerrainBackground,
		'Esri WorldImagery':Esri_WorldImagery
	}
	).addTo(map);
	$('.leaflet-control-layers-toggle').html('Layer');
	//console.log('intmap=',map);
	return map;

}
function toolbox(id){
	this.id = id;
	var toolsObject=[
		{
			'id':'tool-lock',					
			'event':function(){
				var thistool = $('#'+this.id);
				thistool.children().children('input').change(function(){
					if($(this).prop('checked')){
						$('#map').css('z-index','-500');
					}else{
						$('#map').css('z-index','0');
					}
				});
			}
		},{
			'id':'tool-hide',
			'event':function(){
				var thistool = $('#'+this.id);
				thistool.children().children('input').change(function(){
					if($(this).prop('checked')){
						$('#map').css('height','250');
					}else{
						$('#map').css('height','650');
					}
					 map.invalidateSize();
					//detectmap();
				});
				
				
			}
		}
	];
	
	//console.log(toolsObject);
	
	this.install = function(){
		//console.log(this.id);
		
		for (var i in toolsObject ){
			if (toolsObject[i].id === undefined){return false;}
			//console.log(toolsObject[i]);
			//$("#"+toolsObject[i].id).children().append("<text></text>");
			//$("#"+toolsObject[i].id).children().children('text').html(toolsObject[i].offContent);
			$("#"+toolsObject[i].id).children().children('span.tool-off').show();
			
			$("#"+toolsObject[i].id).children().children('input').change(function(){
				//console.log('show=',$(this).prop('checked'));
				$(this).parent().children('.tool-content').hide();
				if($(this).prop('checked')){
					//console.log('on',11);
					
					$(this).parent().children('.tool-on').show();
					
				}else{
					//console.log('off');
					
					$(this).parent().children('.tool-off').show();
				}
			});
			if (toolsObject[i].event !== undefined){
				toolsObject[i].event();
			}
			
		}
	}
	
	$(this.id + ' > .tool-btn').change(function(){
		//console.log($(this).prop('checked'));
		//console.log($(this).parent())
	});
	this.addbtn = function(obj){
		toolsObject.push(obj);
		//console.log(toolsObject);
	}
	
	this.install();
}