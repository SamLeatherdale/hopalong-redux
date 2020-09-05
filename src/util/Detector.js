/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

export default class Detector {
	constructor() {
		this.canvas = !! window.CanvasRenderingContext2D;
		this.webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();
		this.workers = !! window.Worker;
		this.fileapi = window.File && window.FileReader && window.FileList && window.Blob;
	}

	getWebGLErrorMessage() {

		var domElement = document.createElement( 'div' );

		domElement.style.fontFamily = 'monospace';
		domElement.style.fontSize = '13px';
		domElement.style.textAlign = 'center';
		domElement.style.background = '#eee';
		domElement.style.color = '#000';
		domElement.style.padding = '1em';
		domElement.style.width = '475px';
		domElement.style.margin = '5em auto 0';

		if ( ! this.webgl ) {

			domElement.innerHTML = window.WebGLRenderingContext ? [
				'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br />',
				'Find out how to get it <a href="http://get.webgl.org/">here</a>.'
			].join( '\n' ) : [
				'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br/>',
				'Find out how to get it <a href="http://get.webgl.org/">here</a>.'
			].join( '\n' );

		}

		return domElement;

	}

	addGetWebGLMessage( parameters ) {

		var parent, id, domElement;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		domElement = Detector.getWebGLErrorMessage();
		domElement.id = id;

		parent.appendChild( domElement );
	}

};
