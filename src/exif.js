var exports = module.exports = {};

exports.validateFile = function(file) {
	var reader = new FileReader();
    
    reader.onloadend = function(evt){
    	if(evt.target.readyState == FileReader.DONE){
	    	var u = new Uint8Array(evt.target.result);
	    	var a = new Array(u.length);
	    	var i = u.length;
	    	while(i--)
	    		a[i] = (u[i] < 16 ? '0' : '') + u[i].toString(16);
	    	u = null;
	    	console.log(a);
    	}
	};

	var blob = file.slice(0,5);
	reader.readAsArrayBuffer(blob);
};

exports.validateBlob = function(blob) {
	var reader = new FileReader();

    reader.onloadend = function(evt){
    	console.log("File.. 2 ")
    	if(evt.target.readyState == FileReader.DONE){
	    	var u = new Uint8Array(evt.target.result);
	    	var a = new Array(u.length);
	    	var i = u.length;
	    	while(i--)
	    		a[i] = (u[i] < 16 ? '0' : '') + u[i].toString(16);
	    	u = null;
	    	console.log(a);
    	}
	};
	reader.readAsArrayBuffer(blob);
}