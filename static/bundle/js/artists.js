var modal_overlay = document.getElementById("modal_overlay");
var modal_iframe = document.getElementById("modal_iframe");

function showModal(url){

	// Show it up front
	modal_overlay.style.display = "block";
	modal_iframe.src = url;

	var t = 0;
	var animation = setInterval(function(){
		t += 1/10;
		modal_overlay.style.opacity = (t); // Fade in
		modal_iframe.style.top = ( -260 - (1-t)*1000 ); // Slide from top
		if(t>=1){
			clearInterval(animation);

			// Show it right there
			modal_iframe.style.opacity = 1;
			modal_iframe.style.top = -260;

		}
	},15);
}
function hideModal(){

	var t = 0;
	var animation = setInterval(function(){
		t += 1/10;
		modal_overlay.style.opacity = (1-t); // Fade out
		modal_iframe.style.top = ( -260 - t*1000 ); // Slide to top
		if(t>=1){
			clearInterval(animation);

			// Get rid of it
			modal_iframe.src = "";
			modal_overlay.style.display = "none";

		}
	},15);
}

function openInNewTab(url){
	window.open(url,'_blank');
}