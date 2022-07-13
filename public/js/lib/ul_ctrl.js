$(function () {

	$(".tab_content").hide();
	$(".tab_content:first").show();

	$("ul.tabs li").click(function () {
		$("ul.tabs li").removeClass("active").css({"color": "#7d7d7d","font-weight": "300"});
		//$(this).addClass("active").css({"color": "darkred","font-weight": "bolder"});
		$(this).addClass("active").css({"color": "#1d7fff","font-weight": "400"});
		$(".tab_content").hide();
		var activeTab = $(this).attr("rel");
		$("#" + activeTab).fadeIn();
	});
	//	지도탭 컨트롤	
	$(".tab_content_2").hide();
	$(".tab_content_2:first").show();

	$("ul.tabs_2 li").click(function () {
		$("ul.tabs_2 li").removeClass("active").css({"color": "#7d7d7d","font-weight": "300"});
		//$(this).addClass("active").css({"color": "darkred","font-weight": "bolder"});
		$(this).addClass("active").css({"color": "#1d7fff","font-weight": "400"});
		$(".tab_content_2").hide();
		var activeTab = $(this).attr("rel");
		$("#" + activeTab).fadeIn();
	});

	//	지도탭 컨트롤	
	$(".tab_content_3").hide();
	$(".tab_content_3:first").show();

	$("ul.tabs_3 li").click(function () {
		$("ul.tabs_3 li").removeClass("active").css({"color": "#7d7d7d","font-weight": "300"});
		//$(this).addClass("active").css({"color": "darkred","font-weight": "bolder"});
		$(this).addClass("active").css({"color": "#1d7fff","font-weight": "400"});
		$(".tab_content_3").hide();
		var activeTab = $(this).attr("rel");
		$("#" + activeTab).fadeIn();
	});

	$(".acd_1_cts").hide();
	//content 클래스를 가진 div를 표시/숨김(토글)
	$(".acd_1").click(function()
			{
		if($(this).hasClass('acd_1_off')){
			$(this).removeClass('acd_1_off');
		}else{
			$(this).addClass('acd_1_off');
		} 
		$(this).next(".acd_1_cts").slideToggle(500);
			});


	$(".content").hide();
	//content 클래스를 가진 div를 표시/숨김(토글)
	$(".heading").click(function()
			{
		if($(this).hasClass('heading_off')){
			$(this).removeClass('heading_off');
		}else{
			$(this).addClass('heading_off');
		} 
		$(this).next(".content").slideToggle(500);
			});

	$( "#dialog" ).dialog({

		autoOpen: false,
		width: 400,
		position:[425,120], 
	});



	$( "#opener" ).on( "click", function() {

		$( "#dialog" ).dialog( "open" );

	});
	
	$('#right_tab_btn > li').click(function(){ 					//탭 버튼에 이벤트 추가
		$('#right_tab_btn > li').removeClass('active'); 		// 탭 버튼 active제거
		$(this).addClass('active'); 							// 선택 탭 버튼에 active추가
		var menuId = "d_"+($(this).attr('id').split('_'))[1];	//탭 버튼에서 div아이디 생성
		//$('.rightTab').removeClass('hide');						//메뉴 div hide 제거(중복으로 hide붙는거 방지)
		$('.rightTab').addClass('hide');						//메누 div 모두 hide
		$('#'+menuId).removeClass('hide');						//선택 메뉴 에만 hide 제거
	});

});


