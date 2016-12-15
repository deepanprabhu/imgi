import { before, after, describe, it } from 'mocha'
import { expect, assert, should } from 'chai'
import {senda} from '../src/exif.js';

describe('karma test with Chai', function() {
  it('should expose the Chai assert method', function() {
  	assert.equal("Senda", senda());
  })
})