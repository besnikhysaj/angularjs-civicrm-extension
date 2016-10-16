(function(angular, $, _) {

	angular.module('civicrm')

	.config(function($routeProvider) {
		$routeProvider.when('/membershiplist', {
			controller: 'CivicrmMembershipCtrl',
			templateUrl: '~/civicrm/MembershipCtrl.html',
			resolve: {
				Memberships: function(crmApi) {
					return crmApi('Membership', 'get', {
						sequential: 1,
						end_date: {">":"2016-09-15"},
						//status_id: "Current"
						return: ["contact_id.id", "contact_id.sort_name","membership_type_id.name","start_date","end_date","source","join_date"]
					});
				}
			}
		});
	})

  	// The controller uses *injection*. This default injects a few things:
  	//   $scope -- This is the set of variables shared between JS and HTML.
  	//   crmApi, crmStatus, crmUiHelp -- These are services provided by civicrm-core.
  	.controller('CivicrmMembershipCtrl', function($scope, crmApi, crmStatus, crmUiHelp, Memberships) {
		// The ts() and hs() functions help load strings for this module.
		var ts = $scope.ts = CRM.ts('civicrm');
		var hs = $scope.hs = crmUiHelp({file: 'CRM/civicrm/MembershipCtrl'}); // See: templates/CRM/civicrm/MembershipCtrl.hlp

		$scope.tableName = ts('List of Members');

		var fixKeys = function(results){
			if(results && results.values) {
				var memberships = [];
				for (var i = 0; i < results.values.length; i++) {
					var tt = {};
					member = results.values[i];
					for (var k in member){
						if (member.hasOwnProperty(k)) {
							if(k == "contact_id.id"){
								tt["contact_id"] = member[k];
							} else if(k == "contact_id.sort_name"){
								tt["name"] = member[k];
							} else if(k == "membership_type_id.name"){
								tt["type"] = member[k];
							} else {
								tt[k] = member[k];
							}
						}
					}
					memberships.push(tt);
				}
			}
			return memberships;
		};

		$scope.basePath = Drupal.settings.basePath;
		$scope.propertyName = 'start_date';
		$scope.reverse = true;

		$scope.memberships = fixKeys(Memberships);

		$scope.sortBy = function sortBy(propertyName) {
			$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
			$scope.propertyName = propertyName;
		};

		$scope.filterData = function filterData(filter){
			console.log(filter);
			if(filter){
				start_date = [];
				if(filter.start_date){
					start_date = moment(filter.start_date).format("YYYY-MM-DD");
				}
				if(filter.from_start_date){
					start_date = {">=" : moment(filter.from_start_date).format("YYYY-MM-DD")};
				}
				if(filter.to_start_date){
					start_date = {"<=" : moment(filter.to_start_date).format("YYYY-MM-DD")};
				}
				if(filter.from_start_date && filter.to_start_date){
					start_date = {
						">=" : moment(filter.from_start_date).format("YYYY-MM-DD"),
						"<=" : moment(filter.to_start_date).format("YYYY-MM-DD")
					};
				}
				CRM.api3('Membership', 'get', {
					sequential: 1,
					return: ["contact_id.sort_name","membership_type_id.name","start_date","end_date","source","join_date","contact_id.id"],
					start_date: start_date,
					//status_id: "Current"
				}).done(function(result) {
					console.log(result);
					setTimeout(function () {
						$scope.$apply(function () {
							$scope.tableName = ts('Search Results');
							$scope.memberships = fixKeys(result);
						});
					});
				});
			}

		};

		$scope.filterName = function filterName(membersName){
			if(membersName){
				CRM.api3('Membership', 'get', {
					sequential: 1,
					return: ["contact_id.sort_name","membership_type_id.name","start_date","end_date","source","join_date","contact_id.id"],
					"contact_id.display_name": {"LIKE":"%"+membersName+"%"}
				}).done(function(result) {
					console.log(result);
					setTimeout(function () {
						$scope.$apply(function () {
							$scope.tableName = ts('Search Results');
							$scope.memberships = fixKeys(result);
						});
					});
				});
			}
		};

	})

  	.filter('formatData', function() {
  		return function(input) {
  			if(!!input){
  				result = moment(input).format("DD.MM.YYYY");
  			} else {
  				result = "";
  			}
  			return result;
  		}
  	})

  	.directive('ngEnter', function () 
  	{
  		return function (scope, element, attrs) {
  			element.bind("keydown keypress", function (e) {
  				var code = (e.keyCode ? e.keyCode: e.which);
  				if((code === 13) || (code === 10)) {
  					scope.$apply(function (){
  						scope.$eval(attrs.ngEnter);
  					});
  					e.preventDefault();
  				}
  			});
  		};
  	});

  })(angular, CRM.$, CRM._);