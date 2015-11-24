/**
 * New node file
 */


exports.getOptions = function(endpoint, method, headers){
	// options for GET
	var wsOptions = {
	    host : '159.203.248.23', // here only the domain name
	    // (no http/https !)
	    port : 3999,
	    path : '/api/'+endpoint, // the rest of the url with parameters if needed
	    method : method,
	    headers : headers
	};
	
	return wsOptions;
}