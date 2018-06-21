	function mapInit() {
        var mapCenter = new google.maps.LatLng(59.11728, 26.330616);
        var map = new google.maps.Map(document.getElementById('map1'), {
          'zoom': 14,
          'center': mapCenter,
          'mapTypeId': google.maps.MapTypeId.ROADMAP
        });
        // Create a draggable marker which will later on be binded to a
        // Circle overlay.
        var marker = new google.maps.Marker({
          map: map,
          position: new google.maps.LatLng(59.11728, 26.330616),
          draggable: true,
          title: 'Drag me!'
        });
        // Add a Circle overlay to the map.
        var circle = new google.maps.Circle({
          map: map,
          radius: 1000,
		  editable:true,
		  strokeColor: '#002AFF',
		  strokeOpacity: 0.3, 
		  strokeWeight: 1, 
		  fillColor: '#AAAAFF', 
		  fillOpacity: 0.15
        });
        // Since Circle and Marker both extend MVCObject, you can bind them
        // together using MVCObject's bindTo() method.  Here, we're binding
        // the Circle's center to the Marker's position.
        // http://code.google.com/apis/maps/documentation/v3/reference.html#MVCObject
        circle.bindTo('center', marker, 'position');
	}
      
      // Register an event listener to fire when the page finishes loading.
	google.maps.event.addDomListener(window, 'load', mapInit);