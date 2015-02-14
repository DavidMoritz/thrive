var thriveApp = angular.module('thriveApp', []);

thriveApp.run(function runWithDependencies($rootScope) {
	$rootScope._ = window._;
});
