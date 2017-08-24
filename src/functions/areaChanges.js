module.exports = ( functions, eventEmitter ) => {
	class Changes {
		constructor() {
			this.promise = functions.changes().then( ( { text, time } ) => {
				const lines = text.split( '\n' ).filter( line => line.length > 10 );
				const token = lines.length && lines[ 0 ].length < 30 ? lines.shift() : undefined;
				const invalid = [];
				const areaChanges = lines
					.map( line => line.split( '/' ) )
					.filter( parts => parts.length === 12 ? true : ( invalid.push( parts.join( '/' ) ), false ) )
					.map( parts => ( {
						myFarmTimestamp: parseFloat( parts[ 0 ], 10 ),
						vcGuid: parts[ 1 ],
						animalGuid: parts[ 2 ],
						animalNr: parts[ 3 ],
						lactationCycle: parseInt( parts[ 4 ], 10 ),
						lactationDay: parseInt( parts[ 5 ], 10 ),
						action: parseInt( parts[ 6 ], 10 ),
						trafficAreaGuid: parts[ 7 ],
						inAreaSince: parseFloat( parts[ 8 ], 10 ) * 1000,
						previousTrafficAreaGuid: parts[ 9 ],
						previousInAreaSince: parseFloat( parts[ 10 ], 10 ) * 1000,
						vcTimestamp: parseFloat( parts[ 11 ] )
					} ) );
				return { lines, token, invalid, areaChanges, count: areaChanges.length, time };
			} );
		}
		lines( ...args ) {
			this.promise = this.promise
				.then( context => ( context.lines && context.lines.length ) ? Promise.resolve( context.lines )
					.then( ...args )
					.then( () => context ) : context );
			return this;
		}
		areaChange( ...args ) {
			this.promise = this.promise
				.then( context => ( context.areaChanges && context.areaChanges.length ) ? Promise.resolve( context.areaChanges )
					.then( areaChanges => areaChanges.reduce( ( promise, areaChange ) => promise
						.then( () => areaChange )
					 	.then( ...args ), Promise.resolve() ) )
					.then( () => context ) : context );
			return this;
		}
		invalid( ...args ) {
			this.promise = this.promise
				.then( context => ( context.invalid && context.invalid.length ) ? Promise.resolve( context.invalid )
					.then( ...args )
					.then( () => context ) : context );
			return this;
		}
		ack() {
			this.promise = this.promise
				.then( ( context ) => context.token ? Promise.resolve( { token: context.token } )
			 		.then( functions.remove )
					.then( () => {
						delete context.token;
						return context;
					} ) : context );
			return this;
		}
		then( ...args ) {
			return this.promise.then( ( { count, time } ) => ( { time, count } ) ).then( ...args );
		}
		catch( ...args ) {
			this.promise = this.promise.catch( ...args );
			return this;
		}
	}
	return () => new Changes();
};
