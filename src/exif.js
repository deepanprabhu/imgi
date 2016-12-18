/*
	Important reference documents,

	http://lad.dsc.ufcg.edu.br/multimidia/jpegmarker.pdf
	https://www.media.mit.edu/pia/Research/deepview/exif.html
	http://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_JPEG_files
	http://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_TIFF_files
	https://github.com/exif-js/exif-js/blob/master/exif.js
*/

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

function readString(dataView, start, length) {
	str = "";
	while(length--){
		str += toChar(dataView.getUint8(start++));
	}
	return str;
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
						//	APP1 marker, precedes EXIF or XMP
						//	Info on XMP is at http://dev.exiv2.org/projects/exiv2/wiki/The_Metadata_in_JPEG_files
						//	Info on EXIF, TIFF is at 
						//	https://www.media.mit.edu/pia/Research/deepview/exif.html					
						if(! processExif(dataView, markerOffset+4)) {
							EXIF.processEXIF = false;
							console.log("Unable to process EXIF");
						}
						else{
							break;
						}
						
						if(! processXmp(dataView, markerOffset+4,sizeOfMarkerData-2)){
							EXIF.processXMP = false;
							console.log("Unable to process XMP");
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

	/*
		dataOffsetAMS - Data offset After Marker and DataSize
	*/
	function processExif(dataView, dataOffsetAMS){
		//	EXIF Header
		if(dataView.getUint16(dataOffsetAMS) != 0x4578 || dataView.getUint16(dataOffsetAMS+2) != 0x6966){
			EXIF.validEXIFHeader = false;
			return false;
		}

		console.log("Valid EXIF Header");

		//	TIFF Header
		if(dataView.getUint16(dataOffsetAMS+6) != 0x4949 && dataView.getUint16(dataOffsetAMS+6) != 0x4d4d){
			EXIF.validTIFFHeader = false;
			return false;
		}

		console.log("Valid TIFF Header");
		return true;
	}

	/*
		dataOffsetAMS - Data offset After Marker and DataSize
		dataLengthNoSize - Data size without including the size attribute
	*/
	function processXmp(dataView, dataOffsetAMS, dataLengthNoSize){
		if(readString(dataView,dataOffsetAMS,28) != 'http:\/\/ns.adobe.com\/xap\/1.0\/'){
			console.log("Invalid XMP identifier string");
			return false;
		}

		var index = dataOffsetAMS+29, i = 0;
		var xmlString = "";
		while(i < dataLengthNoSize){
			xmlString += toChar(dataView.getUint8(index))
			index++;i++;
		}
		console.log("Printing XMP - XML Data");
		console.log(xmlString);
		return true;
	}

	var fileReader = new FileReader();
	fileReader.onload = function(e) {
		handleExifFile(e.target.result);
	}
	fileReader.readAsArrayBuffer(file);
}