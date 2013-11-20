
////////////////
// Custom Amount & Reward level

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

