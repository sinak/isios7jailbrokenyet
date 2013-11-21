
////////////////
// Custom Amount & Reward level
////////////////

var amountInput = document.getElementById("payform").amount;
function highlight_choice(target){
	var pricesChoices = document.getElementById("amountbtns").children;
	for(var i=0;i<pricesChoices.length;i++){
		pricesChoices[i].className = "";
	}
	target.className = "selected";
}
function show_custom(){
	document.getElementById("custom_amount_input_container").style.height = "80px";
	highlight_choice( document.getElementById("custom_amount") );
	amountInput.focus();
}
function set_amount(target){
	var amount = parseFloat(target.getAttribute("value"));
	amountInput.value = amount.toFixed(2);
	highlight_choice(target);
	onAmountChange();
}

function onAmountChange(){
	// Current amount pledged
	var currentAmount = parseFloat(amountInput.value) || 0;

	// Minimum of $1 needed
	if(currentAmount<1){
		amountInput.value = "1.00";
		currentAmount = 1;							
	}

}
amountInput.addEventListener("change",onAmountChange);

////////////////
// Swinging Click
////////////////

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
////////////////

var leaderboard = document.getElementById("leaderboard");
document.getElementById("show_all_donators").onclick = function(){
	leaderboard.removeAttribute("collapsed");
	leaderboard.setAttribute("expanded","true");
};
