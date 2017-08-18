const mappers = { country: require( '../mappers/country.js' ) };
module.exports = ( functions ) => require( '@jrapp/promise-memory-cache' )( ( { guid } ) =>
	functions.vc( { vc: guid } ).then( ( { json } ) => json )
		.then( ( { vcId, shortName, fullName, timeZoneOffsetMinutes, farmAreas } ) => {
			return {
				guid: vcId,
				name: shortName.split( '.' ).slice( 1 ).join( '.' ),
				path: fullName.split( '.' ),
				timeZoneOffset: Math.round( timeZoneOffsetMinutes * 1000 * 60 ),
				farmAreas: farmAreas.map( ( { areaId, areaName, areaType } ) => ( {
					guid: areaId,
					name: areaName,
					type: areaType
				} ) )
			};
		} ) )
	.ttl( 1000 * 60 * 10 )
	.ttk( 1000 * 60 * 60 )
	.timeout( 1000 )
	.mapper( ( { guid } ) => guid )
	.build();
