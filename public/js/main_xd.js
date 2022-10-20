var GLOBAL = {
	pointIdx : 0,
	lineIdx : 0,
	polygonIdx : 0,
	Analysis : null,
	ghostSymbolmap : null,
	ghostSymbolLayer : null,
	MOVE_PATH : null,
	CURRENT_MOVEMENT : null,
	MOUSE_BUTTON_PRESS : false,
	TRACE_TARGET : null,
	RCidx : 0,
};
let geoserver = 'http://localhost:8089/geoserver/testWorkspace';


//윈도우 크기 자동 적용
window.onresize = function() {

	if (typeof Module == "object") {
		Module.Resize(window.innerWidth-405, window.innerHeight);
		Module.XDRenderData();
	}
};

// 2. 기본지도 호출 함수 
function callCesiumMap(){
    
  var tm = (new Date()).getTime();	// 캐싱 방지
    
	// 1. XDWorldEM.asm.js 파일 로드
	var file = "/js/xdmap/XDWorldEM.asm.js?tm="+tm;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', file, true);
	xhr.onload = function() {

		var script = document.createElement('script');
		script.innerHTML = xhr.responseText;
		document.body.appendChild(script);

		// 2. XDWorldEM.html.mem 파일 로드
		setTimeout(function() {
			(function() {

				var memoryInitializer = "/js/xdmap/XDWorldEM.html.mem?tm="+tm;
				var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
				xhr.open('GET', memoryInitializer, true);
				xhr.responseType = 'arraybuffer';
				xhr.onload =  function(){

					// 3. XDWorldEM.js 파일 로드
					var url = "/js/xdmap/XDWorldEM.js?tm="+tm;
					var xhr = new XMLHttpRequest();
					xhr.open('GET',url , true);
					xhr.onload = function(){
						var script = document.createElement('script');
						script.innerHTML = xhr.responseText;
						document.body.appendChild(script);
					};
					xhr.send(null);
				}
				xhr.send(null);
			})();
		}, 1);
	};
	xhr.send(null);

  /*********************************************************
 *	엔진파일 로드 후 Module 객체가 생성되며,
 *  Module 객체를 통해 API 클래스에 접근 할 수 있습니다.
 *	 - Module.postRun : 엔진파일 로드 후 실행할 함수를 연결합니다.
 *	 - Module.canvas : 지도를 표시할 canvas 엘리먼트를 연결합니다.
 *********************************************************/

	validDragSdis();
	
	

}


function validDragSdis() {
	var validDiv = document.getElementById("canvas");

	validDiv.onmouseover = function() {
		Module.XDIsMouseOverDiv(false);
	};

	validDiv.onmouseout = function() {
		Module.XDIsMouseOverDiv(true);
	};
}

var Module = {
   TOTAL_MEMORY: 256*1024*1024,
   postRun: [initXDMap],
   canvas: (function() {

	 // Canvas 엘리먼트 생성
	 var canvas = document.createElement('canvas');

	 // Canvas id, Width, height 설정
	 canvas.id = "canvas";

	 canvas.width= window.innerWidth-405;
	 canvas.height=window.innerHeight;	

	 canvas.addEventListener("contextmenu", function(e){
	   e.preventDefault();
	 });

	 // 생성한 Canvas 엘리먼트를 cesiumContainer요소에 추가합니다.
	 document.getElementById('cesiumContainer').appendChild(canvas);

	 return canvas;
   })()
 };
 
function initXDMap(){
  Module.Start(window.innerWidth-405, window.innerHeight);
  Module.map = Module.getMap();
  GLOBAL.Analysis = Module.getAnalysis();
  GLOBAL.ghostSymbolmap = Module.getGhostSymbolMap();

}

//카메라 이동합수
function moveCamera(){
    var lon = $('#camLon').val(); //경도
    var lat = $('#camLat').val(); //위도
    var alt = $('#camAlt').val(); //높이
    //##실습2. 기본 지도 로딩 함수 추가. 지정 좌표로 위치 이동 소스 추가
	let camera = Module.getViewCamera();
	lon *= 1; 
	lat *= 1;
	alt *= 1; 

	camera.setLocation(new Module.JSVector3D(lon, lat, alt));
	
    //##실습2. 기본 지도 로딩 함수 추가. 지정 좌표로 위치 이동 소스 추가
}

//클릭지점 좌표
function setMouseLClickEvent(val){
	if(val){
		Module.canvas.onmousedown = function(e){
			var screenPosition = new Module.JSVector2D(e.x-405, e.y);
		
			// 화면->지도 좌표 변환
			var mapPosition = Module.getMap().ScreenToMapPointEX(screenPosition);
			lon = parseFloat(mapPosition.Longitude).toFixed(6);
			lat = parseFloat(mapPosition.Latitude).toFixed(6);

			$('#evntLon').val(lon); //인풋에 입력
            $('#evntLat').val(lat);
			
		}
	}else{
		
		Module.canvas.onmousedown = "return false;"
	}

}

//위치 검색
$('.search button').click(function(){

	let keyword = $('.search input').val();
	searchPlace(keyword, 1);	

});

//위치 검색 페이지 이동
$(document).on('click', '.s_paging li', function(){
	
	let keyword = $('.search input').val();
	let num = this.innerText;

	if($(this).attr('disabled') == 'disabled'){
		return;
	}

	if(num == '▶'){
		num = Number($('#currnetPage').text())+1;
	}else if(num == '◀'){
		num = Number($('#currnetPage').text())-1;
	}
  
	searchPlace(keyword, num);
})

//위치 검색 api
function searchPlace(keyword, pageNum){

	var params = {
        service: "search"
        , request: "search"
        , version: "2.0"
        , crs: "EPSG:4326"
        , size: 10
        , page: pageNum
        , query: keyword
        , type: 'PLACE'
        , format: "json"
        , errorformat: "json"
        , key: "79D419E6-64C6-3B88-846C-1CEB694E66BB"
    }


    $.ajax({
        type: 'GET'
        , url: "http://api.vworld.kr/req/search"
        , dataType: 'JSONP'
        , data: params
        , success: function (data) {
			$('#tab2 h2').html("<span>"+keyword+"</span>검색결과입니다.")
			searchResultList(data);
			setPagination(data.response.page);
        }
    })


}

//검색결과 목록
function searchResultList(data){

	let result = '';
	for(let i = 0; i<data.response.record.current; i++){
	
		result += '<li class="title active" data-pointx='+data.response.result.items[i].point.x+' data-pointy='+data.response.result.items[i].point.y+'><ul>';
		result += '<li>'+data.response.result.items[i].title+'</li>';
		result += '<li>'+data.response.result.items[i].address.parcel+'</li>';
		result += '<li class="addr">'+data.response.result.items[i].address.road+"</li>";
		result += '<li class="phone">'+data.response.result.items[i].id+'<span> | '+data.response.result.items[i].category+'</span></li></ul></li>';
		
	}

	$('.s_location').html(result);

}

//검색결과 페이징
function setPagination(pageData){
	let result = ''; 
	let startPage = (parseInt((pageData.current-1)/10)*10)+1;
	let endPage = startPage+(pageData.size-1);

	if(pageData.current == '1'){
		result += '<li disabled>◀</li>';
	}else{
		result += '<li>◀</li>';
	}

	let maxPage = pageData.total < endPage ? pageData.total : endPage;
	for(let i = startPage; i<=maxPage; i++){

		if(pageData.current == i){

			result += "<li id='currnetPage' disabled>"+i+"</li>";
		}else{

			result += "<li>"+i+"</li>";
		}
	}

	if(pageData.current == pageData.total){
		result += '<li disabled>▶</li>';
	}else{
		result += '<li>▶</li>';
	}

	$('.s_paging').html(result);

}

$(document).on('click', '.s_location li',function(e){

	let camera = Module.getViewCamera();
	camera.setLocation(new Module.JSVector3D(Number(this.dataset.pointx), Number(this.dataset.pointy), 1000));
})



//기본 객체 관리
function drawInterection(num){
	switch(num){
		case 1 : drawPoint();
			break;
		case 2 : drawLine();
			break;
		case 3 : drawPolygon();
			break;
		case 0 : setMouseMode();
			break;
		}

}

//point 생성
function drawPoint(){ 

	Module.canvas.onmousedown = function(e){
		var screenPosition = new Module.JSVector2D(e.x-405, e.y);
		
		// 화면->지도 좌표 변환
		var mapPosition = Module.map.ScreenToMapPointEX(screenPosition);
		
		lon = parseFloat(mapPosition.Longitude).toFixed(6);
		lat = parseFloat(mapPosition.Latitude).toFixed(6);
		alt = parseFloat(mapPosition.Altitude).toFixed(6);
		
		// POI 오브젝트를 추가 할 레이어 생성
		var layerList = new Module.JSLayerList(true);
		var layer = layerList.createLayer("POI_Layer", Module.ELT_3DPOINT);
		
		var img = new Image();
		img.onload = function(){

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			GLOBAL.pointIdx++;
			var point = Module.createPoint('point_'+GLOBAL.pointIdx);
			point.setPosition(new Module.JSVector3D(Number(lon), Number(lat), 10));
			point.setImage(ctx.getImageData(0, 0, this.width, this.height).data, this.width, this.height);
			this.layer.addObject(point, 0);
		};
		img.layer = layer;
		img.src = '/XDdata/map_pin.png';

		
		Module.canvas.onmousedown = 'return false;'
		Module.XDSetMouseState(1);

	};

}

//line 생성
function drawLine(){
	Module.XDSetMouseState(21);

	Module.canvas.onmouseup = function(e){

		var map = Module.getMap();
		var inputPoint = map.getInputPoints();
	
		if(inputPoint.count() != 2){
			return;
		}

		var layerList = new Module.JSLayerList(true);
		var layer = layerList.createLayer("LINE_Layer", Module.ELT_3DLINE);

		let corArr= [];
		for (var i=0; i<inputPoint.count(); i++) {
			
			// 입력한 점 위치에서 고도 5m 를 상승시킨 후 버텍스 추가
			var point = inputPoint.get(i);
			corArr.push([point.Longitude, point.Latitude, 10.0]);
		}

		let coordinates = {
			coordinate : corArr,
			style : "XYZ",
		}

		lineObj = createNormalLine(coordinates);

		//라인 아이디
		GLOBAL.lineIdx++;
		let lineId = "LINE_"+GLOBAL.lineIdx;
		
		let line = Module.createLineString(lineId); 
		line.createbyJson(lineObj);

		//레이어에 추가
		layer.addObject(line, 0);
		map.clearInputPoint();
		Module.XDSetMouseState(1);
		Module.canvas.onmouseup = 'return false;';
	} 
}

//line 설정
function createNormalLine(coordinates){
	let data = {
		coordinates: coordinates,
		type: 0,											// 실선 생성 		
		union: false,										// 지형 결합 유무
		depth: false,										// 오브젝트 겹침 유무
		color: new Module.JSColor(255, 255, 0, 0),			// ARGB 설정
		width: 3,											// 선 굵기
	}
	return data;
}

//polygon 생성
function drawPolygon(){

	Module.XDSetMouseState(21);
	Module.canvas.ondblclick = function(e){
		var map = Module.getMap();
		var inputPoint = map.getInputPoints();
		var inputPointCnt = inputPoint.count();
	
		
		if(inputPoint.count() < 3){
			return;
		}

		//폴리곤 객체를 저장할 레이어 생성( 이미 생성한 경우 레이어 반환 )
		var layerList = new Module.JSLayerList(true);
		var layer = layerList.nameAtLayer("POLYGON_Layer");
		if(layer == null){
			//레이어가 없는 경우 새로 생성
			layer = layerList.createLayer("POLYGON_Layer", Module.ELT_POLYHEDRON);
		}
		
		// 폴리곤 객체 생성
		GLOBAL.polygonIdx++;
		var polygonId = "POLYGON_"+GLOBAL.polygonIdx;
		var polygon = Module.createPolygon(polygonId);

		// 폴리곤 색상 설정
		var polygonStyle = new Module.JSPolygonStyle();
		polygonStyle.setFill(true);
		polygonStyle.setFillColor(new Module.JSColor(102, 051, 153, 0.1));
		
		// 폴리곤 아웃라인 설정
		polygonStyle.setOutLine(true);
		polygonStyle.setOutLineWidth(2.0);
		polygonStyle.setOutLineColor(new Module.JSColor(100, 255, 228, 0.5));
		
		polygon.setStyle(polygonStyle);
		
		// 입력한 지점(inputPoint, part)으로 폴리곤 형태 정의
		var part = new Module.Collection();
		part.add(inputPointCnt);

		var vertex = new Module.JSVec3Array();
		for (var i=0; i<inputPointCnt; i++) {
			
			// 입력한 점 위치에서 고도 5m 를 상승시킨 후 버텍스 추가
			var point = inputPoint.get(i);
			vertex.push(new Module.JSVector3D(point.Longitude, point.Latitude, point.Altitude+5.0));
		}
		
		polygon.setPartCoordinates(vertex, part);
		
		// 레이어에 객체 추가
		layer.addObject(polygon, 1);

		Module.canvas.ondblclick = 'return false;';
		map.clearInputPoint();
		Module.XDSetMouseState(1);

	}
}

//마우스 이동모드
function setMouseMode(){
	Module.XDSetMouseState(1);
	Module.map.clearInputPoint();
}

//그리기 객체 삭제 
function removeDrawEntity(){
	Module.XDSetMouseState(6);
	Module.canvas.addEventListener('Fire_EventSelectedObject', function(e){
		var objLayer = 'POI_LayerLINE_LayerPOLYGON_Layer';
		if(!(objLayer.includes(e.layerName))){
			Module.map.clearSelectObj();
			return;
		}
		
		// 사용자 레이어 리스트에서 객체 키를 사용해 객체 반환
		var layerList = new Module.JSLayerList(true);
		var layer = layerList.nameAtLayer(e.layerName);
		if(layer != null){
			layer.removeAtKey(e.objKey);
		}
	})

}

//vworld 건물 추가
function addOSMBuilding(val){
	Module.XDSetMouseState(1);

	if(val){
		Module.XDEMapCreateLayer("facility_build", "https://xdworld.vworld.kr", 0, true, true, false, 9, 0, 15);
		Module.setVisibleRange("facility_build", 3.0, 100000.0);
		Module.getMap().setSimpleMode(true);

	}else{
		Module.XDEMapRemoveLayer("facility_build");
		console.log($('#rm_vbuilding').attr('checked', false));


		
	}

}

//vworld 건물 삭제
function removeOSMBuilding(val){

	if(!val){
		Module.XDSetMouseState(1);
		return;
	}

	var layerlist = new Module.JSLayerList(false);
	Module.XDSetMouseState(6);
	Module.canvas.addEventListener('Fire_EventSelectedObject', function(e){
		
		if(e.layerName == 'facility_build'){
			layerlist.nameAtLayer('facility_build').keyAtObject(e.objKey).setVisible(false);
			Module.getMap().clearSelectObj();
		}
	})
	
}

//모델객체 관리
function addModelEntity(val, mName, height){

	switch(mName){
		case 'CesiumBalloon': mName = 'Airship'; break;
		case 'Cesium_Air': mName = 'policeStation'; break;
		case 'Cesium_Man': mName = 'building_1'; break;
		case 'CesiumDrone': mName = 'drone'; break;
		case 'CesiumMilkTruck': mName = 'house'; break;
		case 'GroundVehicle': mName = 'hospital'; break;
	}
	
	var layerlist = new Module.JSLayerList(true);
	GLOBAL.ghostSymbolLayer = layerlist.createLayer('GHOST_SYMBOL_LAYER',Module.ELT_GHOST_3DSYMBOL);
	GLOBAL.ghostSymbolMap = Module.getGhostSymbolMap();
	
	if(mName == 'Airship'){
		stopAirship();//애니메이션 종료
	}

	if(!val){
		GLOBAL.ghostSymbolLayer.keyAtObject(mName).setVisible(false);
		stopAirship();//애니메이션 종료
		return;
	}
	
	var g = Module.getGhostSymbolMap().isExistID(mName);
	if(g){
		GLOBAL.ghostSymbolLayer.keyAtObject(mName).setVisible(true);
		if(mName == 'Airship'){
			GLOBAL.ghostSymbolLayer.keyAtObject(mName).setPosition(new Module.JSVector3D(127.1, 37.5, 100));//출발지점으로 이동
		}
		return;
	} 
	
	let position=[127.1-(height*0.000006), 37.499103, (mName == 'drone'?100:15)];
	

	//고스트심볼 객체 생성
	Module.getGhostSymbolMap().insert({
		id : mName,
		url : '/XDdata/'+mName+".3ds",
		callback : function(e) {
			// 텍스쳐 설정
			Module.getGhostSymbolMap().setModelTexture({
				id : e.id,
				face_index : 0,
				url : '/XDdata/'+mName+".jpg",
				callback : function(e) {
					// console.log(e.id);
				}
			});

			// 오브젝트 생성 및 레이어 추가
			var object = createGhostSymbol(mName, e.id, position);
			GLOBAL.ghostSymbolLayer.addObject(object, 0);
		}
	});

}

/* 고스트 심볼 모델 오브젝트 생성 */
function createGhostSymbol(_objectKey, _modelKey, _position) {
	var newModel = Module.createGhostSymbol(_objectKey);
	
	// base point 설정
	var modelHeight = GLOBAL.ghostSymbolMap.getGhostSymbolSize(_modelKey);
	
	newModel.setBasePoint(0, -modelHeight.height*0.5, 0);
	newModel.setRotation(0, 90.0, 0);
	newModel.setScale(_objectKey == 'drone'? new Module.JSSize3D(0.1, 0.1, 0.1): new Module.JSSize3D(1.0, 1.0, 1.0));
	newModel.setGhostSymbol(_modelKey);
	newModel.setPosition(new Module.JSVector3D(_position[0], _position[1], _position[2]));			
		
	return newModel;
}

//사용자 객체삭제
function removeAllEntity(){
	Module.canvas.onmousedown = 'return false;'
	Module.canvas.onmousemove ='return false;'
	Module.canvas.onmouseup = 'return false;'

	//모델 객체 삭제
	var layerlist = new Module.JSLayerList(true);
	var layer = layerlist.nameAtLayer('GHOST_SYMBOL_LAYER');
	var objlist;
	if(layer != null){
		objlist = layer.getObjectKeyList();
		if(objlist != null){
			objlist = objlist.split(',');

			for(let i = 0; i<objlist.length-1; i++){
				layer.keyAtObject(objlist[i]).setVisible(false);
			}
		}
	}

	$('.underground_Facility input[type=checkbox]').attr('checked', false);

	//마우스 클릭 객체 삭제
	layer = layerlist.nameAtLayer('RClickLayer');
	if(layer != null){
		objlist = layer.getObjectKeyList();
		if(objlist != null){
			objlist = objlist.split(',');
			for(let i = 0; i<objlist.length-1; i++){
				layer.removeAtKey(objlist[i]);
			}

		}
	}

	stopAirship();

}

/**객체 이동 이벤트시 마우스이벤트 */
let mousedownE = function(e){
	GLOBAL.MOUSE_BUTTON_PRESS = true;
}
let mouseupE = function(e){
	GLOBAL.MOUSE_BUTTON_PRESS = false;
}
let mousemoveE = function(e){
	if (GLOBAL.MOUSE_BUTTON_PRESS) {
		if (e.buttons == 2) {
			
			GLOBAL.TRACE_TARGET.direction += (e.movementX*0.1);
			GLOBAL.TRACE_TARGET.tilt += (e.movementY*0.1);
		}
	}

}
let mouseWheelE = function(e){
	
	if (e.wheelDelta < 0) {
		GLOBAL.TRACE_TARGET.distance *= 1.1;
		
	} else {
		GLOBAL.TRACE_TARGET.distance *= 0.9;
	}

} 


//객체이동 이벤트  > 애니메이션 시작
function playCarAnimation(){
	let temp;
	var camera = Module.getViewCamera();
	// 마우스 이벤트 설정
	Module.canvas.addEventListener('mousedown', mousedownE);
	Module.canvas.addEventListener('mouseup', mouseupE);
	Module.canvas.addEventListener('mousemove', mousemoveE);
	
	Module.canvas.addEventListener('wheel', mouseWheelE);

	// 경로 저장
	GLOBAL.MOVE_PATH = createPath([
		[127.099990, 37.496261, 3.1252494417130947],
		[127.101792, 37.495967, 3.1252494417130947],
		[127.103676, 37.496446, 3.1252494417130947],
		[127.102788, 37.498322, 3.1252494417130947],
		[127.099263, 37.497256, 3.1252494417130947],
		[127.099990, 37.496261, 3.1252494417130947]

	]);

	var layerlist = new Module.JSLayerList(true);
	var layer = layerlist.nameAtLayer('GHOST_SYMBOL_LAYER');
	var obj = layer.keyAtObject('Airship');
	var traceTarget = Module.createTraceTarget(obj.getId());
	traceTarget.set({
		object : obj,
		tilt : 45.0,
		direction : 0.0,
		distance : 500.0
	});
	GLOBAL.TRACE_TARGET = traceTarget;
	camera.setTraceTarget(GLOBAL.TRACE_TARGET);
	camera.setTraceActive(true);
	Module.XDRenderData();

	if (GLOBAL.CURRENT_MOVEMENT != null) {
		
		// 이동 중인 타이머가 있는 경우 클리어
		clearTimeout(GLOBAL.CURRENT_MOVEMENT);
		
	}
	move(0);
}

//애니메이션 종료
function stopAirship(){
	var camera = Module.getViewCamera();
	camera.setTraceActive(false);
	clearTimeout(GLOBAL.CURRENT_MOVEMENT);

	Module.canvas.removeEventListener('mousedown', mousedownE);
	Module.canvas.removeEventListener('mouseup', mouseupE);
	Module.canvas.removeEventListener('mousemove', mousemoveE);
	
	Module.canvas.removeEventListener('wheel', mouseWheelE);

}

/* 이동 실행 */
function move(_index) {
	
	var camera = Module.getViewCamera();
	
	// 현재 위치가 이동 경로의 마지막 지점이면 이동 종료
	if (_index >= GLOBAL.MOVE_PATH.count()) {
		
		GLOBAL.CURRENT_MOVEMENT = null;
		camera.setTraceActive(false);
		return;
	}
	
	// 다음 이동 점의 지형 고도 반환 후 타겟 오브젝트 이동
	var position = GLOBAL.MOVE_PATH.get(_index);
	var altitude = Module.getMap().getTerrHeightFast(position.Longitude, position.Latitude);
	GLOBAL.TRACE_TARGET.getObject().setPosition(new Module.JSVector3D(position.Longitude, position.Latitude, altitude));
	
	// 시간 간격으로 두고 다음 지점으로 이동
	GLOBAL.CURRENT_MOVEMENT = setTimeout(function() {
		move(_index+1);
	}, 50);
}


/* 이동 경로 생성 */
function createPath(_pathPoint) {

	var input = new Module.JSVec3Array();
	for (var i=0; i<_pathPoint.length; i++) {
		input.push(new Module.JSVector3D(_pathPoint[i][0], _pathPoint[i][1], _pathPoint[i][2]));
	}

	return Module.getMap().GetPathIntervalPositions(input, 1.0, false);
}

//애니메이션 멈춤
function stopCarAnimation(){
	clearTimeout(GLOBAL.CURRENT_MOVEMENT);
	stopAirship();
}

//마우스로 객체 추가&삭제
function setMouseRClickEvent(val, id){
	
	$('#'+(id == 'RCL_DELETE'?'RCL_MAKE': 'RCL_DELETE')).attr('checked', false);
	
	Module.canvas.onmousedown = 'return false;'
	Module.canvas.onmousemove ='return false;'
	Module.canvas.onmouseup = 'return false;'
	if(!val){
		Module.XDSetMouseState(1);
		return;
	}
	
	if(id == 'RCL_DELETE'){//클릭 시 객체 삭제
		
		Module.XDSetMouseState(6);
		Module.canvas.addEventListener('Fire_EventSelectedObject', function(e){
			if(e.layerName == 'RClickLayer'){

				let layerList = new Module.JSLayerList(true);
				let layer = layerList.nameAtLayer(e.layerName);
				layer.removeAtKey(e.objKey);
			}
		});

	}else{//클릭 시 객체 생성
		Module.XDSetMouseState(1);
		let mTag = false;
		Module.canvas.onmousedown = function(){mTage = true;}
		Module.canvas.onmousemove = function(){mTage = false;}
	
		Module.canvas.onmouseup = function(e){
			if(!mTage){
				return;
			}
			
			var mapPosition = Module.getMap().ScreenToMapPointEX(new Module.JSVector2D(e.x-405, e.y));
			
			let lon = parseFloat(mapPosition.Longitude).toFixed(6);
			let lat = parseFloat(mapPosition.Latitude).toFixed(6);
			let alt = Module.map.getTerrHeight(Number(lon), Number(lat));
	
			let layerList = new Module.JSLayerList(true);
			let layer = layerList.nameAtLayer('RClickLayer');
			if(layer == null){
				layer = layerList.createLayer('RClickLayer', Module.ELT_GHOST_3DSYMBOL);
			}
			GLOBAL.ghostSymbolLayer = layer;
			GLOBAL.ghostSymbolMap = Module.getGhostSymbolMap();
			
		
			let url3D = '/XDdata/church3D.xdo';
			let position=[Number(lon), Number(lat), alt];
			let RCid = 'RClickObj_'+GLOBAL.RCidx++;

			Module.getGhostSymbolMap().insert({
				id : RCid,
				url : url3D,
				callback : function(e) {
					// 텍스쳐 설정
					Module.getGhostSymbolMap().setModelTexture({
						id : e.id,
						face_index : 0,
						url : '/XDdata/church3D.jpg',
						callback : function(e) {
						}
					});
		
					// 오브젝트 생성 및 레이어 추가
					var object = createGhostSymbol(RCid, e.id, position);
					
					GLOBAL.ghostSymbolLayer.addObject(object, 0);
					
				}
			});
		}
	}
}

//wms 레이어 추가
function addWmsLayer(val, layerName){
	
	let layerList = new Module.JSLayerList(false);		
	let wmslayer = layerList.nameAtLayer("wmslayer_"+layerName);
	if(!val){
		layerList.setVisible("wmslayer_"+layerName, false);
		return;
	}else if(wmslayer != null){
		layerList.setVisible("wmslayer_"+layerName, true);
		return;
	}

	Module.SetProxy('./proxywms?');

	if(!val){
		if(wmslayer != null)	wmslayer.clearWMSCache();	
		layerList.delLayerAtName("wmslayer_"+layerName) 				
		return;
	}

	let slopeoption = {
		url : '',
		layer: layerName,
		minimumlevel: 0,	
		maximumlevel: 15,
		crs:'EPSG:4326',
		parameters:  {
			key : 'F1D04FBB-DBB3-3F07-9B45-2FA496499F9B', //api key
			request : 'GetMap',
			styles : (layerName == 'lt_c_upisuq161'?layerName:layerName+'_3d'),
			version : '1.3.0',                            //wms version
			domain: 'localhost:8080',                     //api 신청 주소
			format : 'image/png',
			transparent:'true',
			bbox:'-180,-90,0,90'
		},

	};	
	wmslayer = layerList.createWMSLayer("wmslayer_"+layerName); 
	wmslayer.setBBoxOrder(false);
	wmslayer.setWMSProvider(slopeoption);				// WMS 레이어 정보 셋팅
	wmslayer.setProxyRequest(true);	// WMS 레이어 생성
	
}

//wfs레이어 추가
function addWfsLayer(val, layerName){

	if(layerName == 'lt_c_wkmstrm'){layerName = 'lt_c_ud801'};
	if(val){
		
		let param ={
			service : 'WFS',
			request : 'GetFeature',
			version : '1.1.0',
			maxFeatures : 50,
			output : 'application/json',
			key : 'F1D04FBB-DBB3-3F07-9B45-2FA496499F9B',
			DOMAIN : 'localhost:8080',
			crs : 'EPSG:4326',
			srsname : 'EPSG:4326',
			typename : layerName,
		}
		
			$.ajax({
				method : 'get'
				,url : '/proxywfs'
				,data : param        
				,success : function(data){
					var layerList = new Module.JSLayerList(true);
					layerList.delLayerAtName(layerName);
					let layer = layerList.createLayer(layerName+"_Layer", 1);
					if(layerName == 'lt_p_moctnode'){
						createPoint(data.features, layer);
					}else{
						createPolygon(data.features, layer);
					}
				}
				,error : function(e){
					console.log(e);
				}
			})
	}else{
		let layerList = new Module.JSLayerList(true);	
		layerList.delLayerAtName(layerName+"_Layer");	
		return;
	}

}

//wfs polygon 생성
function createPolygon(featuresArr, layer){

	for(let k = 0; k<featuresArr.length; k++){
		let f = featuresArr[k];
		
		let polygon = Module.createPolygon(f.id);
		let color = new Module.JSColor(170, 153, 153, 153);
		let outline = new Module.JSColor(12, 153, 153, 153);

		// 폴리곤 색상 설정
		var polygonStyle = new Module.JSPolygonStyle();
		polygonStyle.setFill(true);
		polygonStyle.setFillColor(color);
		
		// 폴리곤 아웃라인 설정
		polygonStyle.setOutLine(true);
		polygonStyle.setOutLineWidth(2.0);
		polygonStyle.setOutLineColor(outline);
		
		polygon.setStyle(polygonStyle);

		// 입력한 지점(inputPoint, part)으로 폴리곤 형태 정의
		var part = new Module.Collection();
		part.add(f.geometry.coordinates[0][0].length);
	
		var vertex = new Module.JSVec3Array();
		for (var i=0; i<f.geometry.coordinates[0][0].length; i++) {
			
			// 입력한 점 위치에서 고도 5m 를 상승시킨 후 버텍스 추가
			var point = f.geometry.coordinates[0][0][i];
			vertex.push(new Module.JSVector3D(point[0], point[1], 50.0));
		}

		polygon.setPartCoordinates(vertex, part);
		polygon.setUnionMode(true);//지형결합 option

		// 레이어에 객체 추가
		layer.addObject(polygon, 0);
		
	};
	layer.setMaxDistance(50000000);
	
}

//wfs point 생성
function createPoint(data, layer){
	data.forEach(e => {
		var img = new Image();
		img.onload = function(){

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			GLOBAL.pointIdx++;
			var point = Module.createPoint(e.id);
			point.setPosition(new Module.JSVector3D(Number(e.geometry.coordinates[0]), Number(e.geometry.coordinates[1]), 10));
			point.setImage(ctx.getImageData(0, 0, this.width, this.height).data, this.width, this.height);
			layer.addObject(point, 0);
		};
		img.layer = layer;
		img.src = '/XDdata/map_pin.png';
		layer.setMaxDistance(50000000);
	})
}

//그림자 효과
function addShadowEffect(val){
	Module.XDSetMouseState(1);
	if(val){

		Module.XDEMapCreateLayer("facility_build", "https://xdworld.vworld.kr", 0, true, true, false, 9, 0, 15)
		Module.setVisibleRange("facility_build", 3.0, 100000.0);
		Module.getMap().setSimpleMode(false);

		GLOBAL.Analysis.setAllObjectRenderShadow(true);
		GLOBAL.Analysis.setShadowSimulTerm(30);
	}else{
		Module.XDEMapRemoveLayer("facility_build");
	}
}

//그림자 시뮬레이션 시작
function startShadowSimulation(){
	GLOBAL.Analysis.setShadowSimulTime(2022, 10, 5, 9, 00, 18, 00);
	GLOBAL.Analysis.setShadowSimulation(true);

}

//그림자 시뮬레이션 멈춤
function stopShadowSimulation(){
	GLOBAL.Analysis.setShadowSimulation(false);
}

//눈효과 적용
function playSnowEffect(){
	Module.map.stopWeather();	
	Module.map.clearSnowfallArea();

	Module.map.startWeather(0, 5, 5)
	Module.map.setSnowfall(1);
	Module.map.setSnowfallLevel(2.0);
	Module.map.setSnowImageURL('/XDdata/snow.png');
	Module.map.startWeather(0, 1, 1);
}

//비효과 적용
function playRainEffect(){
	Module.map.stopWeather();	
	Module.map.clearSnowfallArea();
	Module.map.setSnowfall(0);

	Module.map.startWeather(1, 5, 5)
	Module.map.setRainImageURL('/XDdata/rain.png')
	Module.map.startWeather(1, 5, 5);

}

// 하늘 밝기
function setSkyBright(val){
	Module.map.stopWeather();	
	Module.map.clearSnowfallArea();
	Module.map.setSnowfall(0);
	
	Module.map.setFogLimitAltitude(6000000.0);
	Module.map.setFogEnable(true);
	color = new Module.JSColor(255, 10, 10, 10);
	Module.map.setFog(color, 5.8, 1000, Number(val));
	Module.XDRenderData();

}

//안개 가시범위
function setFogDensity(val){
	Module.map.stopWeather();	
	Module.map.clearSnowfallArea();
	Module.map.setSnowfall(0);

	let dis = 5000 - (val * 100);
	
	Module.map.setFogLimitAltitude(6000000.0);
	Module.map.setFogEnable(true);

	color = new Module.JSColor(255, 255, 255, 255);
	Module.map.setFog(color, 5.8, dis, 0.9);
	Module.XDRenderData();

}

//기상효과 제거
function removeWeatherEntity(){
	Module.map.stopWeather();	
	Module.map.clearSnowfallArea();
	Module.map.setSnowfall(0);
	Module.map.setFogEnable(false);

}

//통계표현
function createSeriesSetter(type){
	let camera = Module.getViewCamera();
	camera.setAltitude(1000000);

	var layerList = new Module.JSLayerList(true);
	
	layerList.setVisible('LAYER_GRID_2D', false);
	layerList.setVisible('LAYER_GRID_3D', false);
	var layer;
	
	if(!type){return;}
	
	if(layerList.nameAtLayer('LAYER_GRID_'+type) != null){
		layerList.setVisible('LAYER_GRID_'+type, true);
		return;
	}else{
		layer = layerList.createLayer('LAYER_GRID_'+type, Module.ELT_POLYHEDRON)
	}
	
	$.getJSON("/XDdata/data.json", function(data) {
		// 그래프 생성
		var grid;
		if(type == '2D'){
			grid = createGrid_2D(data);
		}else if(type == '3D'){
			grid = createGrid_3D(data);
		}
		layer.addObject(grid, 0);
		layer.setMaxDistance(2000000.0);
		layer.setMinDistance(0.0);
	});
	

}

/* 그래프 생성 */
function createGrid_2D(_data) {
	gridData = _data.data.data;

	//그리드 객체 생성
	var grid = Module.createColorGrid('2D_GRID');

	//최대, 최소 rect와 셀 갯수에 따른 그리드 cell 위치 지정
	grid.SetGridCellDefaultColor(new Module.JSColor(0, 0, 0, 0));

	//그리드 셀의 위치 및 크기, 높이 설정
	var rowNum = 180,
		colNum = 160;
	
	grid.SetGridPosition(
		new Module.JSVector2D(124, 38.95),
		new Module.JSVector2D(133, 38.95),
		new Module.JSVector2D(133, 30.9),
		new Module.JSVector2D(124, 30.9),
		10000.0,
		rowNum,
		colNum
	);


	var gridCellColor = [
		new Module.JSColor(150,215,25,28),		//빨
		new Module.JSColor(150,253,174,97),		//주
		new Module.JSColor(150,255,255,191),		//노
		new Module.JSColor(150,171,221,164),		//초
		new Module.JSColor(150,43,131,186)		//파
	];
	
	// 격자 cell line color 초기화
	grid.SetGridLineColor(new Module.JSColor(10,255,255,255));


	for(var i = 0; i<gridData.length; i++){
		var grade=0;
		grade = gridData[i].grade;
		if(grade == 5){
			grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[0]);
		}else if(grade == 4){
			grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[1]);
		}else if(grade == 3){
			grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[2]);
		}else if(grade == 2){
			grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[3]);
		}else if(grade == 1){
			grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[4]);
		}

	}

	grid.Create();
	return grid;

}

function createGrid_3D(_data){
	var gridData = _data.data.data;
	//그리드 객체 생성
	var grid = Module.createColorGrid3D('3D_GRID');

	// 최대, 최소 rect와 셀 갯수에 따른 그리드 cell 위치 지정
	grid.SetGridCellDefaultColor(new Module.JSColor(0, 0, 0, 0));
	// 그리드 셀의 위치 및 크기, 높이 설정
	var rowNum = 180,
		colNum = 160;
	
	grid.SetGridPosition(
		new Module.JSVector2D(124, 38.95), 		// 그리드 좌상단
		new Module.JSVector2D(133, 38.95), 		// 그리드 우상단
		new Module.JSVector2D(133, 30.9), 		// 그리드 우하단
		new Module.JSVector2D(124, 30.9), 		// 그리드 좌하단
		1000.0, 								// 그리드 바닥면 고도
		rowNum, 								// 그리드 가로 셀 갯수
		colNum									// 그리드 세로 셀 갯수
	);
	// 격자 cell line color 초기화
	for(var i=0;i<180;i++){
		for(var j=0;j<160;j++){
			grid.SetGridCellLineColor(i, j,  new Module.JSColor(0,255,255,255));
		}
	}
	// 값에 따른 그리드 셀 색상 리스트//컬러변경
	var gridCellColor = [
		new Module.JSColor(150,215,25,28),		//빨
		new Module.JSColor(150,253,174,97),		//주
		new Module.JSColor(150,255,255,191),		//노
		new Module.JSColor(150,171,221,164),		//초
		new Module.JSColor(150,43,131,186)		//파
	];
		for(var i=0;i<gridData.length;i++){
			var grade=0;
			grade=gridData[i].grade;
			//격자 색 설정
			if(grade ==5){
					grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[0]);
			}else if(grade ==4)	{
					grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[1]);
			}else if(grade ==3)	{
					grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[2]);
			}else if(grade ==2)	{
					grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[3]);
			}else if(grade ==1)	{
					grid.SetGridCellColor(gridData[i].index_y, gridData[i].index_x, gridCellColor[4]);
			}
			// 셀 높이 설정
			grid.SetGridCellHeight(gridData[i].index_y, gridData[i].index_x, gridData[i].result*10000);
			//격자 외곽라인 색 설정
			grid.SetGridCellLineColor(gridData[i].index_y, gridData[i].index_x,  new Module.JSColor(150, 0,0,0));
		}
	
	// 설정한 옵션으로 그리드 객체 형태 생성
	grid.Create();
	
	return grid;
}

