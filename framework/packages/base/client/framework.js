var framework_load_object = function(json,element_prefix){
		var obj = JSON.parse(json);
		for (var key in obj) {
  		if (obj.hasOwnProperty(key)) {
  			var element =  document.getElementById(element_prefix+"_"+key);
			if (typeof(element) != 'undefined' && element != null)
			{
				element.innerHTML = obj[key];
  			}
		}
		}
}

var framework_get_object = function(obj,query,prefix){
	$.get("/object/"+obj+"?"+query,function(data){
		framework_load_object(data,prefix);
	});
};
