Jobs = new Mongo.Collection('jobs');
Lists = new Meteor.Collection('lists');

if (Meteor.isClient) {

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

	Template.addList.events({
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

	});

	Template.lists.helpers({
		'list' : function () {
			return Lists.find({}, {
				sort : {
					name : 1
				}
			});
		}
	});

	Template.jobs.helpers({
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
	});

	Template.addJob.events({
		// events go here

		'submit form' : function (event) {
			event.preventDefault();
			var jobName = $('[name="jobName"]').val();
			var currentUser = Meteor.userId();
			var currentList = this._id;
		//	var currentListName = this.name;
			Jobs.insert({
				name : jobName,
				completed : false,
				createdAt : new Date(),
				createdBy : currentUser,
				listId : currentList,
			//	listname : currentListName
			});
			$('[name="jobName"]').val('');
		}

	});

	Template.jobItem.events({
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

		'keyup [name=jobItem]' : function (event) {
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
		},

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
	
	Template.profile.helpers({
		'id' : function () {
			return Meteor.user()._id;
		}
	});
	
	Template.addFeedback.events({
		'submit form' : function (event) {
			event.preventDefault();
			var rating = $('[name=rating').val();
			console.log(Meteor.user());
			Meteor.users.update(Meteor.user(), {$set: {"profile.rating": rating}} );
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

Router.route('/register'); //auto associates route with template of same name
Router.route('/login');
Router.route('/list/:_id', {
	name : 'listPage',
	template : 'listPage',
	data : function () {
		var currentList = this.params._id;
		var currentUser = Meteor.userId();
		return Lists.findOne({
			_id : currentList,
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

/*Router.route("/profile/:email",{
	name:"profile",
	//controller:"ProfileController"
});

ProfileController=RouteController.extend({
    template:"profile",
    waitOn:function(){
        return Meteor.subscribe("userProfile",this.params.email);
    },
    data:function(){
        var email=Router.current().params.email;
        return Meteor.users.findOne({
            email:email
        });
    }
})*/
