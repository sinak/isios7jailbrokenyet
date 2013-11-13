
/////////
// Parallax Background 

(function(){
	var background = document.getElementById("splash_bg");
	window.onscroll = function(){
		var offset = window.scrollY*0.3;
		if(offset<0) offset=0;
		background.style.top = -offset;
	};
})();

/////////
// Swinging Click

(function(exports){

	function getPos(el) {
	    for (var lx=0, ly=0;
	         el != null;
	         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	    return {x:lx, y:ly};
	}
	
	var _locked = false;
	exports.swingTo = function(anchor){

		// One swing at a time
		if(_locked) return;
		_locked=true;

		// Find scroll Y pos
		var anchorDOM = document.querySelector(anchor);
		var anchorPos = getPos(anchorDOM);
		var currY = window.scrollY;
		var gotoY = anchorPos.y;

		// Ease into it
		var t = 0;
		var interval = setInterval(function(){

			var y = currY + ( (1-Math.cos(t))/2 )*(gotoY-currY);
			window.scrollTo(0,y);

			t += Math.PI/20;
			if(t>Math.PI){
				clearInterval(interval);
				_locked = false;
			}

		},30);
		
	};

})(window);

////////////////
// Leaderboard

var leaderboard = document.getElementById("leaderboard");
document.getElementById("show_all_donators").onclick = function(){
	leaderboard.removeAttribute("collapsed");
	leaderboard.setAttribute("expanded","true");
};
