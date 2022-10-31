//기본객체 그리기
function drawInterection(num){
    DrawMode = num;
  
    if(DrawMode == 0){//마우스 이동 모드 
      terminateShape();
      drawHandler.destroy();//이벤트 핸들러 해제
      return;
    }
    drawHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  
    drawHandler.setInputAction(function(event){//좌클릭 이벤트 핸들러
      // var mPosition = viewer.scene.pickPosition(event.position);
      var mPosition = viewer.camera.pickEllipsoid(event.position, scene.globe.ellipsod);
      if(Cesium.defined(mPosition)){//--클릭해서 좌표따왔으면 
  
        if(activeShapePoints.length == 0){ //생성된 포인트가 없을때        
          activeShapePoints.push(mPosition);
          var drawPositions = new Cesium.CallbackProperty(function(){//--콜백함수에 의해 값이 느리게 평가된다?? 라인과 폴리곤 생성할 때 사용
            return activeShapePoints;
          }, false);
  
          createPoint(mPosition);//포인트 생성
  
          if(DrawMode == 1){//--포인트 모드일때
            terminateShape();//생성모드 초기화
          }else{
            floatingPoint = createPoint(mPosition);//포인트 모드가 아닐땐 floatingpoint 생성
          }
  
          if(DrawMode == 2){ //라인
            activeShape = drawLinestring(drawPositions);
          }else if(DrawMode == 3){ //폴리곤
            activeShape = drawLinestring(drawPositions);
          }    
        }else{//--생성된 좌표가 이미 있을 때
          if(DrawMode == 3 && activeShapePoints.length > 3){
            activeShapePoints.pop();
          }
          activeShapePoints.push(mPosition);//--좌표배열에 새 좌표 추가
          createPoint(mPosition);//--클릭한 지점에 포인트 생성(이쁘니까)
        }      
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  
    drawHandler.setInputAction(function(event){
      if(Cesium.defined(floatingPoint)){
        // var newPosition = viewer.scene.pickPosition(event.endPosition);
        var newPosition = viewer.camera.pickEllipsoid(event.endPosition, scene.globe.ellipsod)
        if(Cesium.defined(newPosition)){
          floatingPoint.position.setValue(newPosition);//플로팅포인트 위치 갱신
          if(activeShapePoints.length >1){//클릭좌표가 1개 이상 있을 경우, 라인생성할 때 첫 좌표가 안 찍혀서 
            activeShapePoints.pop();//이전 좌표 하나 꺼냄(이전 플로팅 좌표)
          }
          if(DrawMode ==3 && activeShapePoints.length > 2){//폴리곤 모드이고 클릭좌표가 2개 이상 존재할 경우
            // activeShapePoints.pop();
            activeShapePoints.push(newPosition);
            activeShapePoints.push(activeShapePoints[0]);
          }else{
            activeShapePoints.push(newPosition);
  
          }
        }
  
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  
    drawHandler.setInputAction(function(event){
      terminateShape();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);  
  }
  
  function terminateShape(){
    activeShapePoints.pop();//--생성된 좌표들 중 하나 뺌 
    viewer.entities.remove(activeShape);
    //--LINE이나 POLYGON일때 기존 엔티티 지움. drawPosition때문에. 
    //--기존의 line이나 polygon은 drawPosition으로 만들어서 이전걸 새로 리셋했든 말든 activeshpePoints대로 엔티티를 만든다. 
    //그래서 라인 완성하고 다시 포인트를 만들려고 해도 새로 생성된 activeshapepoints대로 라인을 생성한다. 
  
    //drawShape(activeShapePoints);
    if(DrawMode == 2){ //라인
      activeShape = drawLinestring(activeShapePoints);
    }if(DrawMode == 3){ //폴리곤
      activeShape = drawPolygon(activeShapePoints);
    }       
    viewer.entities.remove(floatingPoint);
    floatingPoint = undefined;//플로팅 포인트 초기화
    activeShape = undefined;//객체 초기화
    activeShapePoints = [];//좌표배열 초기화
  }
  
  function createPoint(cPos){
    var point = viewer.entities.add({
      position : cPos,
      point : {
        color : Cesium.Color.RED,
        pixelSize : 10,
        heightReference : Cesium.HeightReference.CLAMP_TO_GROUND
      }, 
      lable : {
        disableDepthTestDistance : Number.POSITIVE_INFINITY,
      }
    });
    return point;
  }
  
  function drawLinestring(cPos){
    var lineString = viewer.entities.add({
      polyline : {
        positions : cPos,
        clampToGround : true,
        width : 3
      }
    });  
    return lineString;
  }
  
  function drawPolygon(cPos){
    var polygon = viewer.entities.add({
      polygon : {
        hierarchy : cPos,
        material : new Cesium.ColorMaterialProperty(Cesium.Color.AQUA.withAlpha(0.015))      
      }
    });  
    return polygon;
  }
  
  function removeDrawEntity(){
    viewer.entities.removeAll();
  }
  