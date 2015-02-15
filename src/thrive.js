thriveApp.controller('ThriveCtrl', [
	'$scope',
	'$interval',
	'$timeout',
	'HelperFactory',
	function ThriveCtrl($s, $interval, $timeout, HelperFactory) {
		'use strict';

		function Task(options) {
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
		}

		function Worker(name) {
			var self = _.merge(this, {
				name: name,
				task: new Task(null),
				strength: 1
			});

			self.assignTask = function assignTask(resource) {
				self.task = new Task(_.isObject(resource) ? {
					name: 'resourceCollector',
					resource: resource
				} : null);
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
			_.merge(this, {
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
			return _.find($s.supply, function findResource(palette) {
				return palette.resource.name === resourceName;
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
			HF: HelperFactory
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

		$s.toggleWorkerSelection = function toggleWorkerSelection(worker) {
			$s.selectedWorker = $s.isSelected(worker) ? null : worker;
		};

		$s.addWorker = function addWorker() {
			var name = HelperFactory.workerNames.shift();
			$s.workers.push( new Worker(name) );
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

			if ($s.selectedWorker) {
				$s.selectedWorker.assignTask(resource);
				$s.selectedWorker = null;
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

		$s.pickWorker = function pickWorker() {
			var idleWorker = _.find($s.workers, function findIdleWorkers(worker) {
				return worker.task.name = 'idle';
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
			getLotStructure(structure).quantity--;
		};

		$s.eat = function eat(worker) {
			var food = getSupplyResource('food');
			var water = getSupplyResource('water');

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
			var capacity = 0;
			$s.workers.forEach(function eachWorker(worker) {
				if (worker.task.name === 'resourceCollector') {
					$s.addToSupply(worker.task.resource, true);
					// I'd rather 'eat' be a worker method, but I don't know how
					$s.eat(worker);
				}
			});
			_.forEach($s.lots, function eachLot(lot) {
				capacity += lot.structure.capacity * lot.quantity;
			});
			if (capacity > $s.workers.length) {
				$s.addWorker();
			} else if (capacity < $s.workers.length) {
				$s.removeWorker( $s.pickWorker() );
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

		$s.structures = [
			new Structure({
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
			new Structure({
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
			new Structure({
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
		];

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
	}
]);
