if (Meteor.isClient) {

	// when user wants to register
	Template.register.events({
		'submit form' : function (event) {
			event.preventDefault();
			var email = $('[name=email]').val();
			var password = $('[name=password]').val();
			Accounts.createUser({		// Creates user based on email and password
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

			Meteor.loginWithPassword(email, password, function (error) {	// callback function with error handling
				if (error) {
					console.log(error.reason);
				} else {
					Router.go("home");
				}
			});
		}
	});
	
	Template.jobs.helpers({
    'job': function(){
        return jobs.find({}, {sort: {name: 1}});
    }
	
});

	Template.addjob.events({
    'submit form': function(event){
      event.preventDefault();
      var jobName = $('[name=jobName]').val();
      jobs.insert({
          name: jobName
      });
      $('[name=jobName]').val('');
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
	name : 'home',		// label for the route
	template : 'home'	// manually defining association with home template
});

Router.route('/register');	//auto associates route with template of same name
Router.route('/login');
Router.route('/job/:_id', {
    template: 'jobPage',
    data: function(){
        var currentjob = this.params._id;
        return jobs.findOne({ _id: currentjob });
    }
});

Jobs = new Meteor.Collection('jobs');