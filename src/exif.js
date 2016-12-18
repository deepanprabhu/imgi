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

function toHexString(number){
	return number.toString(16);
}

function toChar(number) {
	return String.fromCharCode(number);
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

	//	Verify SOI Marker, FFd8
	var blob = file.slice(0,2);
	applyChunk(blob, function(e){
		if(concatHexArrayAsString(convertToHexArray(e)) != 'ffd8')
			EXIF.isFileValid = false;
	});

	//	Verify EOI Marker, FFd9
	blob = file.slice(fileSize - 2);
	applyChunk(blob, function(e){
		if(concatHexArrayAsString(convertToHexArray(e)) != 'ffd8'){
			EXIF.isFileValid = false;
		}
	});

	EXIF.isFileValid = true;
	return EXIF.isFileValid;
}

//	DataView, from exif-js. Excellent file handling

EXIF.validateEXIF = function(file, fileSize){
	function handleExifFile(blob){
		console.log("File Length : " + blob.byteLength);
		var dataView = new DataView(blob);

		if(! isValidSOI(dataView, 0))
			EXIF.validSOI = false;

		if(! isValidEOI(dataView, fileSize-2))
			EXIF.validEOI = false;

		if(! readMarkers(dataView, 2))
			EXIF.validMarkers = false;
	}

	function isValidSOI(dataView, offset) {
		if(dataView.getUint16(offset) != 0xFFD8){
			console.log("Start of Image marker not found !!");
			return false;
		}		
		return true;
	}

	function isValidEOI(dataView, offset) {
		if(dataView.getUint16(offset) != 0xFFD9){
			console.log("End of Image marker not found !!");
			return false;
		}		
		return true;
	}

	function readMarkers(dataView, offSet){
		var offset = offSet;
		var markerOffset = 0;
		do
		{
			markerInit = dataView.getUint8(offset);
			if(markerInit == 0xFF){
				markerValueStr = dataView.getUint16(offset).toString(16);
				markerValue = dataView.getUint16(offset);
				markerOffset = offset;
				console.log("Marker : " + markerValueStr);
				offset += 2;

				sizeOfMarkerData = dataView.getUint16(offset);
				console.log("Marker Data Size : " + sizeOfMarkerData);

				offset += 2;
				var i = 0;
				var data = "";

				//	Note down the data offset for processing
				dataOffset = offset;
				while(i < sizeOfMarkerData-2){
					data += toChar(dataView.getUint8(offset));
					offset++;
					i++;
				}
				console.log(data);

				//	Process Markers
				switch(markerValue){
					case 0xFFE1:
						if(! processExif(dataView, markerOffset+4)) {
							EXIF.processEXIF = false;
							console.log("Unable to process EXIF");
							//return false;
						}
						break;
				}
			}
		}
		while(markerInit == 0xFF);

		//	Make sure that the last marker is 0xFFDA, SOS - Start of Stream
		if(markerValue != 0xffda){
			EXIF.validSOS = false;
			console.log("Invalid SOS");
			return false;
		}
		return true;
	}

	function processExif(dataView, dataOffset){
		//	EXIF Header

		if(dataView.getUint16(dataOffset) != 0x4578 || dataView.getUint16(dataOffset+2) != 0x6966){
			EXIF.validEXIFHeader = false;
			return false;
		}

		console.log("Valid EXIF Header");

		//	TIFF Header
		if(dataView.getUint16(dataOffset+6) != 0x4949 && dataView.getUint16(dataOffset+6) != 0x4d4d){
			EXIF.validTIFFHeader = false;
			return false;
		}

		console.log("Valid TIFF Header");
		return true;
	}

	var fileReader = new FileReader();
	fileReader.onload = function(e) {
		handleExifFile(e.target.result);
	}
	fileReader.readAsArrayBuffer(file);
}