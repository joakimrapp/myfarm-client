const mappers = { country: require( '../mappers/country.js' ) };
module.exports = ( functions ) => require( '@jrapp/promise-memory-cache' )( () =>
	functions.vcs()
 		.then( ( { json } ) => json )
		.then( ( vcs ) => vcs.map( ( { vcId, shortName, fullName } ) => ( {
			guid: vcId,
			name: shortName.split( '.' ).slice( 1 ).join( '.' ),
			path: fullName.split( '.' )
		} ) ) )
		.then( ( vcs ) => Array.from( vcs.reduce( ( countries, { guid, name, path } ) => {
			const country = mappers.country( path[ 0 ] );
			if( !countries.has( country.name ) )
				countries.set( country.name, { name: country.name, code: country.code, vcs: [] } );
			countries.get( country.name ).vcs.push( ( { guid, name, path } ) );
			return countries;
		}, new Map() ).values() ).sort( ( a, b ) => a.name < b.name ? -1 : 1 ) ) )
	.ttl( 1000 * 60 * 10 )
	.ttk( 1000 * 60 * 60 )
	.timeout( 1000 )
	.mapper( () => '' )
	.build();
