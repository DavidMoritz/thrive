thriveApp.factory('HelperFactory', [
	'ClassLibFactory',
	function HelperFactory(CLF) {
		'use strict';

		return {
			defaultCooldownTime: 5000,

			capitalize: function capitalize(string, keepOtherCapitalization) {
				return string.charAt(0).toUpperCase() + (keepOtherCapitalization ? string.slice(1) : string.slice(1).toLowerCase());
			},

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

			resources: [
				new CLF.Resource({
					name: 'water',
					icon: 'fa-coffee',
					text: 'Fetch Water',
					qtyPerLoad: 5,
					cooldown: 4000,
					cost: [],
					unlock: 'food'
				}),
				new CLF.Resource({
					name: 'food',
					icon: 'fa-cutlery',
					text: 'Gather food',
					qtyPerLoad: 3,
					cooldown: 2000,
					cost: [],
					unlock: 'wood'
				}),
				new CLF.Resource({
					name: 'wood',
					icon: 'fa-tree',
					text: 'Chop Wood',
					qtyPerLoad: 2,
					cooldown: 1000,
					cost: [],
					unlock: 'hut'
				}),
				new CLF.Resource({
					name: 'clay',
					icon: 'fa-cloud',
					text: 'Dig Clay',
					qtyPerLoad: 2,
					cooldown: 2000,
					cost: [],
					unlock: 'smelter'
				}),
				new CLF.Resource({
					name: 'brick',
					icon: 'fa-pause fa-rotate-90',
					text: 'Make brick',
					qtyPerLoad: 1,
					cooldown: 2000,
					cost: [{
						name: 'clay',
						amount: 2
					}, {
						name: 'wood',
						amount: 2
					}],
					unlock: 'monument'
				})
			],

			locations: [
				new CLF.Choice({
					subject: 'location',
					buttonText: 'Stream (more water)',
					display: 'Stream',
					css: ['btn', 'btn-primary']
				}),
				new CLF.Choice({
					subject: 'location',
					buttonText: 'Forest (more food)',
					display: 'Forest',
					css: ['btn', 'btn-success']
				})
			],

			structures: [
				new CLF.Structure({
					name: 'hut',
					text: 'Build Hut',
					icon: 'fa-home',
					size: 1,
					cooldown: 2000,
					capacity: 1,
					cost: [{
						name: 'wood',
						amount: 10
					}],
					unlock: 'clay'
				}),
				new CLF.Structure({
					name: 'smelter',
					text: 'Build Smelter',
					icon: 'fa-building-o',
					size: 2,
					cooldown: 2000,
					capacity: 0,
					cost: [{
						name: 'clay',
						amount: 100
					}],
					unlock: 'brick'
				}),
				new CLF.Structure({
					name: 'monument',
					text: 'Build Monument',
					icon: 'fa-male',
					size: 10,
					cooldown: 2000,
					capacity: 0,
					cost: [{
						name: 'brick',
						amount: 300
					}],
					unlock: 'win'
				})
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
