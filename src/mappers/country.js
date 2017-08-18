const external = Object.defineProperties( {}, {
	iso3166: { configurable: true, get: () => Object.defineProperty( external, 'iso3166', {
		configurable: false,
		value: require( 'iso-3166-2' ),
		writable: false
	} ).iso3166 }
} );
const get = ( text ) => {
	switch( text.toLowerCase() ) {
		case 'great britain':
			return external.iso3166.country( 'GB' );
		case 'south korea':
			return external.iso3166.country( 'KR' );
		default:
			return external.iso3166.country( text );
	};
};
const map = ( { code, name } ) => ( { code, name: name.split( ', ' ).reverse().join( ' ' ) } );
const create = ( name ) => ( { code: 'UN', name } );
module.exports = ( text ) => {
	let country = get( text );
	return country.code ? map( country ) : create( text );
};
