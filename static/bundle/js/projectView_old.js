
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


//////////////
// Countdown

(function(){

	var _second = 1000;
	var _minute = _second * 60;
	var _hour = _minute * 60;
	var _day = _hour * 24;
	function toDoubleDigits(num){
		var s = "00"+num;
		return s.substr(s.length-2);
	}

	// Ends at the END of the day of July 15, UTC
	//var end = new Date( window.DEADLINE ? window.DEADLINE : '07/16/2013' );
	var end = new Date('07/16/2013');

	var countdown = document.getElementById("countdown");
	function tick(){

		//var now = new Date();
		var now = (new Date().getTime());
	    var distance = end-now;
	    if(distance<0) distance=0;

	    var days = Math.floor(distance / _day);
	    var hours = Math.floor((distance % _day) / _hour);
	    var minutes = Math.floor((distance % _hour) / _minute);
	    var seconds = Math.floor((distance % _minute) / _second);

		countdown.innerHTML = days+" days "+hours+" hours "+minutes+" min "+seconds+" secs left";

	}
	setInterval(tick,1000);
	tick();

})();

////////////////
// Leaderboard

var leaderboard = document.getElementById("leaderboard");
document.getElementById("show_all_donators").onclick = function(){
	leaderboard.removeAttribute("collapsed");
	leaderboard.setAttribute("expanded","true");
};

////////////////
// Custom Amount & Reward level

var amountInput = document.getElementById("payment_form").amount;
function highlight_choice(target){
	var pricesChoices = document.getElementById("prices_list").children;
	for(var i=0;i<pricesChoices.length;i++){
		pricesChoices[i].removeAttribute("selected");
	}
	target.setAttribute("selected","true");
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

	// Highlight rewards you get
	var rewardLevels = document.getElementById("reward_levels").children;
	for(var i=0;i<rewardLevels.length;i++){
		var level = parseFloat(rewardLevels[i].getAttribute("value"));
		if(currentAmount<level){
			rewardLevels[i].setAttribute("locked","true");
		}else{
			rewardLevels[i].removeAttribute("locked");
		}
	}

	// Update 
	document.getElementById("reward_amount_label").innerHTML = currentAmount.toFixed(2);

	// Update Split, too
	onSplitChange();

}
amountInput.addEventListener("change",onAmountChange);





////////////////
// Custom Split

function split_highlight_choice(target){
	var splitChoices = document.getElementById("split_list").children;
	for(var i=0;i<splitChoices.length;i++){
		splitChoices[i].removeAttribute("selected");
	}
	target.setAttribute("selected","true");
}
function show_custom_split(){
	document.getElementById("custom_split_input_container").style.height = "370px";
	split_highlight_choice( document.getElementById("custom_split") );
}
function set_split(target){
	split_highlight_choice(target);

	var mode = target.getAttribute("mode");
	switch(mode){
		case "default":
			forceSplit([ 0.15,0.15,0.15,0.15,0.15,0.15, 0.05,0.05 ]);
			break;
		case "artists":
			forceSplit([ 0.17,0.17,0.17,0.17,0.17,0.17, 0.00,0.00 ]);
			break;
		case "charity":
			forceSplit([ 0.00,0.00,0.00,0.00,0.00,0.00, 0.50,0.50 ]);
			break;
	}

}

var split_names = ["HalcyonicFalconX", "Jimp", "NutcaseNightmare", "Stratkat", "Kenney", "MindChamber", "Creative Commons", "EFF"];
function forceSplit(splits){
	for(var i=0;i<split_names.length;i++){
		var name = split_names[i];
		var input = document.getElementById("split_input_"+name);
		input.value = splits[i];
	}
	onSplitChange();
}
function getTotal(){
	var total=0;
	for(var i=0;i<split_names.length;i++){
		var name = split_names[i];
		var input = document.getElementById("split_input_"+name);
		total += parseFloat(input.value);
	}
	return total;
}
function onSplitChange(target){
	
	// Current amount pledged
	var currentAmount = parseFloat(amountInput.value) || 0;

	// Constraint if moving a target
	if(target){

		// Add them up.
		var total = getTotal();
		var target_value = parseFloat(target.value);
		var leftover = total - target_value;
		var leftover_ideal = 1 - target_value;

		// If the leftover is > 0, scale all others proportionally.
		if(leftover>0){

			var scale = leftover_ideal/leftover;
			for(var i=0;i<split_names.length;i++){
				var name = split_names[i];
				var input = document.getElementById("split_input_"+name);
				if(input==target) continue;
				input.value = parseFloat(input.value) * scale;
			}

		// Otherwise, spread the difference between all of them.
		}else{

			var num_leftover = split_names.length-1;
			var spread = leftover_ideal/num_leftover;
			for(var i=0;i<split_names.length;i++){
				var name = split_names[i];
				var input = document.getElementById("split_input_"+name);
				if(input==target) continue;
				input.value = spread;
			}

		}

	}

	// Update labels
	for(var i=0;i<split_names.length;i++){
		
		var name = split_names[i];
		var input = document.getElementById("split_input_"+name);
		var label = document.getElementById("split_label_"+name);

		label.innerHTML = "$"+(input.value*currentAmount).toFixed(2);

	}

}
function getSplitAsList(){
	var list = "";
	for(var i=0;i<split_names.length;i++){
		
		var name = split_names[i];
		var input = document.getElementById("split_input_"+name);

		if(i>0) list+=",";
		list += input.value.toString();

	}
	return list;
}