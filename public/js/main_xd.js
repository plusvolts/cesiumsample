//지도 리사이즈 이벤트 지정 
window.onresize = windowResize;

//윈도우 크기 자동 적용
function windowResize(){
    $('#cesiumContainer').width(window.innerWidth-405);
    $('#cesiumContainer').height(window.innerHeight);
}

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
 var Module = {
    TOTAL_MEMORY: 256*1024*1024,
    postRun: [initXDMap],
    canvas: (function() {

      // Canvas 엘리먼트 생성
      var canvas = document.createElement('canvas');

      // Canvas id, Width, height 설정
      canvas.id = "canvas";
      canvas.width="calc(100%)";
      canvas.height="100%";

      // Canvas 스타일 설정
      canvas.style.position = "fixed";
      canvas.style.top = "0px";
      canvas.style.left = "0px";

      canvas.addEventListener("contextmenu", function(e){
        e.preventDefault();
      });

      // 생성한 Canvas 엘리먼트를 body에 추가합니다.
      document.body.appendChild(canvas);

      return canvas;
    })()
  };

}

function initXDMap(){
  Module.Start(window.innerWidth, window.innerHeight);
}

//카메라 이동합수
function moveCamera(){
    var lon = $('#camLon').val(); //경도
    var lat = $('#camLat').val(); //위도
    var alt = $('#camAlt').val(); //높이
    //##실습2. 기본 지도 로딩 함수 추가. 지정 좌표로 위치 이동 소스 추가
   
    //##실습2. 기본 지도 로딩 함수 추가. 지정 좌표로 위치 이동 소스 추가
}
