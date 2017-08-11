module.exports = ( host, usr, pwd, protocol = 'http' ) => {
	const request = require( './request/request.js' );
	const urlTemplating = require( '@jrapp/url-templating' );
	const functions = require( './configuration.json' )
		.reduce( ( functions, { name, template, timeout = 1000, retries = 0 } ) => {
			const intermediate = urlTemplating( template ).expandPartial( { protocol, host, usr, pwd } ).replace( /%40/g, '@' );
			const urlTemplate = urlTemplating( intermediate );
			return Object.assign( functions, { [ name ]: ( data = {} ) => request()
		 		.url( urlTemplate.expand( data ) )
			 	.timeout( timeout )
				.retries( retries )
			 	.get()
			 	.invoke() } );
		}, {} );
	return {
		areaChanges: require( './functions/areaChanges.js' )( functions )
	};
};
