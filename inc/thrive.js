/*!
 * Thrive is a text-based RPG - v0.2.0 
 * Build Date: 2015.02.23 
 * Docs: http://moritzcompany.com 
 * Coded @ Moritz Company 
 */ 
 
var thriveApp = angular.module('thriveApp', []);

thriveApp.run(function runWithDependencies($rootScope) {
	$rootScope._ = window._;
});

thriveApp.factory('ClassLibFactory', [
	function ClassLibFactory() {
		'use strict';

		var defaultCooldownTime = 5000;
		var defaultPriceIncrease = 0.1;
		var CLF = this;
		_.assign(CLF, {
			Task: function Task(options) {
				var idleTask = {
					name: 'idle',
					icon: 'fa-facebook-square',
					text: 'Idle'
				};

				var self = _.merge(this, options || idleTask);

				self.displayName = function displayName() {
					return self.resource ? self.resource.text : self.text;
				};

				self.getIcon = function getIcon() {
					return self.resource ? self.resource.icon : self.icon;
				};
			},

			Worker: function Worker(name) {
				var self = _.merge(this, {
					name: name,
					task: new CLF.Task(null),
					strength: 1
				});

				self.assignTask = function assignTask(resource) {
					self.task = new CLF.Task(_.isObject(resource) ? {
						name: 'resourceCollector',
						resource: resource
					} : null);
				};
			},

			SupplyResource: function SupplyResource(options) {
				_.merge(this, {
					quantity: options.quantity || 0,
					resource: new CLF.Resource(options.resource)	//	pass in object with resource parameter
				});
			},

			LotStructure: function LotStructure(options) {
				_.merge(this, {
					quantity: options.quantity || 0,
					structure: new CLF.Structure(options.structure)
				});
			},

			Resource: function Resource(resourceOptions) {
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
			},

			Structure: function Structure(structureOptions) {
				_.merge(this, {
					cooldown: defaultCooldownTime,
					priceIncrease: defaultPriceIncrease
				}, _.pick(structureOptions, [
					'name',
					'text',
					'icon',
					'size',
					'capacity',
					'cooldown',
					'cost',
					'priceIncrease',
					'unlock'
				]));
			},

			Choice: function Choice(choiceOptions) {
				_.merge(this, {
					css: ['btn', 'btn-default']
				}, _.pick(choiceOptions, [
					'subject',
					'buttonText',
					'display',
					'css'
				]));
			}
		});

		return CLF;
	}
]);

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
					cooldown: 500,
					cost: [],
					unlock: 'food'
				}),
				new CLF.Resource({
					name: 'food',
					icon: 'fa-cutlery',
					text: 'Gather food',
					qtyPerLoad: 3,
					cooldown: 500,
					cost: [],
					unlock: 'wood'
				}),
				new CLF.Resource({
					name: 'wood',
					icon: 'fa-tree',
					text: 'Chop Wood',
					qtyPerLoad: 2,
					cooldown: 500,
					cost: [],
					unlock: 'hut'
				}),
				new CLF.Resource({
					name: 'clay',
					icon: 'fa-cloud',
					text: 'Dig Clay',
					qtyPerLoad: 2,
					cooldown: 500,
					cost: [],
					unlock: 'smelter'
				}),
				new CLF.Resource({
					name: 'brick',
					icon: 'fa-pause fa-rotate-90',
					text: 'Make brick',
					qtyPerLoad: 1,
					cooldown: 500,
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
					priceIncrease: 0.2,
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
					priceIncrease: 0,
					unlock: 'win'
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

thriveApp.controller('ThriveCtrl', [
	'$scope',
	'$interval',
	'$timeout',
	'ClassLibFactory',
	'HelperFactory',
	function ThriveCtrl($s, $interval, $timeout, CLF, HF) {
		'use strict';

		function getSupplyPaletteByResource(resourceOrName) {
			// this accepts EITHER a resource object OR a resource name
			var resourceName = _.isObject(resourceOrName) ? resourceOrName.name : resourceOrName;
			return _.find($s.supply, function findResource(palette) {
				return palette.resource.name === resourceName;
			}) || null;	//	returns an object with parameters of 'resource' and 'quantity' (or null)
		}

		function getLotByStructure(structureOrName) {
			// this accepts EITHER a structure object OR a structure name
			var structureName = _.isObject(structureOrName) ? structureOrName.name : structureOrName;
			return _.find($s.lots, function findStructure(lot) {
				return lot.structure.name === structureName;
			}) || null;	//	returns an object with parameters of 'resource' and 'quantity' (or null)
		}

		function getStructurePrice(structure) {
			var baseStructure = _.findWhere(HF.structures, {name: structure.name});
			var currentPrice = _.cloneDeep(baseStructure.cost);

			var existingLot = getLotByStructure(structure);
			if (existingLot) {
				_.forEach(existingLot.structure.cost, function eachCostItem(costItem) {
					//	TODO: refactor this with reduce
					for (var i = 0; i < existingLot.quantity; i++) {
						var currentPriceResource = _.findWhere(currentPrice, {name: costItem.name});
						currentPriceResource.amount = Math.round(currentPriceResource.amount * (1 + baseStructure.priceIncrease));
					}
				});
			}
			return currentPrice;
		}

		var maxLots = 30;

		//	initialize scoped variables
		_.assign($s, {
			workers: [],
			unlocked: ['water'],
			supply: [],
			turns: 0,
			lots: [],
			messagelog: [],
			decisionToMake: null,
			defaultDisplay: {text: 'Thrive!', next: false, choices: []},
			display: null,
			messages: [],
			selectedWorker: null,
			location: null,
			gameStarted: false,
			readyToWork: true,
			HF: HF	//	now we can use it in the view
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
			$s.addMessage('Which is a better place to stop?', HF.locations);
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
			//	TODO: refactor to use _.reduce for style bonus (see other _.reduce function in this file)
			var cap = _.clone(maxLots);
			_.forEach($s.lots, function eachLot(lot) {
				cap -= lot.quantity * lot.structure.size;
			});
			return cap;
		};

		$s.build = function build(structure) {
			var available = true;
			var purchase = [];

			_.forEach(getStructurePrice(structure), function eachCostItem(costItem) {
				var supplyResource = getSupplyPaletteByResource(costItem);
				if (supplyResource && supplyResource.quantity >= costItem.amount) {
						purchase.push({
							resource: supplyResource.resource,
							cost: costItem.amount
						});
				} else {
					$s.addMessage('You need at least ' + costItem.amount + ' ' + costItem.name + ' to make a ' + structure.name + '.');
					available = false;
				}
			});
			if (!available) {
				return;
			}
			if ($s.checkAvailabilty() >= structure.size) {
				_.forEach(purchase, function eachPurchase(purchase) {
					getSupplyPaletteByResource(purchase.resource).quantity -= purchase.cost;
				});

				if (!getLotByStructure(structure)) {
					$s.unlocked.push(structure.unlock);
					$s.lots.push(new CLF.LotStructure({
						structure: new CLF.Structure(structure)
					}));
				}
				getLotByStructure(structure).quantity += 1;
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
			}, time || HF.defaultCooldownTime);
		};

		$s.toggleWorkerSelection = function toggleWorkerSelection(worker) {
			$s.selectedWorker = $s.isSelected(worker) ? null : worker;
		};

		$s.addWorker = function addWorker() {
			var name = HF.workerNames.shift();
			$s.workers.push( new CLF.Worker(name) );
		};

		$s.addToSupply = function addToSupply(resource, auto) {
			var available = true;

			_.forEach(resource.cost, function eachCostItem(costItem) {
				var supplyCostItem = getSupplyPaletteByResource(costItem);
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

			if ($s.selectedWorker && !auto) {
				$s.selectedWorker.assignTask(resource);
				$s.selectedWorker = null;
			}

			if (!getSupplyPaletteByResource(resource)) {
				$s.supply.push(new CLF.SupplyResource({
					resource: new CLF.Resource(resource)
				}));

				if (resource.unlock) {
					$s.unlocked.push(resource.unlock);
				}
			}

			getSupplyPaletteByResource(resource).quantity += resource.qtyPerLoad;

			if (!auto){
				$s.coolDown(resource, resource.cooldown);
			}
		};

		$s.pickWorker = function pickWorker() {
			var idleWorker = _.find($s.workers, function findIdleWorkers(worker) {
				return worker.task.name === 'idle';
			});
			if (idleWorker) {
				return idleWorker;
			}
			var groups = _.groupBy($s.workers, function eachWorker(worker) {
				return worker.task.name;
			});
			groups = _.sortBy(groups, function(group) {
				return (group.length * -1);
			});
			return groups[0][0];
		};

		$s.removeWorker = function removeWorker(removedWorker) {
			_.remove($s.workers, function(eachWorker) {
				return eachWorker == removedWorker;
			});
		};

		$s.removeStructure = function removeStructure(structure) {
			getLotByStructure(structure).quantity--;
		};

		$s.feed = function feed(worker) {
			var food = getSupplyPaletteByResource('food');
			var water = getSupplyPaletteByResource('water');

			if (water.quantity && food.quantity) {
				water.quantity--;
				food.quantity--;
			} else {
				worker.assignTask(null);
			}
		};

		$s.isSelected = function isSelected(worker) {
			return $s.selectedWorker && worker.name === $s.selectedWorker.name;
		};

		$interval(function clickTicks() {
			$s.workers.forEach(function eachWorker(worker) {
				if (worker.task.resource) {
					$s.addToSupply(worker.task.resource, true);
					// I'd rather 'feed' be a worker method, but I don't know how
					$s.feed(worker);
				}
			});

			var workerCapacity = _.reduce($s.lots, function calculateCapacity(workerCapacity, lot) {
				return workerCapacity + (lot.structure.capacity * lot.quantity);
			}, 0);

			if (workerCapacity > $s.workers.length) {
				$s.addWorker();
			} else if (workerCapacity < $s.workers.length) {
				$s.removeWorker( $s.pickWorker() );
			}
			if (!_.contains($s.unlocked, 'win')) {
				$s.turns++;
			}
		}, HF.defaultCooldownTime, $s.turns);

		$s.isUnlocked = function isUnlocked(valueToCheck) {
			return _.contains($s.unlocked, valueToCheck);
		};

		$s.skipToMiddle = function skipToMiddle() {
			_.assign($s, {
				gameStarted: true,
				location: new CLF.Choice({
					subject: 'location',
					buttonText: 'Stream (more water)',
					display: 'Stream',
					css: ['btn', 'btn-primary']
				}),
				unlocked: ['water', 'food', 'wood', 'clay', 'brick', 'hut', 'smelter', 'monument'],
				lots: [],
				supply: []
			});
			_.forEach(HF.resources, function eachResource(resource) {
				$s.supply.push(new CLF.SupplyResource({
					resource: new CLF.Resource(resource),
					quantity: 100
				}));
			});
			_.forEach(HF.structures, function eachStructure(structure) {
				if (structure.name !== 'monument') {
					$s.lots.push(new CLF.LotStructure({
						structure: new CLF.Structure(structure),
						quantity: 7
					}));
				}
			});
		};
	}
]);
