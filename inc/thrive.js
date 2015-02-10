/*!
 * Thrive is a text-based RPG game - v0.1.0 
 * Build Date: 2015.02.10 
 * Docs: http://moritzcompany.com 
 * Coded @ Moritz Company 
 */ 
 
function Follower(name) {
	var self = this;

	self.name = name || "John Doe";
	self.task = new Task();
	self.strength = 1;
	self.id = _.random(1,9999);
	
	self.newTask = function (task) {
		self.task.name = task;
	};
}

function Resource(type, stock) {
	var self = this;
	
	self.quantity = stock.increase || 1;
	self.type = type;
	self.cooldown = stock.cooldown || 5000;
	
	self.increment = function(qty) {
		qty = qty || 1;
		self.quantity += qty;
	};
}

function Structure(type, stock) {
	var self = this;
	
	self.quantity = stock.qty || 1;
	self.type = type;
	self.capacity = stock.capacity || 1;
	self.size = stock.size || 1;
	
	self.increment = function(qty) {
		qty = qty || 1;
		self.quantity += qty;
	};
}

function Task() {
	var self = this;

	self.name = "idle";
}

var survivalApp = angular.module("survivalApp", []);

survivalApp.controller("SurvivalCtrl", function($scope) {
	$s = $scope;
	$s.allFollowers = [];
	$s.unlocked = {};
	$s.supply = [];
	$s.turns = 0;
	$s.plot = [];
	$s.plotMax = 20;
	$s.messagelog = [];
	$s.choice = 1;
	$s.defaultDisplay = {text: "Survival!", next: false, choices: []};
	$s.display = $s.defaultDisplay;
	$s.messages = [$s.defaultDisplay];
	$s.ready = {
		water: true,
		wood: true,
		food: true,
		clay: true,
		brick: true
	};
	
	$s.startGame = function startGame() {
		$s.gameStart = true;
		$s.addMessage("You've been running for days...");
		$s.addMessage("barely getting by on wild berries...");
		$s.addMessage("and filthy pond water.");
		$s.addMessage("This is no way to survive.");
		$s.addMessage("Which is a better place to stop?", [{
			text: "Stream (plenty of water)",
			choose: "stream",
			class: "btn btn-primary"
		}, {
			text: "Forest (plenty of wood)",
			choose: "forest",
			class: "btn btn-success"
		}]);
	};
	$s.addMessage = function addMessage(text, choices) {
		var next = !choices,
			check = $s.messages[0] == $s.defaultDisplay;
		$s.messages.push({
			text: text,
			next: next,
			choices: choices
		});
		if(check) {
			$s.nextMessage();
		}
	};
	$s.makeChoice = function makeChoice(choice) {
		switch ($s.choice) {
			case 1: 
			   $s.location = choice;
			   break;
		}
		$s.nextMessage();
		$s.choice = false;
	};
	$s.checkAvailabilty = function checkPlot() {
		var cap = $s.plotMax;
		_.forEach($s.plot, function(lot) {
			cap -= lot.quantity * lot.size;
		});
		return cap;
	};
	$s.build = function build(type) {
		var struct = _.findWhere($s.plot, {type: type}),
			info = $s.buildingTypes[type],
			available = true,
			purchase = [];

		_.forEach(info.cost, function forEachCost(eachCost) {
			var supply = _.findWhere($s.supply, {type: eachCost.name});
			if(supply) {
				if(supply.quantity >= eachCost.amount) {
					purchase.push({
						resource: supply,
						cost: eachCost.amount
					});
				} else {
					$s.addMessage("You need at least " + eachCost.amount + " " + eachCost.name + " to make a " + type + ".");
					available = false;
				}
			}
		});
		if(!available) {
			return;
		}
		if($s.checkAvailabilty() >= info.size) {
			_.forEach(purchase, function forEachPurchase(eachPurchase) {
				eachPurchase.resource.quantity -= eachPurchase.cost;
			});
			if(struct) {
				struct.increment(1);
			} else {
				$s.unlocked[info.unlock] = true;
				$s.plot.push( new Structure(type, info) );
			}
		} else {
			$s.addMessage("You don't have enough room in your plot to build a " + type + ".");
			return;
		}
	};
	$s.nextMessage = function nextMessage() {
		$s.messagelog.push( $s.messages.shift() );
		if($s.messages.length) {
			$s.display = $s.messages[0];
		} else {
			$s.display = $s.defaultDisplay;
			$s.messages.push($s.defaultDisplay);
		}
	};
	$s.coolDown = function(resource, time) {
		time = time || 5000;
		setTimeout(function() {
			$s.$apply(function() {
				$s.ready[resource] = true;
			});
		}, time);
		$s.ready[resource] = false;
	};
	$s.selectFollower = function selectFollwer(follower) {
		$s.selectedFollower = follower;
	};
	$s.deselectFollower = function selectFollwer() {
		$s.selectedFollower = {};
	};
	$s.addFollower = function addFollower() {
		var name = $s.randomPlayers.shift();
		$s.allFollowers.push( new Follower(name) );
	};
	$s.collect = function collect(resource, qty) {
		resource = typeof resource == "object" ? resource.name : resource;

		var supply = _.findWhere($s.supply, {type: resource});
		supply.increment(qty);
	};

	$s.addToSupply = function addToSupply(resource, auto) {
		resource = resource || $s.type;
		var info = $s.resourceTypes[resource],
			tempSupply = $s.supply,
			available = true;

		_.forEach(info.cost, function forEachCost(eachCost) {
			var supply = _.findWhere($s.supply, {type: eachCost.name});
			if(supply) {
				if(supply.quantity >= eachCost.amount) {
					supply.quantity -= eachCost.amount;
				} else {
					$s.addMessage("You need at least " + eachCost.amount + " " + eachCost.name + " to make a " + resource + ".");
					available = false;
				}
			}
		});
		if(!available) {
			$s.supply = tempSupply;
			return;
		}
		if(!_.isEmpty($s.selectedFollower)) {
			$s.selectedFollower.newTask(resource);
			$s.selectedFollower = {};
		}

		var supply = _.findWhere($s.supply, {type: resource});

		if(supply) {
			supply.increment(info.increase);
			if(!auto) {
				$s.coolDown(resource, supply.cooldown);
			}
		} else {
			$s.unlocked[info.unlock] = true;
			$s.supply.push( new Resource(resource, info) );
			if(!auto){
				$s.coolDown(resource, info.cooldown);
			}
		}
	};
	$s.pickFollower = function pickFollower() {
		var idle;
		_.forEach($s.allFollowers, function(eachFollower) {
			if(eachFollower.task.name == "idle") {
				idle = eachFollower;
			}
		});
		if(idle) {
			return idle;
		}
		var groups = _.groupBy($s.allFollowers, function(eachFollower) {
			return eachFollower.task.name;
		});
		groups = _.sortBy(groups, function(group) {
			return (group.length * -1);
		});
		return groups[0][0];
	};
	$s.removeFollower = function removeFollower( removedFollower ) {
		_.remove($s.allFollowers, function(eachFollower) {
			return eachFollower == removedFollower;
		});
	};
	$s.removeStructure = function removeStructure( type ) {
		var structures = _.findWhere($s.plot, {type : type});
		structures.quantity--;
	};
	$s.eat = function eat( follower ) {
		var food = _.findWhere($s.supply, {type: "food"}),
			water = _.findWhere($s.supply, {type: "water"});

		if(water.quantity && food.quantity) {
			water.quantity--;
			food.quantity--;
		} else {
			follower.newTask("idle");
		}
	};
	setInterval(function clickTicks() {
		$s.$apply(function() {
			var capacity = 0;
			$s.allFollowers.forEach(function forEachFollower(eachFollower) {
				if(eachFollower.task.name != "idle") {
					$s.addToSupply(eachFollower.task.name, true);
					$s.eat(eachFollower);
				}
			});
			_.forEach($s.plot, function(lot) {
				capacity += lot.capacity * lot.quantity;
			});
			if(capacity > $s.allFollowers.length) {
				$s.addFollower();
			} else if (capacity < $s.allFollowers.length) {
				$s.removeFollower( $s.pickFollower() );
			}
			if(!$s.unlocked.win) {
				$s.turns++;
			}
		});
	},5000);
	
	$s.resourceTypes = {
		water: {
			increase:5,
			cooldown:4000,
			cost: [{}],
			unlock: "food"
		},
		wood: {
			increase:2,
			cooldown:1000,
			cost: [{}],
			unlock: "hut"
		},
		food: {
			increase:3,
			cooldown:2000,
			cost: [{}],
			unlock: "wood"
		},
		clay: {
			increase:2,
			cooldown:2000,
			cost: [{}],
			unlock: "smelter"
		},
		brick: {
			increase:1,
			cooldown:2000,
			cost: [{
				name: "clay",
				amount: 2
			}, {
				name: "wood",
				amount: 2
			}],
			unlock: "monument"
		}
	};

	$s.buildingTypes = {
		hut: {
			size: 1,
			cooldown: 2000,
			capacity: 1,
			cost: [{
				name: "wood",
				amount: 10
			}],
			unlock: "clay"
		},
		smelter: {
			size: 2,
			cooldown: 2000,
			capacity: 0,
			cost: [{
				name: "clay",
				amount: 100
			}],
			unlock: "brick"
		},
		monument: {
			size: 10,
			cooldown: 2000,
			capacity: 0,
			cost: [{
				name: "brick",
				amount: 300
			}],
			unlock: "win"
		}
	};
	
	//  Let's randomize the 200 most popular first names of the those born in the 1980's for players
	$s.randomPlayers = _.shuffle(["Michael", "Christopher", "Matthew", "Joshua", "David", "Chandler", "James", "Daniel", "Robert", "John", "Joseph", "Jason", "Justin", "Andrew", "Ryan", "William", "Brian", "Brandon", "Jonathan", "Nicholas", "Anthony", "Eric", "Adam", "Kevin", "Thomas", "Steven", "Timothy", "Richard", "Jeremy", "Jeffrey", "Kyle", "Benjamin", "Joey", "Aaron", "Charles", "Mark", "Jacob", "Stephen", "Patrick", "Scott", "Nathan", "Paul", "Sean", "Travis", "Zachary", "Dustin", "Gregory", "Kenneth", "Jose", "Tyler", "Jesse", "Alexander", "Bryan", "Samuel", "Ross", "Derek", "Bradley", "Chad", "Shawn", "Edward", "Jared", "Cody", "Jordan", "Peter", "Corey", "Keith", "Marcus", "Juan", "Donald", "Ronald", "Phillip", "George", "Cory", "Joel", "Shane", "Douglas", "Antonio", "Raymond", "Carlos", "Brett", "Gary", "Alex", "Nathaniel", "Craig", "Ian", "Luis", "Derrick", "Erik", "Casey", "Philip", "Frank", "Evan", "Rachel", "Gabriel", "Victor", "Vincent", "Larry", "Austin", "Brent", "Seth", "Wesley", "Dennis", "Todd", "Christian", "Jessica", "Jennifer", "Amanda", "Ashley", "Sarah", "Stephanie", "Melissa", "Nicole", "Elizabeth", "Heather", "Tiffany", "Michelle", "Amber", "Megan", "Amy", "Kimberly", "Christina", "Lauren", "Crystal", "Brittany", "Rebecca", "Laura", "Danielle", "Emily", "Samantha", "Angela", "Erin", "Kelly", "Sara", "Lisa", "Katherine", "Andrea", "Jamie", "Mary", "Erica", "Courtney", "Kristen", "Shannon", "April", "Katie", "Lindsey", "Kristin", "Lindsay", "Christine", "Alicia", "Vanessa", "Maria", "Kathryn", "Allison", "Julie", "Anna", "Tara", "Kayla", "Natalie", "Victoria", "Jacqueline", "Holly", "Kristina", "Patricia", "Cassandra", "Brandy", "Whitney", "Chelsea", "Brandi", "Catherine", "Cynthia", "Kathleen", "Veronica", "Leslie", "Phoebe", "Natasha", "Krystal", "Stacy", "Diana", "Monica", "Erika", "Dana", "Jenna", "Carrie", "Leah", "Melanie", "Brooke", "Karen", "Alexandra", "Valerie", "Caitlin", "Julia", "Alyssa", "Jasmine", "Hannah", "Stacey", "Brittney", "Susan", "Margaret", "Sandra", "Candice", "Latoya", "Bethany", "Misty"]);
});
