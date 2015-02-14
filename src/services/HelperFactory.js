thriveApp.factory('HelperFactory', [
	function HelperFactory() {
		'use strict';

		return {
			tasks: [
				{
					name: 'idle',
					icon: 'fa-facebook-square',
					text: 'Idle'
				}, {
					name: 'resourceCollector',
					resource: null
				}
			],
			//  Let's randomize the 200 most popular first names of the those born in the 1980's for followers
			workerNames: _.shuffle([
				'Aaron', 'Adam', 'Alex', 'Alexander', 'Alexandra', 'Alicia', 'Allison', 'Alyssa', 'Amanda',
				'Amber', 'Amy', 'Andrea', 'Andrew', 'Angela', 'Anna', 'Anthony', 'Antonio', 'April', 'Ashley',
				'Austin', 'Benjamin', 'Bethany', 'Bradley', 'Brandi', 'Brandon', 'Brandy', 'Brent', 'Brett',
				'Brian', 'Brittany', 'Brittney', 'Brooke', 'Bryan', 'Caitlin', 'Candice', 'Carlos', 'Carrie',
				'Casey', 'Cassandra', 'Catherine', 'Chad', 'Chandler', 'Charles', 'Chelsea', 'Christian',
				'Christina', 'Christine', 'Christopher', 'Cody', 'Corey', 'Cory', 'Courtney', 'Craig',
				'Crystal', 'Cynthia', 'Dana', 'Daniel', 'Danielle', 'David', 'Dennis', 'Derek', 'Derrick',
				'Diana', 'Donald', 'Douglas', 'Dustin', 'Edward', 'Elizabeth', 'Emily', 'Eric', 'Erica',
				'Erik', 'Erika', 'Erin', 'Evan', 'Frank', 'Gabriel', 'Gary', 'George', 'Gregory', 'Hannah',
				'Heather', 'Holly', 'Ian', 'Jacob', 'Jacqueline', 'James', 'Jamie', 'Jared', 'Jasmine',
				'Jason', 'Jeffrey', 'Jenna', 'Jennifer', 'Jeremy', 'Jesse', 'Jessica', 'Joel', 'Joey', 'John',
				'Jonathan', 'Jordan', 'Jose', 'Joseph', 'Joshua', 'Juan', 'Julia', 'Julie', 'Justin', 'Karen',
				'Katherine', 'Kathleen', 'Kathryn', 'Katie', 'Kayla', 'Keith', 'Kelly', 'Kenneth', 'Kevin',
				'Kimberly', 'Kristen', 'Kristin', 'Kristina', 'Krystal', 'Kyle', 'Larry', 'Latoya', 'Laura',
				'Lauren', 'Leah', 'Leslie', 'Lindsay', 'Lindsey', 'Lisa', 'Luis', 'Marcus', 'Margaret', 'Maria',
				'Mark', 'Mary', 'Matthew', 'Megan', 'Melanie', 'Melissa', 'Michael', 'Michelle', 'Misty',
				'Monica', 'Natalie', 'Natasha', 'Nathan', 'Nathaniel', 'Nicholas', 'Nicole', 'Patricia',
				'Patrick', 'Paul', 'Peter', 'Philip', 'Phillip', 'Phoebe', 'Rachel', 'Raymond', 'Rebecca',
				'Richard', 'Robert', 'Ronald', 'Ross', 'Ryan', 'Samantha', 'Samuel', 'Sandra', 'Sara', 'Sarah',
				'Scott', 'Sean', 'Seth', 'Shane', 'Shannon', 'Shawn', 'Stacey', 'Stacy', 'Stephanie', 'Stephen',
				'Steven', 'Susan', 'Tara', 'Thomas', 'Tiffany', 'Timothy', 'Todd', 'Travis', 'Tyler', 'Valerie',
				'Vanessa', 'Veronica', 'Victor', 'Victoria', 'Vincent', 'Wesley', 'Whitney', 'William', 'Zachary'
			])
		};
	}
]);
