Jobs = new Meteor.Collection('jobs');
Comments = new Meteor.Collection('comments');
Userinfo = new Meteor.Collection('userinfo');
Markers = new Mongo.Collection('markers');  

if (Meteor.isClient) {

	Meteor.startup(function() {  
  		GoogleMaps.load();
	});
	Template.map.helpers({  
  		mapOptions: function() {
    		if (GoogleMaps.loaded()) {
      			return {
        			center: new google.maps.LatLng(43.1854445, -77.6865426),
        			zoom: 8
      			};
   			}
  		}
	});

	Template.map.onCreated(function() {  
  		GoogleMaps.ready('map', function(map) {
     		google.maps.event.addListener(map.instance, 'click', function(event) {
      			Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    		});
    		var markers = {};

Markers.find().observe({  
  added: function(document) {
    // Create a marker for this document
    var marker = new google.maps.Marker({
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(document.lat, document.lng),
      map: map.instance,
      // We store the document _id on the marker in order 
      // to update the document within the 'dragend' event below.
      id: document._id
    });

    // This listener lets us drag markers on the map and update their corresponding document.
    google.maps.event.addListener(marker, 'dragend', function(event) {
      Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
    });

    // Store this marker instance within the markers object.
    markers[document._id] = marker;
  },
  changed: function(newDocument, oldDocument) {
    markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
  },
  removed: function(oldDocument) {
    // Remove the marker from the map
    markers[oldDocument._id].setMap(null);

    // Clear the event listener
    google.maps.event.clearInstanceListeners(
      markers[oldDocument._id]);

    // Remove the reference to this marker instance
    delete markers[oldDocument._id];
  }
});
  		});
	});
	// when user wants to register
	Template.register.events({
		'submit form' : function (event) {
			event.preventDefault();
			var email = $('[name=email]').val();
			var password = $('[name=password]').val();
			Accounts.createUser({ // Creates user based on email and password
				email : email,
				password : password
			}, function (error) {
				if (error) {
					console.log(error.reason); // Output error if registration fails
				} else {
					Router.go("home"); // Redirect user if registration succeeds
				}
			});
		}
	});

	// when user navigates through website
	Template.navigation.events({
		'click .logout' : function (event) {
			event.preventDefault();
			Meteor.logout();
			Router.go('login');
		}
	});

	// when user wants to login
	Template.login.events({
		'submit form' : function (event) {
			event.preventDefault();
			var email = $('[name=email]').val();
			var password = $('[name=password]').val();

			Meteor.loginWithPassword(email, password, function (error) { // callback function with error handling
				if (error) {
					console.log(error.reason);
				} else {
					var currentRoute = Router.current().route.getName();
					if (currentRoute == "login") {
						Router.go("home");
					}
				}
			});
		}
	});

	/*Template.addList.events({
		'submit form' : function (event) {
			event.preventDefault();
			var listName = $('[name=listName]').val();
			var currentUser = Meteor.userId();
			Lists.insert({
				name : listName,
				createdBy : currentUser
			}, function (error, results) {
				Router.go('listPage', {
					_id : results
				});
			});
			$('[name=listName]').val('');
		}

	});*/

	Template.lists.helpers({
		'job' : function () {
			return Jobs.find({}, {
				sort : {
					name : 1
				}
			});
		}
	});

	/*Template.jobs.helpers({
		'job' : function () {
			var currentList = this._id;
			console.log(this._id);
			console.log(this.listName);
			console.log(this.name);
			return Jobs.find({
				listId : currentList
			}, {
				sort : {
					createdAt : -1
				}
			})
		}
	});*/

	Template.addJob.events({
		'submit form' : function (event) {
			event.preventDefault();
			var jobName = $('[name="jobName"]').val();
			var currentUser = Meteor.userId();
			var category = $('[name="category"]').val();
			var description = $('[name="description"]').val();
			Jobs.insert({
				name : jobName,
				completed : false,
				createdAt : new Date(),
				createdBy : currentUser,
				category : category,
				description : description
			}, function (error, results) {
				Router.go('jobPage', {
					_id : results
				});
			});
			$('[name="jobName"]').val('');
		}
	});
	
	Template.jobPage.events({
		// events go here

		'click .delete-job' : function (event) {
			event.preventDefault();
			var documentId = this._id;
			var confirm = window.confirm("Delete this job?");
			if (confirm) {
				Jobs.remove({
					_id : documentId
				});
			}
		},

		/*'keyup [name=jobItem]' : function (event) {
			if (event.which == 13 || event.which == 27) {	//13 is enter key event, 27 is escape key event
				$(event.target).blur();
			} else {
				var documentId = this._id;
				var jobItem = $(event.target).val();
				Jobs.update({
					_id : documentId
				}, {
					$set : {
						name : jobItem
					}
				});
			}
		},*/

		'change [type=checkbox]' : function () {
			var documentId = this._id;
			var isCompleted = this.completed;
			if (isCompleted) {
				Jobs.update({
					_id : documentId
				}, {
					$set : {
						completed : false
					}
				});
			} else {
				Jobs.update({
					_id : documentId
				}, {
					$set : {
						completed : true
					}
				});
			}
		}

	});

	Template.jobItem.helpers({
		'checked' : function () {
			var isCompleted = this.completed;
			if (isCompleted) {
				return "checked";
			} else {
				return "";
			}
		}
	});
	
	Template.othersProfile.helpers({
		'id' : function () {
			return Meteor.user()._id;
		},
		'firstname' : function() {
			for (i=0;i<Userinfo.find({userId:Meteor.userId()}).count();i++)
			first = Userinfo.find({userId:Meteor.userId()}).fetch()[i].firstname;
			return first;
		},
		'lastname' : function() {
			for (i=0;i<Userinfo.find({userId:Meteor.userId()}).count();i++)
			last = Userinfo.find({userId:Meteor.userId()}).fetch()[i].lastname;
			return last;
		},
		'location' : function() {
			for (i=0;i<Userinfo.find({userId:Meteor.userId()}).count();i++)
			loc = Userinfo.find({userId:Meteor.userId()}).fetch()[i].location;
			return loc;
		}
	});
	
	
	Template.profile.helpers({
		'id' : function () {
			return Meteor.user()._id;
		},
		'firstname' : function() {
			for (i=0;i<Userinfo.find({userId:Meteor.userId()}).count();i++)
			first = Userinfo.find({userId:Meteor.userId()}).fetch()[i].firstname;
			return first;
		},
		'lastname' : function() {
			for (i=0;i<Userinfo.find({userId:Meteor.userId()}).count();i++)
			last = Userinfo.find({userId:Meteor.userId()}).fetch()[i].lastname;
			return last;
		},
		'location' : function() {
			for (i=0;i<Userinfo.find({userId:Meteor.userId()}).count();i++)
			loc = Userinfo.find({userId:Meteor.userId()}).fetch()[i].location;
			return loc;
		}
	});
	
	Template.addFeedback.events({
		'submit form' : function (event) {
			event.preventDefault();
			var comment = $('[name=comment]').val();
			var currentUser = Meteor.userId();
			Comments.insert({
				Content : comment,
				userId : currentUser
			}, function (error, results){
				Router.go('profile',{
					_id: results
				});
			});
			$('[name=comment]').val('');

		}
	});

	Template.feedback.helpers({
		'comment' : function(){
			console.log(Meteor.userId());
			console.log(Comments.find({userId:Meteor.userId()}).fetch);
			text="";
			for (i=0;i<Comments.find({userId:Meteor.userId()}).count();i++)
				text += Comments.find({userId:Meteor.userId()}).fetch()[i].Content + " ; ";
			return text;
		}
	});

	Template.updateUserInfo.events({
		'submit form' : function (event) {
			console.log("here");
			event.preventDefault();
			var currentUser = Meteor.userId();
			var firstname = $('[name=firstname]').val();
			var lastname = $('[name=lastname]').val();
			var location = $('[name=location]').val();
			Userinfo.insert({
				firstname : firstname,
				lastname : lastname,
				location : location,
				userId : currentUser
			}, function (error, results) {
				Router.go('profile',{
					_id: results
				});
			});
			$('[name=firstname]').val('');
			$('[name=lastname]').val('');
		}
	});
	
	Template.profile.events({
		'keyup [name=firstname]' : function (event) {
			if (event.which == 13 || event.which == 27) {	//13 is enter key event, 27 is escape key event
				$(event.target).blur();
			} else {
				var documentId = this._id;
				var profile = $(event.target).val();
				console.log(profile);
				console.log(documentId);
				Meteor.users.update({
					_id : documentId
				}, {
					$set : {
						firstname : profile
					}
				});
			}
		}
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});

}

// apply to all routes
Router.configure({
	layoutTemplate : 'main'
});

// creating routes using Iron Router
Router.route('/', {
	name : 'home', // label for the route
	template : 'home' // manually defining association with home template
});

Router.route('/users/:_id',{
	name: 'othersProfile',
	template: 'othersProfile'
});
Router.route('/register'); //auto associates route with template of same name
Router.route('/login');
Router.route('/job/:_id', {
	name : 'jobPage',
	template : 'jobPage',
	data : function () {
		var currentJob = this.params._id;
		//var name = this.params
		var currentUser = Meteor.userId();
		return Jobs.findOne({
			_id : currentJob,
		//	name : 
			createdBy : currentUser
		});
	},
	onBeforeAction : function () {
		var currentUser = Meteor.userId();
		if (currentUser) {
			this.next();
		} else {
			this.render("login");
		}
	}
});
Router.route('/profile');
