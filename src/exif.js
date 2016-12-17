var EXIF = {};


function validateSOIMarker(uint8array){
	return false;
}

function concatHexArrayAsString(array){
	var theString = "";
	if( array instanceof Array ) {
		for(var i=0;i<array.length;i++) {
			theString += array[i];
		}
	}	
	return theString;
}

function convertToHexArray(array){
	var a = new Array(array.length);
	var u = new Uint8Array(array);;
	var i = u.length;
	while(i--)
		a[i] = (u[i] < 16 ? '0' : '') + u[i].toString(16);
	return a;
}

function applyChunk(blob, applyFunction){
	var reader = new FileReader();
    reader.onloadend = function(evt){
		if(evt.target.readyState == FileReader.DONE){
			applyFunction(evt.target.result);
		}
	};
	reader.readAsArrayBuffer(blob);
}

EXIF.isFileValid = false;

EXIF.validate = function(file,fileSize){

	console.log(file);
	//	Verify SOI Marker, FFd8
	var blob = file.slice(0,2);
	applyChunk(blob, function(e){
		if(concatHexArrayAsString(convertToHexArray(e)) != 'ffd8')
			EXIF.isFileValid = false;
	});

	//	Verify EOI Marker, FFd9
	blob = file.slice(fileSize - 2);
	applyChunk(blob, function(e){
		if(concatHexArrayAsString(convertToHexArray(e)) != 'ffd9'){
			EXIF.isFileValid = false;
		}
	});

	EXIF.isFileValid = true;
	return EXIF.isFileValid;
}