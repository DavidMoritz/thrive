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
			self.task = idleTask;
			self.strength = 1;
			self.id = _.random(1,9999);

			self.newTask = function (task) {
				self.task = task || idleTask;
			};
		}

		function SupplyResource(options) {
			_.merge(this, {
				quantity: options.quantity || 0,
				resource: new Resource(options.resource)	//	pass in object with resource parameter
			});
		}

		function LotStructure(options) {
			_.merge(this, {
				quantity: options.quantity || 0,
				structure: new Structure(options.structure)
			});
		}

		function Resource(resourceOptions) {
			_.merge(this, {
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

		function Structure(structureOptions) {
			_.merge(this, {
				cooldown: defaultCooldownTime
			}, _.pick(structureOptions, [
				'name',
				'text',
				'icon',
				'size',
				'capacity',
				'cooldown',
				'cost',
				'unlock'
			]));
		}

		function Choice(choiceOptions) {
			return _.merge(this, {
				css: ['btn', 'btn-default']
			}, _.pick(choiceOptions, [
				'subject',
				'buttonText',
				'display',
				'css'
			]));
		}

		function getSupplyResource(resourceOrName) {
			// this accepts EITHER a resource object OR a resource name
			var resourceName = _.isObject(resourceOrName) ? resourceOrName.name : resourceOrName;
			return _.find($s.supply, function findResource(supplyItem) {
				return supplyItem.resource.name === resourceName;
			}) || null;	//	returns an object with parameters of 'resource' and 'quantity' (or null)
		}

		function getLotStructure(structureOrName) {
			// this accepts EITHER a structure object OR a structure name
			var structureName = _.isObject(structureOrName) ? structureOrName.name : structureOrName;
			return _.find($s.lots, function findStructure(lot) {
				return lot.structure.name === structureName;
			}) || null;	//	returns an object with parameters of 'resource' and 'quantity' (or null)
		}

		var defaultCooldownTime = 5000;
		var maxLots = 30;
		var idleTask = {
			name: 'idle'
		};

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
				cap -= lot.quantity * lot.structure.size;
			});
			return cap;
		};

		$s.build = function build(structure) {
			var available = true;
			var purchase = [];

			_.forEach(structure.cost, function eachCostItem(costItem) {
				var supplyResource = getSupplyResource(costItem);
				if (supplyResource) {
					if (supplyResource.quantity >= costItem.amount) {
						purchase.push({
							resource: supplyResource.resource,
							cost: costItem.amount
						});
					} else {
						$s.addMessage('You need at least ' + costItem.amount + ' ' + costItem.name + ' to make a ' + structure.name + '.');
						available = false;
					}
				}
			});
			if (!available) {
				return;
			}
			if ($s.checkAvailabilty() >= structure.size) {
				_.forEach(purchase, function eachPurchase(purchase) {
					getSupplyResource(purchase.resource).quantity -= purchase.cost;
				});

				if (!getLotStructure(structure)) {
					$s.unlocked.push(structure.name);
					$s.lots.push(new LotStructure({
						structure: new Structure(structure)
					}));
				}
				getLotStructure(structure).quantity += 1;
			} else {
				$s.addMessage('You don\'t have enough room in your plot to build a ' + structure.name + '.');
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
			var name = randomPlayerNames.shift();
			$s.followers.push( new Follower(name) );
		};

		$s.addToSupply = function addToSupply(resource, auto) {
			var available = true;

			_.forEach(resource.cost, function eachCostItem(costItem) {
				var supplyCostItem = getSupplyResource(costItem);
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
				$s.selectedFollower.newTask(resource);
				$s.selectedFollower = null;
			}

			if (!getSupplyResource(resource)) {
				$s.supply.push(new SupplyResource({
					resource: new Resource(resource)
				}));

				if (resource.unlock) {
					$s.unlocked.push(resource.unlock);
				}
			}

			getSupplyResource(resource).quantity += resource.qtyPerLoad;

			if (!auto){
				$s.coolDown(resource, resource.cooldown);
			}
		};

		$s.pickFollower = function pickFollower() {
			var idle = _.findWhere($s.followers, {task: idleTask});
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

		$s.removeStructure = function removeStructure(structure) {
			getLotStructure(structure).quantity--;
		};

		$s.eat = function eat(follower) {
			var food = getSupplyResource('food');
			var water = getSupplyResource('water');

			if (water.quantity && food.quantity) {
				water.quantity--;
				food.quantity--;
			} else {
				follower.newTask(idleTask);
			}
		};

		$s.isSelected = function isSelected(follower) {
			return follower === $s.selectedFollower;
		};

		$interval(function clickTicks() {
			var capacity = 0;
			$s.followers.forEach(function eachFollower(follower) {
				if (follower.task != idleTask) {
					$s.addToSupply(follower.task, true);
					// I'd rather 'eat' be a follower method, but I don't know how
					$s.eat(follower);
				}
			});
			_.forEach($s.lots, function eachLot(lot) {
				capacity += lot.structure.capacity * lot.quantity;
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

		$s.resources = [
			new Resource({
				name: 'water',
				icon: 'fa-coffee',
				text: 'Fetch Water',
				qtyPerLoad: 5,
				cooldown: 4000,
				cost: [],
				unlock: 'food'
			}),
			new Resource({
				name: 'food',
				icon: 'fa-cutlery',
				text: 'Gather food',
				qtyPerLoad: 3,
				cooldown: 2000,
				cost: [],
				unlock: 'wood'
			}),
			new Resource({
				name: 'wood',
				icon: 'fa-tree',
				text: 'Chop Wood',
				qtyPerLoad: 2,
				cooldown: 1000,
				cost: [],
				unlock: 'hut'
			}),
			new Resource({
				name: 'clay',
				icon: 'fa-cloud',
				text: 'Dig Clay',
				qtyPerLoad: 2,
				cooldown: 2000,
				cost: [],
				unlock: 'smelter'
			}),
			new Resource({
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
		];

		$s.structures = [{
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

		var locations = [
			new Choice({
				subject: 'location',
				buttonText: 'Stream (more water)',
				display: 'Stream',
				css: ['btn', 'btn-primary']
			}),
			new Choice({
				subject: 'location',
				buttonText: 'Forest (more food)',
				display: 'Forest',
				css: ['btn', 'btn-success']
			})
		];

		$s.isUnlocked = function isUnlocked(valueToCheck) {
			return _.contains($s.unlocked, valueToCheck);
		};

		$s.skipToMiddle = function skipToMiddle() {
			_.assign($s, {
				gameStarted: true,
				location: new Choice({
					subject: 'location',
					buttonText: 'Stream (more water)',
					display: 'Stream',
					css: ['btn', 'btn-primary']
				}),
				unlocked: ['water', 'food', 'wood', 'clay', 'brick', 'hut', 'smelter', 'monument']
			});
			_.forEach($s.resources, function eachResource(resource) {
				$s.supply.push(new SupplyResource({
					resource: new Resource(resource),
					quantity: 100
				}));
			});
			_.forEach($s.structures, function eachStructure(structure) {
				if (structure.name !== 'monument') {
					$s.lots.push(new LotStructure({
						structure: new Structure(structure),
						quantity: 7
					}));
				}
			});
		};

		//  Let's randomize the 200 most popular first names of the those born in the 1980's for followers
		var randomPlayerNames = _.shuffle(['Michael', 'Christopher', 'Matthew', 'Joshua', 'David', 'Chandler', 'James', 'Daniel', 'Robert', 'John', 'Joseph', 'Jason', 'Justin', 'Andrew', 'Ryan', 'William', 'Brian', 'Brandon', 'Jonathan', 'Nicholas', 'Anthony', 'Eric', 'Adam', 'Kevin', 'Thomas', 'Steven', 'Timothy', 'Richard', 'Jeremy', 'Jeffrey', 'Kyle', 'Benjamin', 'Joey', 'Aaron', 'Charles', 'Mark', 'Jacob', 'Stephen', 'Patrick', 'Scott', 'Nathan', 'Paul', 'Sean', 'Travis', 'Zachary', 'Dustin', 'Gregory', 'Kenneth', 'Jose', 'Tyler', 'Jesse', 'Alexander', 'Bryan', 'Samuel', 'Ross', 'Derek', 'Bradley', 'Chad', 'Shawn', 'Edward', 'Jared', 'Cody', 'Jordan', 'Peter', 'Corey', 'Keith', 'Marcus', 'Juan', 'Donald', 'Ronald', 'Phillip', 'George', 'Cory', 'Joel', 'Shane', 'Douglas', 'Antonio', 'Raymond', 'Carlos', 'Brett', 'Gary', 'Alex', 'Nathaniel', 'Craig', 'Ian', 'Luis', 'Derrick', 'Erik', 'Casey', 'Philip', 'Frank', 'Evan', 'Rachel', 'Gabriel', 'Victor', 'Vincent', 'Larry', 'Austin', 'Brent', 'Seth', 'Wesley', 'Dennis', 'Todd', 'Christian', 'Jessica', 'Jennifer', 'Amanda', 'Ashley', 'Sarah', 'Stephanie', 'Melissa', 'Nicole', 'Elizabeth', 'Heather', 'Tiffany', 'Michelle', 'Amber', 'Megan', 'Amy', 'Kimberly', 'Christina', 'Lauren', 'Crystal', 'Brittany', 'Rebecca', 'Laura', 'Danielle', 'Emily', 'Samantha', 'Angela', 'Erin', 'Kelly', 'Sara', 'Lisa', 'Katherine', 'Andrea', 'Jamie', 'Mary', 'Erica', 'Courtney', 'Kristen', 'Shannon', 'April', 'Katie', 'Lindsey', 'Kristin', 'Lindsay', 'Christine', 'Alicia', 'Vanessa', 'Maria', 'Kathryn', 'Allison', 'Julie', 'Anna', 'Tara', 'Kayla', 'Natalie', 'Victoria', 'Jacqueline', 'Holly', 'Kristina', 'Patricia', 'Cassandra', 'Brandy', 'Whitney', 'Chelsea', 'Brandi', 'Catherine', 'Cynthia', 'Kathleen', 'Veronica', 'Leslie', 'Phoebe', 'Natasha', 'Krystal', 'Stacy', 'Diana', 'Monica', 'Erika', 'Dana', 'Jenna', 'Carrie', 'Leah', 'Melanie', 'Brooke', 'Karen', 'Alexandra', 'Valerie', 'Caitlin', 'Julia', 'Alyssa', 'Jasmine', 'Hannah', 'Stacey', 'Brittney', 'Susan', 'Margaret', 'Sandra', 'Candice', 'Latoya', 'Bethany', 'Misty']);
	}
]);
