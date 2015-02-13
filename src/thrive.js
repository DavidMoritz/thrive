var thriveApp = angular.module('thriveApp', []);
thriveApp.run(function runWithDependencies($rootScope) {
	$rootScope._ = window._;
});

thriveApp.controller('ThriveCtrl', [
	'$scope',
	'$interval',
	'$timeout',
	function ThriveCtrl($s, $interval, $timeout) {
		function Follower(name) {
			var self = this;

			self.name = name || 'John Doe';
			self.task = new Task();
			self.strength = 1;
			self.id = _.random(1,9999);

			self.newTask = function (task) {
				self.task.name = task;
			};
		}

		function Resource(resourceOptions) {
			return _.merge({
				quantity: 1,
				cooldown: defaultCooldownTime
			}, _.pick(resourceOptions, [
				'name',
				'text',
				'icon',
				'qtyPerLoad',
				'cooldown',
				'cost',
				'unlock'
			]));
		}

		function Structure(buildingOptions) {
			return _.merge({
				quantity: 1,
				capacity: 1,
				size: 1,
				cooldown: defaultCooldownTime
			}, _.pick(buildingOptions, [
				'name',
				'text',
				'icon',
				'size',
				'cooldown',
				'capacity',
				'cost',
				'unlock'
			]));
		}

		function Task() {
			var self = this;

			self.name = 'idle';
		}

		function Choice(subject, buttonText, display, cssClasses) {
			return {
				subject: subject,
				buttonText: buttonText,
				display: display,
				css: cssClasses
			};
		}

		var defaultCooldownTime = 5000;
		var locations = [
			new Choice('location', 'Stream (more water)', 'Stream', ['btn', 'btn-primary']),
			new Choice('location', 'Forest (more food)', 'Forest', ['btn', 'btn-success'])
		];
		var maxLots = 30;

		//	initialize scoped variables
		_.assign($s, {
			followers: [],
			unlocked: ['water'],
			supply: [],
			turns: 0,
			lots: [],
			messagelog: [],
			decisionToMake: null,
			defaultDisplay: {text: 'Thrive!', next: false, choices: []},
			display: null,
			messages: [],
			selectedFollower: null,
			location: null,
			gameStarted: false,
			readyToWork: true
		});
		$s.display = _.cloneDeep($s.defaultDisplay);
		$s.messages.push($s.defaultDisplay);

		$s.startGame = function startGame() {
			$s.gameStarted = true;
			$s.addMessage('You\'ve been running for days...');
			$s.addMessage('barely getting by on wild berries...');
			$s.addMessage('and filthy pond water.');
			$s.addMessage('This is no way to survive.');
			$s.addMessage('You want to thrive!');
			$s.addMessage('Which is a better place to stop?', [{
				subject: 'location',
				buttonText: 'Stream (plenty of water)',
				display: 'Stream',
				css: ['btn', 'btn-primary']
			}, {
				subject: 'location',
				buttonText: 'Forest (plenty of wood)',
				display: 'Forest',
				css: ['btn', 'btn-success']
			}]);
		};

		$s.addMessage = function addMessage(text, choices) {
			var next = !choices;
			var check = $s.messages[0] == $s.defaultDisplay;
			var message = {
				text: text,
				next: next,
				choices: choices
			};
			if(!_.findWhere($s.messages, message)) {
				$s.messages.push(message);
			}
			if (check) {
				$s.nextMessage();
			}
		};

		$s.makeChoice = function makeChoice(choice) {
			switch (choice.subject) {
				case 'location':
				   $s.location = choice;
				   break;
			}
			$s.nextMessage();
			$s.decisionToMake = null;
		};

		$s.checkAvailabilty = function checkAvailabilty() {
			var cap = _.clone(maxLots);
			_.forEach($s.lots, function eachLot(lot) {
				cap -= lot.quantity * lot.building.size;
			});
			return cap;
		};

		$s.build = function build(building) {
			var available = true;
			var purchase = [];

			_.forEach(building.cost, function eachCostItem(costItem) {
				var supply = _.findWhere($s.supply, {resource: costItem});
				if (supply) {
					if (supply.quantity >= costItem.amount) {
						purchase.push({
							resource: supply,
							cost: costItem.amount
						});
					} else {
						$s.addMessage('You need at least ' + costItem.amount + ' ' + costItem.name + ' to make a ' + building.name + '.');
						available = false;
					}
				}
			});
			if (!available) {
				return;
			}
			if ($s.checkAvailabilty() >= building.size) {
				_.forEach(purchase, function forEachPurchase(eachPurchase) {
					eachPurchase.resource.quantity -= eachPurchase.cost;
				});

				if (!_.findWhere($s.lots, {building: building})) {
					$s.unlocked.push(building.name);
					$s.lots.push({
						building: new Structure(building),
						quantity: 0
					});
				}
				_.findWhere($s.lots, {building: building}).quantity += 1;
			} else {
				$s.addMessage('You don\'t have enough room in your plot to build a ' + building.name + '.');
				return;
			}
		};

		$s.nextMessage = function nextMessage() {
			$s.messagelog.push($s.messages.shift());
			if ($s.messages.length) {
				$s.display = $s.messages[0];
			} else {
				$s.display = $s.defaultDisplay;
				$s.messages.push($s.defaultDisplay);
			}
		};

		$s.coolDown = function coolDown(resource, time) {
			$s.readyToWork = false;
			$timeout(function readyToWorkAgain() {
				$s.readyToWork = true;
			}, time || defaultCooldownTime);
		};

		$s.toggleFollowerSelection = function toggleFollowerSelection(follower) {
			$s.selectedFollower = $s.isSelected(follower) ? null : follower;
		};

		$s.addFollower = function addFollower() {
			var name = $s.randomPlayers.shift();
			$s.followers.push( new Follower(name) );
		};

		$s.addToSupply = function addToSupply(resource, auto) {
			var available = true;

			_.forEach(resource.cost, function eachCostItem(costItem) {
				var supplyCostItem = _.findWhere($s.supply, {resource: costItem});
				if (supplyCostItem) {
					if (supplyCostItem.quantity >= costItem.amount) {
						supplyCostItem.quantity -= costItem.amount;
					} else {
						$s.addMessage('You need at least ' + costItem.amount + ' ' + costItem.name + ' to make a ' + resource.name + '.');
						available = false;
						return false;
					}
				}
			});

			if (!available) {
				return;
			}

			if ($s.selectedFollower) {
				$s.selectedFollower.newTask(resource.name);
				$s.selectedFollower = null;
			}

			if (!_.findWhere($s.supply, {resource: resource})) {
				$s.supply.push({
					resource: new Resource(resource),
					quantity: 0
				});

				if (resource.unlock) {
					$s.unlocked.push(resource.unlock);
				}
			}

			_.findWhere($s.supply, {resource: resource}).quantity += resource.qtyPerLoad;

			if (!auto){
				$s.coolDown(resource, resource.cooldown);
			}
		};

		$s.pickFollower = function pickFollower() {
			var idle;
			_.forEach($s.followers, function(eachFollower) {
				if (eachFollower.task.name == 'idle') {
					idle = eachFollower;
				}
			});
			if (idle) {
				return idle;
			}
			var groups = _.groupBy($s.followers, function eachFollower(follower) {
				return follower.task.name;
			});
			groups = _.sortBy(groups, function(group) {
				return (group.length * -1);
			});
			return groups[0][0];
		};

		$s.removeFollower = function removeFollower(removedFollower) {
			_.remove($s.followers, function(eachFollower) {
				return eachFollower == removedFollower;
			});
		};

		$s.removeStructure = function removeStructure(building) {
			_.findWhere($s.lots, {building: building}).quantity--;
		};

		$s.eat = function eat(follower) {
			var food = _.find($s.supply, function matchItem(supplyItem) {
				return supplyItem.resource.name === 'food';
			});
			var water = _.find($s.supply, function matchItem(supplyItem) {
				return supplyItem.resource.name === 'water';
			});

			if (water.quantity && food.quantity) {
				water.quantity--;
				food.quantity--;
			} else {
				follower.newTask('idle');
			}
		};

		$s.isSelected = function isSelected(follower) {
			return follower === $s.selectedFollower;
		};

		$interval(function clickTicks() {
			var capacity = 0;
			$s.followers.forEach(function eachFollower(follower) {
				if (follower.task.name != 'idle') {
					$s.addToSupply(follower.task.name, true);
					$s.eat(follower);
				}
			});
			_.forEach($s.lots, function eachLot(lot) {
				capacity += lot.building.capacity * lot.quantity;
			});
			if (capacity > $s.followers.length) {
				$s.addFollower();
			} else if (capacity < $s.followers.length) {
				$s.removeFollower( $s.pickFollower() );
			}
			if (!_.contains($s.unlocked, 'win')) {
				$s.turns++;
			}
		}, defaultCooldownTime, $s.turns);

		$s.resources = [{
			name: 'water',
			icon: 'fa-coffee',
			text: 'Fetch Water',
			qtyPerLoad: 5,
			cooldown: 4000,
			cost: [],
			unlock: 'food'
		},{
			name: 'food',
			icon: 'fa-cutlery',
			text: 'Gather food',
			qtyPerLoad: 3,
			cooldown: 2000,
			cost: [],
			unlock: 'wood'
		},{
			name: 'wood',
			icon: 'fa-tree',
			text: 'Chop Wood',
			qtyPerLoad: 2,
			cooldown: 1000,
			cost: [],
			unlock: 'hut'
		},{
			name: 'clay',
			icon: 'fa-cloud',
			text: 'Dig Clay',
			qtyPerLoad: 2,
			cooldown: 2000,
			cost: [],
			unlock: 'smelter'
		},{
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
		}];

		$s.buildings = [{
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
		},{
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
		},{
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
		}];

		$s.isUnlocked = function isUnlocked(valueToCheck) {
			return _.contains($s.unlocked, valueToCheck);
		};

		$s.skipToMiddle = function skipToMiddle() {
			_.assign($s, {
				gameStarted: true,
				location: new Choice('location', 'Stream (plenty of water)', 'Stream', ['btn', 'btn-primary']),
				unlocked: ['water', 'food', 'wood', 'clay', 'brick', 'hut', 'smelter', 'monument']
			});
			_.forEach($s.resources, function eachResource(resource) {
				$s.supply.push({
					resource: new Resource(resource),
					quantity: 100
				});
			});
			_.forEach($s.buildings, function eachBuilding(building) {
				if (building.name !== 'monument') {
					$s.lots.push({
						building: new Structure(building),
						quantity: 7
					});
				}
			});
		};

		//  Let's randomize the 200 most popular first names of the those born in the 1980's for players
		$s.randomPlayers = _.shuffle(['Michael', 'Christopher', 'Matthew', 'Joshua', 'David', 'Chandler', 'James', 'Daniel', 'Robert', 'John', 'Joseph', 'Jason', 'Justin', 'Andrew', 'Ryan', 'William', 'Brian', 'Brandon', 'Jonathan', 'Nicholas', 'Anthony', 'Eric', 'Adam', 'Kevin', 'Thomas', 'Steven', 'Timothy', 'Richard', 'Jeremy', 'Jeffrey', 'Kyle', 'Benjamin', 'Joey', 'Aaron', 'Charles', 'Mark', 'Jacob', 'Stephen', 'Patrick', 'Scott', 'Nathan', 'Paul', 'Sean', 'Travis', 'Zachary', 'Dustin', 'Gregory', 'Kenneth', 'Jose', 'Tyler', 'Jesse', 'Alexander', 'Bryan', 'Samuel', 'Ross', 'Derek', 'Bradley', 'Chad', 'Shawn', 'Edward', 'Jared', 'Cody', 'Jordan', 'Peter', 'Corey', 'Keith', 'Marcus', 'Juan', 'Donald', 'Ronald', 'Phillip', 'George', 'Cory', 'Joel', 'Shane', 'Douglas', 'Antonio', 'Raymond', 'Carlos', 'Brett', 'Gary', 'Alex', 'Nathaniel', 'Craig', 'Ian', 'Luis', 'Derrick', 'Erik', 'Casey', 'Philip', 'Frank', 'Evan', 'Rachel', 'Gabriel', 'Victor', 'Vincent', 'Larry', 'Austin', 'Brent', 'Seth', 'Wesley', 'Dennis', 'Todd', 'Christian', 'Jessica', 'Jennifer', 'Amanda', 'Ashley', 'Sarah', 'Stephanie', 'Melissa', 'Nicole', 'Elizabeth', 'Heather', 'Tiffany', 'Michelle', 'Amber', 'Megan', 'Amy', 'Kimberly', 'Christina', 'Lauren', 'Crystal', 'Brittany', 'Rebecca', 'Laura', 'Danielle', 'Emily', 'Samantha', 'Angela', 'Erin', 'Kelly', 'Sara', 'Lisa', 'Katherine', 'Andrea', 'Jamie', 'Mary', 'Erica', 'Courtney', 'Kristen', 'Shannon', 'April', 'Katie', 'Lindsey', 'Kristin', 'Lindsay', 'Christine', 'Alicia', 'Vanessa', 'Maria', 'Kathryn', 'Allison', 'Julie', 'Anna', 'Tara', 'Kayla', 'Natalie', 'Victoria', 'Jacqueline', 'Holly', 'Kristina', 'Patricia', 'Cassandra', 'Brandy', 'Whitney', 'Chelsea', 'Brandi', 'Catherine', 'Cynthia', 'Kathleen', 'Veronica', 'Leslie', 'Phoebe', 'Natasha', 'Krystal', 'Stacy', 'Diana', 'Monica', 'Erika', 'Dana', 'Jenna', 'Carrie', 'Leah', 'Melanie', 'Brooke', 'Karen', 'Alexandra', 'Valerie', 'Caitlin', 'Julia', 'Alyssa', 'Jasmine', 'Hannah', 'Stacey', 'Brittney', 'Susan', 'Margaret', 'Sandra', 'Candice', 'Latoya', 'Bethany', 'Misty']);
	}
]);
