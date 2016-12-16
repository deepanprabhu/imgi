import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import {validateBlob} from '../src/exif.js';

describe('Basic File Validation Test', function() {
	beforeEach(function(){
		var fixture = 
		'<div id="fixture">'+
		'<canvas id="slate"></canvas>'+
		'</div>';

		document.body.insertAdjacentHTML('afterbegin',fixture);
	});

	afterEach(function(){
		document.body.removeChild(document.getElementById('fixture'));
	});

	it('Validate EXIF file', function() {
		var canvas = document.createElement('canvas');
		var context = canvas.getContext("2d");
		var inputImage = new Image();
		inputImage.src = 'base/test/test.jpg';
		context.drawImage(inputImage,1500,1200);


		canvas.toBlob(function(blob) {
			// FileReader will be happy with just a blob
			// But if you really want a file you need to construct it also
			//var file = new File([blob], 'test/test.jpg', {type: blob.type})
			validateBlob(blob);
		}, 'image/jpeg');

		document.body.appendChild(canvas);
	})
});