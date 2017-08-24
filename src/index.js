module.exports = ( host, usr, pwd, protocol = 'http' ) => {
	const eventEmitter = new ( require( 'events' ) ).EventEmitter();
	const request = require( './request/request.js' );
	const urlTemplating = require( '@jrapp/url-templating' );
	const functions = require( './configuration.json' )
		.reduce( ( functions, { name, template, timeout = 1000, retries = 0 } ) => {
			const intermediate = urlTemplating( template ).expandPartial( { protocol, host, usr, pwd } ).replace( /%40/g, '@' );
			const urlTemplate = urlTemplating( intermediate );
			return Object.assign( functions, { [ name ]: ( data = {} ) => ( eventEmitter.emit( 'invoke', template ),
				request().url( urlTemplate.expand( data ) ).invoked( response => eventEmitter.emit( 'invoked', response ) )
					.timeout( timeout ).retries( retries ).get().invoke() ) } );
		}, {} );
	const pub = {
		areaChanges: require( './functions/areaChanges.js' )( functions, eventEmitter ),
		vcs: require( './functions/vcs.js' )( functions, eventEmitter ),
		vc: require( './functions/vc.js' )( functions, eventEmitter ),
		on: new Proxy( {}, { get: ( target, name ) => ( listener ) => ( eventEmitter.on( name, listener ), pub ) } ),
		close: () => Promise.all( [
			pub.vcs.clear(),
			pub.vc.clear()
		] )
	};
	return pub;
};
