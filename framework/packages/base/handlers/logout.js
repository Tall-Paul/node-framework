exports.handle = function(id,site,request,response){
	request.logout();
  	response.writeHeader(302,{'Location': '/'});
  	response.end();
}