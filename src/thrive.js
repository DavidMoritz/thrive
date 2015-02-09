function Follower(name) {
	var self = this;

	self.name = name || "John Doe";
	self.task = new Task();
	self.strength = 1;
	
	self.newTask = function (task) {
	    self.task.name = task;
	};
}

function Resource(type, qty, time) {
	var self = this;
	
	self.quantity = qty || 1;
	self.type = type;
	self.cooldown = time || 5000;
	
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
	$s.supply = [];
    $s.messagelog = [];
    $s.choice = 1;
	$s.defaultDisplay = {text: "Survival!", next: false, choices: []};
	$s.display = $s.defaultDisplay;
    $s.messages = [$s.defaultDisplay];
	$s.ready = {
		water: true,
		wood: true
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
        $s.nextMessage();
	};
	$s.addMessage = function addMessage(text, choices) {
	    var next = !choices;
	    $s.messages.push({
	        text: text,
	        next: next,
	        choices: choices
	    });
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
	$s.nextMessage = function nextMessage() {
	    $s.messagelog.push( $s.messages.shift() );
	    if($s.messages.length) {
	        $s.display = $s.messages[0];
	    } else {
	        $s.display = $s.defaultDisplay;
	    }
	};
	$s.coolDown = function(resource, time) {
		time = time || 5000;
		setTimeout(function() {
			$s.ready[resource] = true;
			$s.$apply();
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

	$s.addToSupply = function addToSupply(resource, qty, time) {
		resource = resource || $s.type;
		if(!_.isEmpty($s.selectedFollower)) {
		    $s.selectedFollower.newTask(resource);
            $s.selectedFollower = {};
		}

		var supply = _.findWhere($s.supply, {type: resource});

		if(supply) {
			supply.increment(qty);
			$s.coolDown(resource, supply.cooldown);
		} else {
			$s.supply.push( new Resource(resource, qty, time) );
			$s.coolDown(resource, time);
		}
	};
	$s.removeFollower = function removeFollower( idx ) {
		$s.allFollowers.splice(idx, 1);
	};
	setInterval(function clickTicks() {
	    $s.allFollowers.forEach(function forEachFollower(eachFollower) {
	        if(eachFollower.task.name != "idle") {
	           $s.collect(eachFollower.task, eachFollower.strength);
	        }
	    });
        $s.$apply();
	},5000);
	
	
	//  Let's randomize the 200 most popular first names of the those born in the 1980's for players
	$s.randomPlayers = _.shuffle(["Michael", "Christopher", "Matthew", "Joshua", "David", "Chandler", "James", "Daniel", "Robert", "John", "Joseph", "Jason", "Justin", "Andrew", "Ryan", "William", "Brian", "Brandon", "Jonathan", "Nicholas", "Anthony", "Eric", "Adam", "Kevin", "Thomas", "Steven", "Timothy", "Richard", "Jeremy", "Jeffrey", "Kyle", "Benjamin", "Joey", "Aaron", "Charles", "Mark", "Jacob", "Stephen", "Patrick", "Scott", "Nathan", "Paul", "Sean", "Travis", "Zachary", "Dustin", "Gregory", "Kenneth", "Jose", "Tyler", "Jesse", "Alexander", "Bryan", "Samuel", "Ross", "Derek", "Bradley", "Chad", "Shawn", "Edward", "Jared", "Cody", "Jordan", "Peter", "Corey", "Keith", "Marcus", "Juan", "Donald", "Ronald", "Phillip", "George", "Cory", "Joel", "Shane", "Douglas", "Antonio", "Raymond", "Carlos", "Brett", "Gary", "Alex", "Nathaniel", "Craig", "Ian", "Luis", "Derrick", "Erik", "Casey", "Philip", "Frank", "Evan", "Rachel", "Gabriel", "Victor", "Vincent", "Larry", "Austin", "Brent", "Seth", "Wesley", "Dennis", "Todd", "Christian", "Jessica", "Jennifer", "Amanda", "Ashley", "Sarah", "Stephanie", "Melissa", "Nicole", "Elizabeth", "Heather", "Tiffany", "Michelle", "Amber", "Megan", "Amy", "Kimberly", "Christina", "Lauren", "Crystal", "Brittany", "Rebecca", "Laura", "Danielle", "Emily", "Samantha", "Angela", "Erin", "Kelly", "Sara", "Lisa", "Katherine", "Andrea", "Jamie", "Mary", "Erica", "Courtney", "Kristen", "Shannon", "April", "Katie", "Lindsey", "Kristin", "Lindsay", "Christine", "Alicia", "Vanessa", "Maria", "Kathryn", "Allison", "Julie", "Anna", "Tara", "Kayla", "Natalie", "Victoria", "Jacqueline", "Holly", "Kristina", "Patricia", "Cassandra", "Brandy", "Whitney", "Chelsea", "Brandi", "Catherine", "Cynthia", "Kathleen", "Veronica", "Leslie", "Phoebe", "Natasha", "Krystal", "Stacy", "Diana", "Monica", "Erika", "Dana", "Jenna", "Carrie", "Leah", "Melanie", "Brooke", "Karen", "Alexandra", "Valerie", "Caitlin", "Julia", "Alyssa", "Jasmine", "Hannah", "Stacey", "Brittney", "Susan", "Margaret", "Sandra", "Candice", "Latoya", "Bethany", "Misty"]);
});
