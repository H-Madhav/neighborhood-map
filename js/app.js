// for small screen i had to  make serchContainer Appear and Disappear.
$("#menu").click(function() {
    $(".serchContainer").css({
        "position": "absolute",
        "top": "0",
        "left": "0",
        "width": "300px"
    });
    $(this).hide();
    $(".cut").show();
});
$(".cut").click(function() {
    $(".serchContainer").css({
        "position": "absolute",
        "top": "0",
        "left": "-9999px",
        "width": "300px"
    });
    $(this).hide();
    $("#menu").show();
});

//Data about locations 
var locations = [{
        title: 'UB City',
        lat: 12.9715,
        lng: 77.5964
    }, {
        title: 'orion mall',
        lat: 12.9716,
        lng: 77.5946
    }, {
        title: 'Wonderla',
        lat: 12.8343,
        lng: 77.4010
    }, {
        title: 'Cubbon Park',
        lat: 12.9755,
        lng: 77.5939
    }, {
        title: 'ISKCON Temple',
        lat: 13.0104,
        lng: 77.5510
    }, {
        title: 'Ulsoor',
        lat: 12.9817,
        lng: 77.6286

    }, {
        title: 'Bannerghatta National Park',
        lat: 12.8009,
        lng: 77.5777
    }, {
        title: 'Mantri Square',
        lat: 12.9917,
        lng: 77.5706
    }, {
        title: 'Lal Bagh',
        lat: 12.9507,
        lng: 77.5848
    }, {
        title: 'Vidhana Soudha',
        lat: 12.9796,
        lng: 77.5907
    }, {
        title:'Visvesvaraya ITM',
        lat: 12.9752,
        lng: 77.5963
    }
];

var map;

//Client ID and clientSecret for Foursquare API
var clientID = "M3HWVDD2XILGJTRDEDL0OBARYD423ZNG0CBYAPXF0B3YJ3PH",
    clientSecret = "4CD4L2FAMN2DVXJBVTWELHIQO5QOZ3MGNOJPVATEBX2UTGMD";

// format the phone numbers
function phoneFormat(num) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(num)) {
        var parts = num.match(regexObj);
        var phoneNum = "";
        if (parts[1]) {
            phoneNum += "+1 (" + parts[1] + ") ";
        }
        phoneNum += parts[2] + "-" + parts[3];
        return phoneNum;
    } else {

        return num;
    }
}

var Location = function(location) {
    var self = this;
    this.title = location.title;
    this.lat = location.lat;
    this.lng = location.lng;
    this.URL = "";
    this.streetAddress = "";
    this.city = "";
    this.phone = "";

    this.visible = ko.observable(true);

    var url = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.title;
    
    // Get the json Data 
    $.getJSON(url).done(function(location) {
        var results = location.response.venues[0];
        self.URL = results.url;
        if (typeof self.URL === 'undefined') {
            self.URL = "";
        }
        self.streetAddress = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = results.contact.phone;
        if (typeof self.phone === 'undefined') {
            self.phone = "";
        } else {
            self.phone = phoneFormat(self.phone);
        }

        // if Something went wrong alert users to refresh the page
    }).fail(function() {
        alert("Oops! Something went wrong. This page didn't load  Foursquare API...");
    });

    // setting the content of infowindow of marker to show info about locations
    //right Now it is empty;
    this.contentString = '';
    this.infoWindow = new google.maps.InfoWindow({
        content: self.contentString
    });

    // making new google map  marker 
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        map: map,
        title: location.title
    });

    this.setMarker = ko.computed(function() {
      
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function() {
        self.contentString = '<div class="infoWindow"><div class="title"><b>' + location.title + "</b></div>" +
            '<div><a href="' + self.URL + '">' + self.URL + "</a></div>" +
            '<div>' + self.streetAddress + "</div>" +
            '<div>' + self.city + "</div>" +
            '<div><a href="#' + self.phone + '">' + self.phone + "</a></div></div>";

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);

        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1500);

    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};



// view Modal for data bindings with DOM.
function ViewModel() {
    var self = this;

    this.searchList = ko.observable("");

    this.locationArr = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: {
            lat: 12.9716,
            lng: 77.5946
        },

    });

    locations.forEach(function(locationMarker) {
        self.locationArr.push(new Location(locationMarker));
    });
    // filtering the data list what i have given .
    this.filteredData = ko.computed(function() {
        var filter = self.searchList().toLowerCase();
        if (!filter) {
            self.locationArr().forEach(function(locationMarker) {
                locationMarker.visible(true);
            });
            return self.locationArr();
        } else {
            return ko.utils.arrayFilter(self.locationArr(), function(locationMarker) {
                var string = locationMarker.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationMarker.visible(result);
                return result;
            });
        }
    }, self);

}
// initialise the map 
function initMap() {
    ko.applyBindings(new ViewModel());
}
//if something went wrong it will alert the user 
function error() {
    alert("Oops! Something went wrong. This page didn't load Google Maps ...");
}
