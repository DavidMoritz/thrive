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

<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
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

			if (!_.findWhere($s.messages, message)) {
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

			_.forEach($s.getStructurePrice(structure), function eachCostItem(costItem) {
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

		$s.getStructurePrice = function getStructurePrice(structure) {
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

			if (!auto) {
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
			groups = _.sortBy(groups, function sortGroups(group) {
				return (group.length * -1);
			});

			return groups[0][0];
		};

		$s.removeWorker = function removeWorker(removedWorker) {
			_.remove($s.workers, function checkWorker(eachWorker) {
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
