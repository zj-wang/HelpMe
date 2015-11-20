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

	//function to get all the lists
	Template.lists.helpers({
		'list' : function () {
			var currentUser = Meteor.userId();
			return Lists.find({}, {
				sort : {
					name : 1
				}
			});
		}
	});

	//function to get all the jobs
	Template.jobs.helpers({
		'job' : function () {
			var currentList = this._id;
			return Jobs.find({
				listId : currentList
			}, {
				sort : {
					createdAt : -1
				}
			})
		}
	});

	//function to add a list
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

	//function to add a job
	Template.addJob.events({
		// events go here

		'submit form' : function (event) {
			event.preventDefault();
			var jobName = $('[name="jobName"]').val();
			var currentUser = Meteor.userId();
			var currentList = this._id;
			Jobs.insert({
				name : jobName,
				completed : false,
				createdAt : new Date(),
				createdBy : currentUser,
				listId : currentList
			});
			$('[name="jobName"]').val('');
		}

	});

	//delete job, update job, check job function
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
			if (event.which == 13 || event.which == 27) {
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

