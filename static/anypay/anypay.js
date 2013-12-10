
// Stop the form, by the way.
var form = document.getElementById("payform");
var submit_button = form.submit;
form.onsubmit = function(event){
	
	if(event.preventDefault) {event.preventDefault();}
	else {event.returnValue = false;} // cancels the form submission
};

// Perform Payment!
function pay(method){

	// Form Validation
	submit_button.click(); // Prompt Validation.
	if(!form.checkValidity()){
		return;
	}

	// Collect Data
	var formData = {
		
		// Item ID
		item_id: 0, // Hard-coded
		
		// How much you want to pay, in USD Dollars & Cents
		amount: parseFloat(form.amount.value),

		// Custom Vars: Name & Email
		custom: {
			name: form.custom_name.value,
			email: form.custom_email.value,
			newsletter: form.custom_newsletter.checked
		}

	};

	// If less than $5 reject.
	if(formData.amount<5){
		alert("A minimum amount of $5 is needed to cover transaction fees. Thanks!");
		return;
	}

	// Buy through chosen payment data
	switch(method){
		
		case "stripe":

			var token = function(res){
				formData.stripeToken = res.id;
				sendForm("/pay/stripe",formData);
			};

			StripeCheckout.open({
				key:         STRIPE_PUBLIC_KEY,
				address:     false,
				amount:      formData.amount*100, // Convert to cents, coz that's what Stripe wants.
				currency:    'usd',
				name:        'Device Freedom Prize',
				description: 'Contribution',
				panelLabel:  'Checkout',
				email: formData.custom.email,
				token:       token
			});

			break;

		case "coinbase":
			sendForm("/pay/coinbase",formData);
			break;


		case "paypal":

			// METADATA
			formData.custom = JSON.stringify(formData);

			// Environment Variables
			if(!PAYPAL_ACTION || !PAYPAL_RECEIVER_EMAIL){
				alert("Paypal environment variables not set");
				return;
			}
			formData.business = PAYPAL_RECEIVER_EMAIL

			// Paypal Vars
			formData.item_name = "Device Freedom Prize Contribution";
			formData.cmd = "_xclick";
			formData.lc = "USD";
			formData.currency_code = "USD";
			formData.button_subtype = "services";
			formData.no_note = "1";
			formData.no_shipping = "1";
			formData.bn = "PP-BuyNowBF:btn_buynowCC_LG.gif:NonHosted";

			// Override Paypal Callback & Return
			var domain = "https://isios7jailbrokenyet.com"; //window.location.protocol+"//"+window.location.host;
			formData.address_override = "1";
			formData.notify_url = domain+"/pay/paypal/ipn";

			sendForm(PAYPAL_ACTION,formData);

			break;
	}
}

// Creates a modal frame overlay
function openModal(url,params){

	// Create iframe
	var iframe = document.createElement("iframe");
	iframe.setAttribute("style","position:fixed;top:0;left:0;width:100%;height:100%;border:0");
	iframe.style.display = "none";
	document.body.appendChild(iframe);

	// Then postMessage to it the data
	iframe.onload = function(){
		iframe.contentWindow.postMessage(params,"*");
		iframe.style.display = "block";
	};
	iframe.src = url;

	// Wait for the CLOSE message to close it
	window.addEventListener("message",function listenForClose(event){
		if(event.data=="close"){
			iframe.parentNode.removeChild(iframe);
			window.removeEventListener("message",listenForClose);
		}
	},false);

}

// Redirects & sends form data
function sendForm(url,params){

	// Flatten objects into POST vars
	var flatten = function( fromObject, toObject, prefix) {
	    for(var prop in fromObject) {
	        
	    	var value = fromObject[prop];

	    	var label = prefix
	        		? prefix + "[" + prop + "]"
	        		: prop;

	    	if(typeof value == "object"){
			flatten(value, toObject, label);
		}else{
			toObject[label] = value;
		}

	    }
	    return toObject;
	};
	params = flatten(params,{});


	// Create, populate, and submit form
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", url);
	for(var key in params) {
		if(params.hasOwnProperty(key)) {
			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", key);
			hiddenField.setAttribute("value",params[key]);
			form.appendChild(hiddenField);
		}
	}
	document.body.appendChild(form);
	form.submit();

}
