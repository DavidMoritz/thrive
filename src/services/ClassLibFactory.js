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
