//지도 리사이즈 이벤트 지정 
window.onresize = windowResize;

//윈도우 크기 자동 적용
function windowResize(){
    $('#cesiumContainer').width(window.innerWidth-405);
    $('#cesiumContainer').height(window.innerHeight);
}

function initUIEvent(){
	
	/**검색 입력칸 엔터이벤트 */
	$('#searchKeyword').on('keypress', function(e){
		if(e.keyCode == 13){
			$('.search button').click();
			$('#searchKeyword').blur();
		}
	});

	//위치 검색 페이지 이동	(동적요소에 .click()이 적용 안되는 오류가 있음)
	$(document).on('click', '.s_paging li',function(e){
		let num = this.innerText;

		if($(this).attr('disabled') == 'disabled'){
			return;
		}

		if(num == '▶'){
			num = Number($('#currnetPage').text())+1;
		}else if(num == '◀'){
			num = Number($('#currnetPage').text())-1;
		}
	
		searchPlace(num);
	});
	
	//위치 검색 결과 클릭 시 좌표 이동
	$(document).on('click', '.s_location li',function(e){
    let lon = this.dataset.pointx;
    let lat = this.dataset.pointy;
    let alt = 1000;

    viewer.camera.flyTo({      
      destination : Cesium.Cartesian3.fromDegrees(lon,lat,alt),
    }); 

	})

  this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  if(!$('#baseLayerFlag').prop("checked")){
    viewer.scene.globe.depthTestAgainstTerrain = true;
  }
}


// ##실습1. 회원가입하고 받은 토큰 입력
Cesium.Ion.defaultAccessToken = '본인 키 토큰 입력';

//지도 기본 뷰어 객체
var viewer;
var scene; 
// 2. 기본지도 호출 함수 
function callCesiumMap(){
    
    //지도 호출시 툴바 옵션 값
    var timeLineFlag = $('#timeLineFlag').prop("checked");
    var animationFlag = $('#animationFlag').prop("checked");
    var selectFlag = $('#selectFlag').prop("checked");
    var navigationFlag = $('#navigationFlag').prop("checked");
    var geocoderFlag = $('#geocoderFlag').prop("checked");
    var sceneModeFlag = $('#sceneModeFlag').prop("checked");
    var baseLayerFlag = $('#baseLayerFlag').prop("checked");
    var animationFlag2 = $('#animationFlag2').prop("checked");
    var warterFlag = $('#warterFlag').prop("checked");
    
    if(viewer != undefined) viewer.destroy();
    // 지도를 로딩할 HTML 엘리먼트 아이디 입력 
    viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain({
            requestWaterMask: warterFlag,
            //requestVertexNormals: true
        }), //세슘 기본 지도 설정
        timeline:timeLineFlag,                        //기본 툴바 옵션들
        animation:animationFlag,                      //애니메이션 툴바 표출
        selectionIndicator:selectFlag,                //선택 모드 활성화
        infoBox:selectFlag,                           //선택 객체 기본정보 표출
        navigationHelpButton:navigationFlag,          //도움말 툴바 표출 여부
        geocoder:geocoderFlag,                        //기본 검색 기능 표출 여부
        sceneModePicker :sceneModeFlag,               //지도 모드 선택여부   
        navigationInstructionsInitiallyVisible:false, //네이게이션 기본표출
        baseLayerPicker :baseLayerFlag,               //기본 레이어 선택창 표출 여부
        shouldAnimate : animationFlag2,               //객체 애니메이션 가능여부
          
    });     
    // viewer = new Cesium.Viewer("cesiumContainer", {
    //   selectionIndicator: false,
    //   infoBox: false,
    //   terrainProvider: Cesium.createWorldTerrain(),
    // }); 
    scene = viewer.scene;  

    initUIEvent();
}

//카메라 이동합수
function moveCamera(){
    var lon = $('#camLon').val(); //경도
    var lat = $('#camLat').val(); //위도
    var alt = $('#camAlt').val(); //높이
    //##실습2. 기본 지도 로딩 함수 추가. 지정 좌표로 위치 이동 소스 추가
   
}


var lClickEvent;              //이벤트 등록 여부
var lClickEventFlag = false; //이벤트 작동 여부
var eventHandler;             //이벤트 핸들러
/** 클릭지점 좌표 */
function setMouseLClickEvent(cFlag){  
  if(eventHandler == undefined){
    eventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas); //핸들러 생성
  }  
  if(lClickEvent == undefined){    
    lClickEventFlag = true; //이벤트 작동
    lClickEvent = true;     //이벤트 등록
    eventHandler.setInputAction(function(movement){   //이벤트 핸들러
      if(lClickEventFlag){ //이벤트 작동일때
        var cartesian = viewer.camera.pickEllipsoid(movement.position, scene.globe.ellipsod); //위치값 화면 좌표
        if(cartesian){
          //##실습9. 이벤트에서 화면 좌표를 실세계 좌표로 변환하는 소스 추가
          
          
        } 
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }else{
    lClickEventFlag = cFlag;
  }
}

/*위치 검색 함수*/
function searchPlace(pageNum){
  
  viewer.entities.removeAll();
  //검색할 키워드
  var keyword = $('#searchKeyword').val();

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
        , key: "767B7ADF-10BA-3D86-AB7E-02816B5B92E9"
    }


    $.ajax({
        type: 'GET'
        , url: "http://api.vworld.kr/req/search"
        , dataType: 'JSONP'
        , data: params
        , success: function (data) {
      //검색 결과 목록 배치
      $('#tab2 h2').html("<span>"+keyword+"</span> 검색결과입니다.");
      let result = '';
      for(let i = 0; i<data.response.record.current; i++){
      
        result += '<li class="title active" data-pointx='+data.response.result.items[i].point.x+' data-pointy='+data.response.result.items[i].point.y+'><ul>';
        result += '<li>'+data.response.result.items[i].title+'</li>';
        result += '<li>'+data.response.result.items[i].address.parcel+'</li>';
        result += '<li class="addr">'+data.response.result.items[i].address.road+"</li>";
        result += '<li class="phone">'+data.response.result.items[i].id+'<span> | '+data.response.result.items[i].category+'</span></li></ul></li>';

        $('.s_location').html(result);
        //검색 결과 point 배치
        setSearchPOINT(data.response.result.items[i].point.x, data.response.result.items[i].point.y, i);

      }

      //검색 결과 페이징 목록 배치
      let pageData = data.response.page;
      let pagination = ''; 
      let startPage = (parseInt((pageData.current-1)/10)*10)+1; //시작페이지
      let endPage = startPage+(pageData.size-1); //끝페이지

      if(pageData.current == '1'){
        pagination += '<li disabled>◀</li>';
      }else{
        pagination += '<li>◀</li>';
      }
      let maxPage = pageData.total < endPage ? pageData.total : endPage;
      for(let i = startPage; i<=maxPage; i++){
        if(pageData.current == i){
          pagination += "<li id='currnetPage' disabled>"+i+"</li>";
        }else{
          pagination += "<li>"+i+"</li>";
        }
      }

      if(pageData.current == pageData.total){
        pagination += '<li disabled>▶</li>';
      }else{
        pagination += '<li>▶</li>';
      }


      $('.s_paging').html(pagination);

        }
    })
}

/**검색 위치 마크 */
function setSearchPOINT(x, y, i){  
  viewer.entities.add({
    name : "searchMark"+i,
    position : Cesium.Cartesian3.fromDegrees(Number(x), Number(y)),
    billboard : {
      image : '/img/num/icon_list_'+(i+1)+'.png',
      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,      
      verticalOrigin :  Cesium.VerticalOrigin.BOTTOM
    }
  })

}

//건물 객체 변수
var osmPrimitive;
//OSM 건물 호출
function addOSMBuilding(cFlag){    
    if(osmPrimitive != undefined){
        osmPrimitive.show = cFlag; //visible만 설정
    }else{
        if(cFlag){
          //##실습3.osm 건물 추가 소스 추가
            
          
        }
    }
}

//OSM 건물 아이디로 숨기기
function removeOSMBuilding(cFlag){
    osmPrimitive.style = new Cesium.Cesium3DTileStyle({    
        show: {
          conditions : [
            ['${elementId} === 468748445', !cFlag],  
              //##실습4.osm 건물 아이디 추가 하여 삭제           
            
              
            [true, true]
          ]
        },
      color: "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ffffff')"
    });
}

//ion asset에 등록한 신규 건물 불러오기
var assetBuilding;
function addAssetBuilding(cFlag){
    if(assetBuilding != undefined){
        assetBuilding.show = cFlag;
    }else{
        if(cFlag){
            assetBuilding = viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                  //##실습5. 본인이 추가한 건물 에셋 아이디 추가
                  url: Cesium.IonResource.fromAssetId('본인 에셋 아이디 추가')
                })
            );
        }        
    }    
}

//ion asset에 등록한 트럭 불러오기
var assetTruck;
function addAssetTruck(cFlag){
    if(assetTruck != undefined){
        assetTruck.show = cFlag;
    }else{
        if(cFlag){
            assetTruck = viewer.scene.primitives.add(
                new Cesium.Cesium3DTileset({
                  //##실습6. 본인이 추가한 트럭에셋 아이디 추가
                  url: Cesium.IonResource.fromAssetId('본인 에셋 아이디 추가')
                })
            )
            positionProperty = assetTruck.position;
        }        
    }  
}

//모델 엔티티 추가
function addModelEntity(cFlag, mName, height){
    if(viewer.entities.getById(mName) != undefined){
        var thisEntity = viewer.entities.getById(mName);
            thisEntity.show=cFlag;
    }else{
        if(cFlag){
            createModel(mName, height); //모델 생성 함수 호출
        }
    }
}

//gltf 모델 추가
function createModel(mName, height) {
    let url = "/data/"+mName+".glb"; //모델 url 생성    
    const position = Cesium.Cartesian3.fromDegrees( //모델 위치
      127.098,
      37.5125827313,
      height
    );
    const heading = Cesium.Math.toRadians(135); 
    const pitch = 0;
    const roll = 0;
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    const orientation = Cesium.Transforms.headingPitchRollQuaternion( //모델 위치 지정
      position,
      hpr
    );

   //##실습7. 고정 위치에 모델 추가하는 소스 추가
    

   

   //모델 위치로 이동
  viewer.camera.flyTo({      
    destination : position,
    orientation : {
        heading : Cesium.Math.toRadians(0.0),
        pitch : Cesium.Math.toRadians(-30.0),
    }
    });   
   
}
//객체 전체 삭제
function removeAllEntity(){
    //##실습8. 전체 엔티티 삭제

    $('.modelObject input[type=checkbox]').attr('checked', false);
}


let moveCnt = 0; //애니메이션 카운트
let animationInterval; //애니메이션 인터벌
let moveTerm = 0.0002; //이동 텀
//애니메이션 시작
function playCarAnimation(){
    var initlon = 127.098;
    var initlat = 37.5125827313;
    var initalt = 100;
      //##실습14. 벌룬 애니메이션 소스 추가
   

      
}

//애니메이션 종료
function stopCarAnimation(){
    clearInterval(animationInterval);
    moveCnt = 0;
}


var rClickEvent;
var rClickEventType = false;
var featuare;
function setMouseRClickEvent(cFlag, inptId){  
  if(eventHandler == undefined){
    eventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  }  
  if(cFlag){
    $('.revtCl').prop("checked", false);
    $('#'+inptId).prop("checked", true);
    rClickEventType = inptId;
  }else{
    rClickEventType = false;
  }
  if(rClickEvent == undefined){    
    rClickEvent = eventHandler.setInputAction(function(movement){ 
        if(rClickEventType){
          const feature = scene.pick(movement.position);
          if(rClickEventType == 'RCL_DELETE'){
            
            if (!Cesium.defined(feature)) { //선택 지점에 객체 없으면 리턴
              return;
            }else{              
              featuare = feature;
              if(featuare instanceof Cesium.Cesium3DTileFeature){
                //##실습10. 선택 객체 숨기는 소스 추가(3dtiles 건물)
                
              }else{
                //##실습10. 선택 객체 숨기는 소스 추가(사용자 추가 건물)
              
              }
            }            
          }else  if(rClickEventType == 'RCL_MAKE'){ //오른쪽 클릭으로 객체 생성
            rClickMake(movement);
          }
        }        
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK); //우클릭 이벤트 등록
  }
}

//오른쪽 마우스 클릭으로 생성
function rClickMake(movement){
    let url = "/data/PSFS.glb"; //모델 url 생성    
   
    var cartesian = viewer.camera.pickEllipsoid(movement.position, scene.globe.ellipsod)
    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
    
    //##실습11. 모델 위치를 클릭지점으로 변경하는 소스 추가
    


    

    const entity = viewer.entities.add({ //entity정보 입력
      id : cartographic.longitude,
      name: url,
      position: position,
      orientation: orientation,
      model: {
        uri: url,
        minimumPixelSize: 128,
        maximumScale: 10,
      },
  });
}

//wms맵 객체
var wmsLayerMap = new Map();
//wms 호출 함수
function addWmsLayer(cFlag,layerName){    
    if(wmsLayerMap.has(layerName)){ //레이어가 존재할때 on/off
        wmsLayerMap.get(layerName).show = cFlag;
    }else{
        if(cFlag){
           //##실습12. wms 정보 추가하는 소스 추가   
            //브이월드 wms api페이지 접속하여 여러가지 wms레이어 추가해보기 5개 이상
            //https://www.vworld.kr/dev/v4dv_wmsguide2_s001.do
            //키는 그대로 사용하거나 회원가입하여 발급 필요// 42F6D36E-1A78-34B7-959F-37611794397B
            //호출 주소는 서버내 프록시로 구성되어 있어서 /proxywms로 요청             
           
            
        
      }
    }    
}

//wfs레이어 담을 맵 객체
var wfsLayerMap = new Map();
//wfs호출 함수
function addWfsLayer(cFlag, layerName){
    if(wfsLayerMap.has(layerName)){ //레이어 호출 여부 판단
        wfsLayerMap.get(layerName).show = cFlag;
    }else{  //최초 호출시
        if(cFlag){
            //##실습13. wfs정보 추가하는 소스 추가   
            //브이월드 wfs api페이지 접속하여 여러가지 wfs레이어 추가해보기 5개 이상
            //https://www.vworld.kr/dev/v4dv_wmsguide2_s001.do
            //키는 그대로 사용하거나 회원가입하여 발급 필요
            //호출 주소는 서버내 프록시로 구성되어 있어서 /proxywfs로 요청      
        }    
    }
}
//그림자 효과 추가
function addShadowEffect(cFlag){
  viewer.shadows = cFlag;    
}


//그림자 시뮬레이션 시작
function startShadowSimulation(){
  //##실습15. 그림자 시뮬레이션 소스 추가
   
}

//그림자 시뮬레이션 시작
function stopShadowSimulation(){
   //##실습16. 그림자 시뮬레이션 종료 소스 추가
    
}

//=============== 통계 및 날씨 추가는 소스가 복잡하여 실습하기 힘듬 ==============================

var sttDataSource;
//통계정보 표현
function showSttData(timeStr){
  //Now that we've defined our own DataSource, we can use it to load
  //any JSON data formatted for WebGL Globe.
   sttDataSource = new WebGLGlobeDataSource(); //통계 데이터 형식
   sttDataSource                                // json 타입 통계 데이터 로드
    .loadUrl("/data/population909500.json")
    .then(function () {
        console.log(timeStr);
        sttDataSource.seriesToDisplay = timeStr;
        viewer.dataSources.add(sttDataSource);
      }  
    );    
}
//통계 데이터 표시 연도 선택
function createSeriesSetter(timeStr){
    if(sttDataSource == undefined){ //통계 데이터 없을시 읽어오기
        showSttData(timeStr)
    }else{
        if(timeStr) sttDataSource.seriesToDisplay = timeStr; //통계데이터 시점 선택
        else viewer.dataSources.remove(sttDataSource); sttDataSource = undefined;//sttDataSource.show=false;           //통계 데이터 보임 여부
    }   
}

var clusterDataSor;
//클러스터 데이터 불러오기
function getClusterData(){
    if(clusterDataSor!=undefined){
        clusterDataSor.clustering.enabled = true;
    }else{
        const options = {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
          };
        const dataSourcePromise = viewer.dataSources.add(
            Cesium.KmlDataSource.load(
              "/data/facilities.kml",
              options
            )
          );
          dataSourcePromise.then(function (dataSource) {
            const pixelRange = 15;
            const minimumClusterSize = 3;
            const enabled = true;
            clusterDataSor = dataSource;
            dataSource.clustering.enabled = enabled;
            dataSource.clustering.pixelRange = pixelRange;
            dataSource.clustering.minimumClusterSize = minimumClusterSize;
          
            let removeListener;
          
            const pinBuilder = new Cesium.PinBuilder();
            const pin50 = pinBuilder
              .fromText("50+", Cesium.Color.RED, 48)
              .toDataURL();
            const pin40 = pinBuilder
              .fromText("40+", Cesium.Color.ORANGE, 48)
              .toDataURL();
            const pin30 = pinBuilder
              .fromText("30+", Cesium.Color.YELLOW, 48)
              .toDataURL();
            const pin20 = pinBuilder
              .fromText("20+", Cesium.Color.GREEN, 48)
              .toDataURL();
            const pin10 = pinBuilder
              .fromText("10+", Cesium.Color.BLUE, 48)
              .toDataURL();
          
            const singleDigitPins = new Array(8);
            for (let i = 0; i < singleDigitPins.length; ++i) {
              singleDigitPins[i] = pinBuilder
                .fromText(`${i + 2}`, Cesium.Color.VIOLET, 48)
                .toDataURL();
            }
          
            function customStyle() {
              if (Cesium.defined(removeListener)) {
                removeListener();
                removeListener = undefined;
              } else {
                removeListener = dataSource.clustering.clusterEvent.addEventListener(
                  function (clusteredEntities, cluster) {
                    cluster.label.show = false;
                    cluster.billboard.show = true;
                    cluster.billboard.id = cluster.label.id;
                    cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
          
                    if (clusteredEntities.length >= 50) {
                      cluster.billboard.image = pin50;
                    } else if (clusteredEntities.length >= 40) {
                      cluster.billboard.image = pin40;
                    } else if (clusteredEntities.length >= 30) {
                      cluster.billboard.image = pin30;
                    } else if (clusteredEntities.length >= 20) {
                      cluster.billboard.image = pin20;
                    } else if (clusteredEntities.length >= 10) {
                      cluster.billboard.image = pin10;
                    } else {
                      cluster.billboard.image =
                        singleDigitPins[clusteredEntities.length - 2];
                    }
                  }
                );
              }
          
              // force a re-cluster with the new styling
              const pixelRange = dataSource.clustering.pixelRange;
              dataSource.clustering.pixelRange = 0;
              dataSource.clustering.pixelRange = pixelRange;
            }
          
            // start with custom style
            customStyle();
          
            const viewModel = {
              pixelRange: 78,
              minimumClusterSize: 11,
            };
            Cesium.knockout.track(viewModel);
         
            function subscribeParameter(name) {
              Cesium.knockout
                .getObservable(viewModel, name)
                .subscribe(function (newValue) {
                  dataSource.clustering[name] = newValue;
                });
            }
          
            subscribeParameter("pixelRange");
            subscribeParameter("minimumClusterSize");
     
            const handler = new Cesium.ScreenSpaceEventHandler(
              viewer.scene.canvas
            );
            handler.setInputAction(function (movement) {
              const pickedLabel = viewer.scene.pick(movement.position);
              if (Cesium.defined(pickedLabel)) {
                const ids = pickedLabel.id;
                if (Array.isArray(ids)) {
                  for (let i = 0; i < ids.length; ++i) {
                    ids[i].billboard.color = Cesium.Color.RED;
                  }
                }
              }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
          });
    }
}

//클러스터 데이터 삭제
function removeClusterData(){
    clusterDataSor.clustering.enabled = false;
}


//날씨 효과 표현
// snow
const snowParticleSize = 12.0; //눈 크기
const snowRadius = 100000.0;   //눈 표현 범위
//눈 최소 크기 객체
const minimumSnowImageSize = new Cesium.Cartesian2(
  snowParticleSize,
  snowParticleSize
);
//눈 최대 크기 객체
const maximumSnowImageSize = new Cesium.Cartesian2(
  snowParticleSize * 2.0,
  snowParticleSize * 2.0
);
let snowGravityScratch = new Cesium.Cartesian3();
const snowUpdate = function (particle, dt) {
  snowGravityScratch = Cesium.Cartesian3.normalize(
    particle.position,
    snowGravityScratch
  );
  Cesium.Cartesian3.multiplyByScalar(
    snowGravityScratch,
    Cesium.Math.randomBetween(-30.0, -300.0),
    snowGravityScratch
  );
  particle.velocity = Cesium.Cartesian3.add(
    particle.velocity,
    snowGravityScratch,
    particle.velocity
  );
  const distance = Cesium.Cartesian3.distance(
    scene.camera.position,
    particle.position
  );
  if (distance > snowRadius) {
    particle.endColor.alpha = 0.0;
  } else {
    particle.endColor.alpha = 1.0 / (distance / snowRadius + 0.1);
  }
};

// rain
const rainParticleSize = 15.0;
const rainRadius = 100000.0;
const rainImageSize = new Cesium.Cartesian2(
  rainParticleSize,
  rainParticleSize * 2.0
);
let rainGravityScratch = new Cesium.Cartesian3();
const rainUpdate = function (particle, dt) {
  rainGravityScratch = Cesium.Cartesian3.normalize(
    particle.position,
    rainGravityScratch
  );
  rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(
    rainGravityScratch,
    -1050.0,
    rainGravityScratch
  );

  particle.position = Cesium.Cartesian3.add(
    particle.position,
    rainGravityScratch,
    particle.position
  );

  const distance = Cesium.Cartesian3.distance(
    scene.camera.position,
    particle.position
  );
  if (distance > rainRadius) {
    particle.endColor.alpha = 0.0;
  } else {
    particle.endColor.alpha =
      Cesium.Color.BLUE.alpha / (distance / rainRadius + 0.1);
  }
};

var SNOW_ENTITY; //눈 효과 엔티티
var RAIN_ENTITY; //비효과 엔티티

function playSnowEffect(){
  
  
  scene.primitives.removeAll();//기존 추가된 객체 삭제
  //##실습17. 눈 효과 추가
  

  //눈 오는것 같은 하늘 색상 등 변경
  scene.skyAtmosphere.hueShift = -0.8;
  scene.skyAtmosphere.saturationShift = -0.7;
  scene.skyAtmosphere.brightnessShift = -0.33;
  scene.fog.density = 0.001;
  scene.fog.minimumBrightness = 0.8;
}

function playRainEffect(){
 
  scene.primitives.removeAll();  //기존 객체 삭제(눈효과 등)
  //##실습18. 비 효과 추가
 

  //비 오는것 같은 하늘 색상 등 변경
  scene.skyAtmosphere.hueShift = -0.97;
  scene.skyAtmosphere.saturationShift = 0.25;
  scene.skyAtmosphere.brightnessShift = -0.4;
  scene.fog.density = 0.00025;
  scene.fog.minimumBrightness = 0.01;
}

function setSkyBright(sVal){ 
  //##실습19. 하늘 밝기
 
}

function setFogDensity(sVal){
  //##실습20. 안개강도(가시범위)
 
 }
 
 //기상 효과 제거
function removeWeatherEntity(){
  //##실습19. 기상효과 제거  
  
}

//사용자 객체 그리기 기능 추가 2022.07.13
var floatingPoint = undefined; //커서 포인트
var activeShape = undefined; //기본객체 
var activeShapePoints = []; //기본객체 좌표배열
var DrawMode = 1; //기본 객체 모드(1 = point, 2 = line, 3 = polygon, 0 = mousemove)
var drawHandler = undefined;


//기본객체 그리기
function drawInterection(num){

  DrawMode = num;
  if(drawHandler == undefined || drawHandler.isDestroyed()){
    drawHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);//이벤트 핸들러 객체 생성
  }
  if(DrawMode == 0){//마우스 이동 모드 
    drawHandler.destroy();//모든 이벤트 삭제
    terminateShape();//기본객체 생성 초기화 
    return;
  }

  drawHandler.setInputAction(function (event) {//좌클릭 이벤트 핸들러
    const mPosition = viewer.scene.pickPosition(event.position);

    if (Cesium.defined(mPosition)) {
      if (activeShapePoints.length === 0) {
        if(DrawMode == 1){
          createPoint(mPosition, true);//point 생성
          return;
          }
        floatingPoint = createPoint(mPosition, false);
        activeShapePoints.push(mPosition);//좌표 배열에 추가
        const dynamicPositions = new Cesium.CallbackProperty(function () {
          if (DrawMode === 3) {
            return new Cesium.PolygonHierarchy(activeShapePoints);
          }
          return activeShapePoints;
        }, false);
        activeShape = drawShape(dynamicPositions);//객체 생성
      }

      activeShapePoints.push(mPosition);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

drawHandler.setInputAction(function (event) {//mousemove 이벤트 핸들러
  if (Cesium.defined(floatingPoint)) {
    const newPosition = viewer.scene.pickPosition(event.endPosition);
    if (Cesium.defined(newPosition)) {
      floatingPoint.position.setValue(newPosition);//floatingPoint의 위치 갱신
      activeShapePoints.pop();
      activeShapePoints.push(newPosition);
    }
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

drawHandler.setInputAction(function (event) {//우클릭 이벤트 핸들러
  terminateShape();
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

}

function drawShape(positionData) {
  let shape;
  if (DrawMode === 2) {//line 생성
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        clampToGround: true,
        width: 3,
      },
    });
  } else if (DrawMode === 3) {//polygon 생성
    shape = viewer.entities.add({
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.WHITE.withAlpha(0.7)
        ),
      },
    });
  }
  return shape;
}

function terminateShape(){

  activeShapePoints.pop();
  drawShape(activeShapePoints);//최종 객체 생성
  viewer.entities.remove(floatingPoint);//floatingPoint 삭제
  viewer.entities.remove(activeShape);//기존 객체 삭제
  floatingPoint = undefined;
  activeShape = undefined;
  activeShapePoints = [];

}

function createPoint(cPos, tag){//point 생성
  var option;
  if(tag){//point
    option = {
      color : Cesium.Color.RED,
      pixelSize : 10,
      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
  }else{//floatingpoint
    option = {
      color : Cesium.Color.WHITE,
      pixelSize : 5,
      heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
    }
  }

  var point = viewer.entities.add({
    position : cPos,
    point : option, 
   
  });
  if(DrawMode == 1){
    terminateShape();
  }

  return point;
}

//기본객체 전체 삭제
function removeDrawEntity(){
  viewer.entities.removeAll();//엔티티 전체 삭제
  terminateShape();
  drawHandler.destroy();//이벤트 핸들러 해제
  
}

//end