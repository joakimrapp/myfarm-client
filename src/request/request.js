const http = require( 'http' );
const https = require( 'https' );
const Buffer = require( 'buffer' );
const Response = require( './Response.js' );

class Request extends Promise {
	url( value ) { return this.then( configuration => Object.assign( configuration, { url: value } ) ); }
	timeout( value ) { return this.then( configuration => Object.assign( configuration, { timeout: value } ) ); }
	retries( value ) { return this.then( configuration => Object.assign( configuration, { retries: value } ) ); }
	header( header, value ) {
		return this.then( configuration => {
			if( !configuration.headers )
				configuration.headers = {};
			configuration.headers[ header ] = value;
			return configuration;
		} );
	}
	build() {
		return this.then( configuration => {
			const { url, timeout = 1000, payload, method = 'get', headers = {} } = configuration;
			const { protocol, hostname, path, port = 80 } = require( 'url' ).parse( url );
			if( payload !== undefined )
				headers[ 'Content-Length' ] = Buffer.byteLength( payload );
			return Object.assign( configuration, {
				options: {
					hostname,
					port,
					path,
					method: method.toUpperCase(),
					headers,
					timeout
				},
				adapter: protocol === 'https:' ? https : http
			} );
		} );
	}
	get() {
		return this.then( configuration => Object.assign( configuration, {
			method: 'get'
		} ) ).build();
	}
	post( value ) {
		return this.then( configuration => Object.assign( configuration, {
			method: 'post',
			payload: value
		} ) ).build();
	}
	static invoke( { options, payload, retries = 0 }, retry = 0 ) {
		return new Promise( ( resolve, reject ) => {
			const timestamp = Date.now();
			const req = http.request( options, res => {
				const { statusCode, headers } = res;
				const chunks = [];
			  res.on( 'data', ( chunk ) => chunks.push( chunk ) );
			  res.on( 'end', () =>
					( ( ( statusCode >= 200 ) || ( statusCode < 300 ) ) ? resolve : reject )
						( new Response( { statusCode, headers, chunks, time: Date.now() - timestamp } ) ) );
			} );
			let timeout = false;
			req.on( 'timeout', () => ( ( timeout = true ), req.abort() ) );
			req.on( 'error', ( err ) => ( ( timeout ) && ( retry < retries ) ) ?
				resolve( Request.invoke( { options, payload, retries }, retry + 1 ) ) : reject( { timeout, err } ) );
			if( payload )
				req.write( payload );
			req.end();
		} );
	}
	invoke( ...args ) {
		const pending = this.then( configuration => Request.invoke( configuration ) );
		return args.length ? pending.then( ...args ) : pending;
	}
}
module.exports = () => Request.resolve( {} );
