module.exports = class Response {
	constructor( { statusCode, headers, chunks, time } ) {
		this.context = { statusCode, headers, chunks, time };
	}
	get statusCode() {
		return this.context.statusCode;
	}
	get headers() {
		return this.context.headers;
	}
	get time() {
		return this.context.time;
	}
	get text() {
		if( this.context.text === undefined )
			this.context.text = this.context.chunks.join( '' );
		return this.context.text;
	}
	get buffer() {
		if( this.context.buffer === undefined )
			this.context.buffer = Buffer.concat( this.context.chunks );
		return this.context.buffer;
	}
	get json() {
		if( this.context.json === undefined )
			this.context.json = JSON.parse( this.text );
		return this.context.json;
	}
};
