/*jshint esversion: 6 */
/*jslint devel: true */
/*jslint jquery: true */
/*jshint strict:false */
/*jshint node: true */
/*jslint browser: true */
/*global angular:false */
/*global google:false */
/*global MarkerWithLabel:false */
/*global lightGallery:false */
'use strict';

angular.module('metathesisApp')

.constant('config', {  
  apiUrl: 'https://localhost:3443/', //secure
  //apiUrl: 'https://localhost:3000/',
  userDir: './public/users',
  baseUrl: '/',
  enableDebug: true,
  maxFileSize: 2097152,
})

.config(function(uiSelectConfig) {

})

.config(function(ngSpinOpsProvider){
	ngSpinOpsProvider.setOps({
		autoGlobal : false,
		spinner : 'worm',
		size : 'normal',
		color : '#C2B7B1',
		position : 'center',
		blocking : false,
		delay : 0,
		extend : 100
	});
})

.config(function(paginationTemplateProvider) {
    paginationTemplateProvider.setPath('../bower_components/angularUtils-pagination/dirPagination.tpl.html');
})

.controller('InfoModalController', ['ngDialog', '$timeout', function (ngDialog, $timeout) {
	$timeout(function () {
		ngDialog.close();
	}, 4000);	
}])

.run(function($parse, $rootScope, $state, $stateParams, profileFactory, $timeout, ngDialog, gettextCatalog) {
	
	gettextCatalog.debug = true;
	
	//$rootScope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
	$rootScope.reloadState = 0;
	
	$rootScope.tinymceOptionsFull = {
		onChange: function(e) {
		},
		height: 250,
		max_height: 800,
		inline: false,
		plugins : 'placeholder advlist autolink link image lists fullscreen table textcolor',
		skin: 'lightgray',
		toolbar: "undo redo | cut copy paste | table  insert | formatselect forecolor bold italic | alignleft aligncenter alignright alignjustify  | removeformat | numlist bullist | fullscreen  ",
		insert_button_items: 'image link',
		menubar: false,
		allow_html_in_named_anchor: true,
		element_format : 'html',
		content_style: "div, p { font-size: 18px; }"
	};
	
	$rootScope.tinymceOptionsMid = {
		onChange: function(e) {
		},
		height: 200,
		max_height: 600,
		inline: false,
		plugins : 'placeholder advlist autolink link image lists fullscreen table textcolor',
		skin: 'lightgray',
		toolbar: "undo redo | cut copy paste | table  insert | formatselect forecolor bold italic | alignleft aligncenter alignright alignjustify  | removeformat | numlist bullist | fullscreen  ",
		insert_button_items: 'image link',
		insert_toolbar: 'image link',
		menubar: false,
		allow_html_in_named_anchor: true,
		element_format : 'html',
		content_style: "div, p { font-size: 18px; }"
	};
	
	$rootScope.tinymceOptionsMin = {
		onChange: function(e) {
		},
		height: 150,
		max_height: 500,
		inline: false,
		plugins : 'placeholder advlist autolink lists fullscreen textcolor',
		skin: 'lightgray',
		statusbar: false,
		toolbar: "undo redo | cut copy paste | link | forecolor bold italic | removeformat | numlist bullist | fullscreen ",
		menubar: false,
		allow_html_in_named_anchor: true,
		element_format : 'html',
		content_style: "div, p { font-size: 18px; }"
	};
	
	$rootScope.modalInfo = function (div, title, message, goback = false) {
		$rootScope.infodiv = div;
		$rootScope.info = title;
		$rootScope.infomid = message;
		ngDialog.open({ 
			template: 'views/infomodal.html',
			scope: $rootScope,
			className: 'ngdialog-theme-default',
			showClose: false,
			controller:"InfoModalController"
		});
    };
	
	$rootScope.modalConfirm = function (div, title, message, buttons) {
		$rootScope.infodiv = div;
		$rootScope.info = title;
		$rootScope.infomid = message;
		$rootScope.infoOk = buttons;
		ngDialog.openConfirm({ 
			template: 'views/infomodal.html',
			scope: $rootScope,
			className: 'ngdialog-theme-default',
			showClose: false,
			closeByEscape: true, 
			closeByDocument: false,
			preCloseCallback:function(){}
		});
	};
	
	$rootScope.reLoadProfile = function(){
		$rootScope.profile = profileFactory.get({
			id: $rootScope.profileid
		})
		.$promise.then(
			function (response) {										
				$rootScope.profile = response;
			
				$timeout(function () {								
					$state.go($state.current, {}, {reload: true});
				}, 2000);
			},
			function (response) {
				if(response.status == 401 || response.status == 403){
					console.log('Error status ',response.status );
					$rootScope.openLogin();
				}else{					
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
			}
		);
	};
	
	$rootScope.swapLang = function(tasklangArray){
		var result = [];
		var exit = false;
		$rootScope.profile.morelang.forEach(function(userlang, n, arrUserLang){
			tasklangArray.forEach(function(tasklang, m, arrTaskLang){
				if (userlang.code == tasklang.lang.code){
					if( m != 0 ){
						var firstElem = tasklangArray[0];
						tasklangArray[0] = tasklangArray[m];
						tasklangArray[m] = firstElem;
					}
					result = tasklangArray;
					var swapped = true;
					result.push(swapped);
					exit = true;
					return;
				}
			});
			if(exit == true){
				return;
			}
		});
		if (exit == true){
			return result;
		}else{
			var swapped = false;
			tasklangArray.push(swapped);
			return tasklangArray;
		}		
	};
	
	$rootScope.cancelLogin = function(){
		if($rootScope.goback === true){
			history.back();
			$rootScope.goback = false;
		}
	};
	
	$rootScope.setStyle = function(status){
		if (status == 'Applicant'){
			return 'yellow';
		}
		if (status == 'Accepted' || status == 'Performer'){
			return '#00CE00';
		}
		if (status == 'Denied'){
			return '#F54B4B';
		}
	};
	
	
	$rootScope.clearfield = function (id){
		document.getElementById(id).value= " " ;
	};
	
	$rootScope.setStatus = [
/* 		{
			id: 1,
			title: 'OPEN',
			color: '#00CE00'
		}, */
		{
			id: 2,
			title: 'PERFORMING',
			color: 'yellow'
		},
		{
			id: 3,
			title: 'COMPLETE',
			color: '#3395FB'
		},
		{
			id: 4,
			title: 'CANCELED',
			color: 'gray'
		}
	];
	
	$rootScope.categoryPlaceholder = gettextCatalog.getString("Please, click here to select task category from list");
	
	//$rootScope.categoryPlaceholder = 'Please, click here to select task category from list';
	
	$rootScope.categoryArray = [
		{
			group: 'Placeholder', color: '#FFF', fontcolor: '#555',
			content:[
				{},
				{name: $rootScope.categoryPlaceholder, color: '#FFF', fontcolor: '#555'}		
			]
		},
		
		{
			group: 'Emergency', color: '#F58D8D', fontcolor: '#2A2418',
			content:[
				{},
				{id: 1, name: 'Life is in danger!', fontcolor: '#2A2418', color: '#F54B4B'},			
				{id: 2, name: 'I urgently need help!', fontcolor: '#2A2418', color: '#F54B4B'}		
			]
		},
		{
			group: 'Task', color: '#BEE386', fontcolor: '#2A2418',
			content:[
				{},
				{id: 3, name: 'I set the task', fontcolor: '#2A2418', color: '#8EE30F'},
				{id: 4, name: 'I am performing tasks', fontcolor: '#2A2418', color: '#8EE30F'}
			]
		},
		{
			group: 'Commerce', color: '#A7D5FF', fontcolor: '#2A2418',
			content:[
				{},
				{id: 5, name: 'I sell', fontcolor: '#2A2418', color: '#6FB7FF'},
				{id: 6, name: 'I will buy', fontcolor: '#2A2418', color: '#6FB7FF'},
				{id: 7, name: 'I am changing', fontcolor: '#2A2418', color: '#6FB7FF'}
			]
		},
		{
			group: 'Help', title: 'Please, select task category', color: '#FFAC67', fontcolor: '#2A2418',
			content:[
				{},
				{id: 8, name: 'Help me, please!', fontcolor: '#2A2418', color: '#FF7300'},
				{id: 9, name: 'I want to help', fontcolor: '#2A2418', color: '#FF7300'}
			]
		}];	
	
	$rootScope.tags = ['help', 'emergency', 'translate'];
	
	$rootScope.nlangPlaceholder = 'Please, click here to select native language';
	
	$rootScope.mainLangArray1 = [
		{
			group: 'Placeholder', color: '#FFF', fontcolor: '#555',
			content:[
				{},
				{title: $rootScope.nlangPlaceholder, color: '#FFF', fontcolor: '#555'}
			
			]
		},
		{
			group: 'Interface language list', color: '#FFF', fontcolor: '#555',
			content:[
				{},
				{id: 'en', title: 'English', color: '#FFF', fontcolor: '#2A2418'},			
				{id: 'ru', title: 'Русский', color: '#FFF', fontcolor: '#2A2418'}			
			]
		}
	];
	
	$rootScope.mainLangArray =[				
				{id: 'en', title: 'English'},			
				{id: 'ru', title: 'Русский'}			
			];
	
	
	
	$rootScope.userLang = navigator.language || navigator.userLanguage;
	//$rootScope.userLang = 'ru';
	
	function checkLang(item){
		if(item.id == $rootScope.userLang) return true;
	}	
	var exist = $rootScope.mainLangArray.some(checkLang);
		//console.log('exist is ' + exist);	
	if(!exist){
		$rootScope.userLang = 'en';
	}else{
		gettextCatalog.setCurrentLanguage($rootScope.userLang);
	}
	
	//console.log("The language set to: " + $rootScope.userLang);	
	
	$rootScope.toggleMarkers = function () {					
		$rootScope.markers.forEach(function(item, i, arr) {

			var filter = {};
			var statusTask1;
			var statusTask2;
			var statusTask3;
			
			
			var marker = $rootScope.markers[i];
			if (marker.nameArray == 'usertasks'){
				filter.query = $rootScope.taskFilter.usertasksFilter;
				statusTask1 = $rootScope.statFilter.statTask1;
				statusTask2 = $rootScope.statFilter.statTask2;
				statusTask3 = $rootScope.statFilter.statTask3;
			}
			if (marker.nameArray == 'recommendeds'){
				filter.query = $rootScope.taskFilter.recommendedsFilter;
				statusTask1 = $rootScope.statFilter.statTask1;
				statusTask2 = false;
				statusTask3 = false;				
			}
			if (marker.nameArray == 'choiseds'){
				filter.query = $rootScope.taskFilter.choisedsFilter;
				statusTask1 = $rootScope.statFilter.statTask1;
				statusTask2 = $rootScope.statFilter.statTask2;
				statusTask3 = $rootScope.statFilter.statTask3;
			}			
			if (marker.nameArray == 'fresh'){
				filter.query = $rootScope.taskFilter.freshFilter;
				statusTask1 = $rootScope.statFilter.statTask1;
				statusTask2 = false;
				statusTask3 = false;
			}
			if (marker.nameArray == 'local'){
				filter.query = $rootScope.taskFilter.localFilter;
				statusTask1 = $rootScope.statFilter.statTask1;
				statusTask2 = false;
				statusTask3 = false;				
			}			
			if (marker.nameArray == 'regional'){
				filter.query = $rootScope.taskFilter.regionalFilter;
				statusTask1 = $rootScope.statFilter.statTask1;
				statusTask2 = false;
				statusTask3 = false;				
			}
			
			if (marker.nameArray == 'system'){
				marker.setVisible(true);
			}
			
			if (filter.query === true){
				if(marker.category == 1 || marker.category == 2){
					if($rootScope.catFilter.catGroup1 === true){
						if(marker.status == 1){
							if(statusTask1 === true){
								if(marker.familiarLang == false && $rootScope.taskFilter.langFilter == true){
									marker.setVisible(false);
								}else{
									marker.setVisible(true);
								}
							}else{
								marker.setVisible(false);
							}									
						}else if (marker.status == 2){
							if(statusTask2 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}else if (marker.status == 3){
							if(statusTask3 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}
					}else{
						marker.setVisible(false);
					}
				}else if(marker.category == 3 || marker.category == 4){
					if($rootScope.catFilter.catGroup2 === true){
						if(marker.status == 1){
							if(statusTask1 === true){
								if(marker.familiarLang == false && $rootScope.taskFilter.langFilter == true){
									marker.setVisible(false);
								}else{
									marker.setVisible(true);
								}
							}else{
								marker.setVisible(false);
							}									
						}else if (marker.status == 2){
							if(statusTask2 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}else if (marker.status == 3){
							if(statusTask3 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}
					}else{
						marker.setVisible(false);
					}
				}else if(marker.category == 5 || marker.category == 6 || marker.category == 7){
					if($rootScope.catFilter.catGroup3 === true){
						if(marker.status == 1){
							if(statusTask1 === true){
								if(marker.familiarLang == false && $rootScope.taskFilter.langFilter == true){
									marker.setVisible(false);
								}else{
									marker.setVisible(true);
								}
							}else{
								marker.setVisible(false);
							}									
						}else if (marker.status == 2){
							if(statusTask2 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}else if (marker.status == 3){
							if(statusTask3 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}
					}else{
						marker.setVisible(false);
					}
				}else if(marker.category == 8 || marker.category == 9){
					if($rootScope.catFilter.catGroup4 === true){
						if(marker.status == 1){
							if(statusTask1 === true){
								if(marker.familiarLang == false && $rootScope.taskFilter.langFilter == true){
									marker.setVisible(false);
								}else{
									marker.setVisible(true);
								}
							}else{
								marker.setVisible(false);
							}									
						}else if (marker.status == 2){
							if(statusTask2 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}else if (marker.status == 3){
							if(statusTask3 === true){
								marker.setVisible(true);
							}else{
								marker.setVisible(false);
							}
						}
					}else{
						marker.setVisible(false);
					}
				}
			}else if (filter.query === false){
				marker.setVisible(false);
			}			
			
			if (marker.status == 4){
				marker.setVisible(false);
			}
		});
	};
	
	$('#navbar').affix({
		offset: {
		top: 250
		}
	});

})

.directive('checkAvatar', function ($q) {
	return {
		restrict: 'A',
		link: function (scope, element, attrs) {
			attrs.$observe('ngSrc', function (ngSrc) {
				var deferred = $q.defer();
				var image = new Image();
				image.onerror = function () {
					deferred.resolve(false);
					element.attr('src', './images/icons/empty-profile.png'); // set default image
				};
				image.onload = function () {
					deferred.resolve(true);
				};
				image.src = ngSrc;
				return deferred.promise;
			});
		}
	};
})

.directive('ngThumb', ['$window', function($window) {
	var helper = {
		support: !!($window.FileReader && $window.CanvasRenderingContext2D),
		isFile: function(item) {
			return angular.isObject(item) && item instanceof $window.File;
		},
		isImage: function(file) {
			var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
			return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
		}
	};

	return {
		restrict: 'A',
		template: '<canvas/>',
		link: function(scope, element, attributes) {
			if (!helper.support) return;

			var params = scope.$eval(attributes.ngThumb);

			if (!helper.isFile(params.file)) return;
			if (!helper.isImage(params.file)) return;

			var canvas = element.find('canvas');
			var reader = new FileReader();

			reader.onload = onLoadFile;
			reader.readAsDataURL(params.file);

			function onLoadFile(event) {
				var img = new Image();
				img.onload = onLoadImage;
				img.src = event.target.result;
			}
			
			function onLoadImage() {
				/*jshint validthis: true */
				var width = params.width || this.width / this.height * params.height;
				var height = params.height || this.height / this.width * params.width;
				canvas.attr({ width: width, height: height });
				canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
			}
		}
	};
}])

.filter('langsFilter', function() {
  return function(items, langs) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(langs);

      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var lang = keys[i];
          var text = langs[lang].toLowerCase();
          if (item[lang].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
})

.controller('HeaderController', ['$scope', '$state', '$stateParams', '$rootScope', 'ngDialog', 'AuthFactory', 'infoFactory', 'profileFactory', 'gettextCatalog', function ($scope, $state, $stateParams, $rootScope, ngDialog, AuthFactory, infoFactory, profileFactory, gettextCatalog) {
	$scope.setGoBackFalse = function(){
		$rootScope.goback = false;
	};
	
	$rootScope.visitorLang = {};	
	$rootScope.visitorLang.selected = $rootScope.userLang;
	
	$scope.onSelectCallback = function(){		
		gettextCatalog.setCurrentLanguage($rootScope.visitorLang.selected);		
	};
	$scope.showNews = false;
	$scope.message = gettextCatalog.getString("Loading ...");

	$rootScope.jumboContent = function(){
		var news = infoFactory.query({
			language: gettextCatalog.getCurrentLanguage(),
			category: "news",
			randomOne: true
		})
		.$promise.then(
			function (response) {
				var news = response;
				$scope.news = news[0];
				$scope.showNews = true;
			},
			function (response) {
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + response.status + " " + response.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
			}
		);
	};
	
	$rootScope.jumboContent();
		
	$scope.loggedIn = false;
    $scope.username = '';
	$rootScope.profileId = {};

    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();		
    }
	
    $rootScope.openLogin = function () {
		ngDialog.open({ template: 'views/loginmodal.html',
			scope: $scope,
			className: 'ngdialog-theme-default',
			showClose: false,
			closeByDocument: false,
			controller:"LoginController"
		});
    };

    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
		$rootScope.goback = false;		
    };

    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });

    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });	
	
    $scope.stateis = function(curstate) {
       return $state.is(curstate);
    };

}])

.controller('LoginController', ['$scope', '$rootScope', '$state', '$timeout', 'ngDialog', '$localStorage', 'AuthFactory', 'gettextCatalog', function ($scope, $rootScope, $state, $timeout, ngDialog, $localStorage, AuthFactory, gettextCatalog) {
	
	$scope.usernamePlaceholder = gettextCatalog.getString("Username");
	$scope.passwordPlaceholder = gettextCatalog.getString("Password");

    $scope.loginData = $localStorage.getObject('userinfo','{}');

    $scope.doLogin = function() {
        if($scope.rememberMe){
           $localStorage.storeObject('userinfo',$scope.loginData);
		}
        AuthFactory.login($scope.loginData);		
		ngDialog.close();
    };

    $scope.openRegister = function () {
        ngDialog.open({
			template: 'views/registermodal.html',
			scope: $scope,
			className: 'ngdialog-theme-default',
			controller:"RegisterController",
			closeByEscape: true, 
			closeByDocument: false,			
			showClose: false
		});
    };	
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', 'gettextCatalog', function ($scope, ngDialog, $localStorage, AuthFactory, gettextCatalog) {
	
	$scope.usernamePlaceholder = gettextCatalog.getString("Username");
	$scope.passwordRPlaceholder = gettextCatalog.getString("Password must be min 6 characters");
	$scope.passwordRCPlaceholder = gettextCatalog.getString("Confirm Password");
	$scope.emailPlaceholder = gettextCatalog.getString("E-mail address");
	$scope.fullnamePlaceholder = gettextCatalog.getString("Full name (e.g. John Doe)");
	
    $scope.register={};
    $scope.loginData={};
    $scope.doRegister = function() {
        //console.log('Doing registration', $scope.registration);
        AuthFactory.register($scope.registration);
        ngDialog.close();
    };
}])

.controller('ProfilePrivateController', ['$scope', '$rootScope', '$state', '$stateParams', 'profileFactory', '$compile', 'NgMap', '$timeout', '$sce', '$ngSpin', 'gettextCatalog', function($scope, $rootScope, $state, $stateParams, profileFactory, $compile, NgMap, $timeout, $sce, $ngSpin, gettextCatalog){
	
	$ngSpin.start();
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	$scope.message = gettextCatalog.getString("Loading ...");
	
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCE845A8xwaGY2syD92auS-Ff9WaqFGBXY";
	//$rootScope.profile = {};
    $scope.showProfile = false;
	$scope.showUserTasks = false;
	$scope.showRecommendedTasks = false;
	$scope.showChoisedTasks = false;
	$scope.showPortfolioTasks = false;
	$scope.showComments = false;
    
	$scope.Math = Math;
	$scope.viewUTaskList = false;
	$scope.viewRTaskList = false;
	$scope.viewCTaskList = false;
	$scope.viewPTaskList = false;
	
	$rootScope.taskFilter = {};
	
	$rootScope.taskFilter.usertasksFilter = true;
	$rootScope.taskFilter.recommendedsFilter = true;
	$rootScope.taskFilter.choisedsFilter = true;
	
	$rootScope.catFilter = {};
	$rootScope.catFilter.catGroup1 = true;
	$rootScope.catFilter.catGroup2 = true;
	$rootScope.catFilter.catGroup3 = true;
	$rootScope.catFilter.catGroup4 = true;
	
	$rootScope.statFilter = {};
	$rootScope.statFilter.statTask1 = true;
	$rootScope.statFilter.statTask2 = true;
	$rootScope.statFilter.statTask3 = true;
	
	$scope.completed = 0;
	$scope.published = 0;
	
	$scope.currentPageRow = 1;
	$scope.pageSizeRow = 9;
				
	$scope.currentPageList = 1;
	$scope.pageSizeList = 5;
	$scope.currentComPage = 1;
	
	if($rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.goback = true;
		$rootScope.openLogin();
	}else if($rootScope.profile.position.coordinates[0] === 0 && $rootScope.profile.position.coordinates[1] === 0){
		$state.go('app.profileedit', {'#': 'mainNavbar'});
	}else{
		$rootScope.profile = profileFactory.get({
			id: $rootScope.profileid
		})
		.$promise.then(
			function (response) {
				$ngSpin.stop();
				$rootScope.profile = response;

				if($rootScope.profile.mainlang[0]){
					$rootScope.visitorLang.selected = $rootScope.profile.mainlang[0].id;
					gettextCatalog.setCurrentLanguage($rootScope.profile.mainlang[0].id);
				}
				
				$scope.published = $rootScope.profile.usertasks.length;
				
				$scope.myTaskStatus = function (id){
					var result = '';
					if($rootScope.profile.othertasks){
						$rootScope.profile.othertasks.forEach(function(item, i, arr){

							if(item.taskBy._id == id){
								//console.log('1', item);
								item.taskBy.candidates.forEach(function (unit, n, cands){
									
									if(unit.postedBy == $rootScope.profileid){
										//console.log('2');
										result = unit.status;
									}
								});							
							}						 
						});
					}
					return result;					
				};
				
				if($rootScope.profile.othertasks.length > 0){
					$rootScope.profile.othertasks.forEach(function(othertask){
						
						if (othertask.taskBy === null){
							console.log('othertask no exist ', othertask._id);
						}else{
							if(othertask.taskBy.status[0].id == 3 && $scope.myTaskStatus(othertask.taskBy._id) == 'Performer'){
								$scope.completed++;
							}
						}
					});
				}
				
				$scope.userRating = function(){
					if($scope.profile.ratingCount === 0){
						return $scope.notRated;
					}else{
						return Math.round($scope.profile.ratingSumm/$scope.profile.ratingCount);
					}
				};
				
				$scope.pageChangeHandler = function(num) {
				};
				
				$scope.getTasks = function (rule, status = [1]){
					//console.log('status is ', status);
					var result = [];
					$rootScope.profile.othertasks.forEach(function(item, i, arr){						
						if(item.taskstatus == rule){
							status.forEach(function(itemStatus){
								if(item.taskBy === null){
									console.log('othertask no exist ', item._id);
								}else{
									if(item.taskBy.status[0].id == itemStatus){
										result.push(item);
									}
								}
							});							
						}						 
					});	
					return result;
				};
				
				$scope.recommendeds = $scope.getTasks('Recommended');
				$scope.choiseds = $scope.getTasks('Choised', [1,2,4]);
				$scope.portfolio = $scope.getTasks('Choised', [3]);
				
				$scope.info = $sce.trustAsHtml($rootScope.profile.info);
				$scope.skills = $sce.trustAsHtml($rootScope.profile.skills);
				$scope.random = (new Date()).toString();
				$rootScope.imageAvatar = $rootScope.profile.image + "?cb=" + $scope.random;
				
				$scope.coordLat = 0;
				$scope.coordLon = 0;
				$rootScope.markers = [];
				$scope.infoWindowContent = [];

				
				$scope.marker = {};
				$scope.markerI = {};
	
				$scope.mapInit = function () {
					$timeout(function () {
						$scope.coordLon = $rootScope.profile.position.coordinates[0];
						$scope.coordLat = $rootScope.profile.position.coordinates[1];
						if ($rootScope.profile.range <= 500){
							$scope.zoomMap = 15;
						}else if ($rootScope.profile.range > 500 && $rootScope.profile.range <= 1000){
							$scope.zoomMap = 14;
						}else if ($rootScope.profile.range > 1000 && $rootScope.profile.range <= 2000){			
							$scope.zoomMap = 13;
						}else if ($rootScope.profile.range > 1000 && $rootScope.profile.range <= 4000){
							$scope.zoomMap = 12;
						}else if ($rootScope.profile.range > 4000 && $rootScope.profile.range <= 10000){
							$scope.zoomMap = 11;
						}else if ($rootScope.profile.range > 10000 && $rootScope.profile.range <= 16000){			
							$scope.zoomMap = 10;
						}else if ($rootScope.profile.range > 16000){		
							$scope.zoomMap = 9;
						}else{
							$scope.zoomMap = 9;
						}	
						
						$scope.mapCenter = new google.maps.LatLng($scope.coordLat, $scope.coordLon);
						$scope.map = new google.maps.Map(document.getElementById('map'), {
							'zoom': $scope.zoomMap,
							'center': $scope.mapCenter,
							'mapTypeId': google.maps.MapTypeId.ROADMAP,
							streetViewControl: false
						});
						
						$scope.input = document.getElementById('pac-input1');
						$scope.searchBox = new google.maps.places.SearchBox($scope.input);
						$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

						$scope.map.addListener('bounds_changed', function() {
							$scope.searchBox.setBounds($scope.map.getBounds());
						});

						$scope.searchBox.addListener('places_changed', function() {
							$scope.places = $scope.searchBox.getPlaces();
							if ($scope.places.length === 0) {
								return;
							}				
							var bounds = new google.maps.LatLngBounds();
							$scope.places.forEach(function(place) {
								if (!place.geometry) {
									return;
								}
								if (place.geometry.viewport) {
									bounds.union(place.geometry.viewport);
								} else {
									bounds.extend(place.geometry.location);
								}
							});				
							$scope.map.fitBounds(bounds);
						});						
				
						$scope.markerI = new google.maps.Marker({
							map: $scope.map,
							icon: 'images/icons/person.png',
							position: new google.maps.LatLng($scope.coordLat, $scope.coordLon),
							setMap: $scope.map,  
							draggable: false,
							title: 'i am here!',
							nameArray: 'system'
						});
						
						$scope.circle = new google.maps.Circle({
							map: $scope.map,
							radius: $rootScope.profile.range, 
							editable:false,
							strokeColor: '#000',
							strokeOpacity: 0.3, 
							strokeWeight: 1, 
							fillColor: 'gray', 
							fillOpacity: 0.15
						});
						$scope.circle.bindTo('center', $scope.markerI, 'position');
						
						$rootScope.markers.push($scope.markerI);
							
						$scope.countItems = 0;
						$scope.mapMarkers = function(mArray, nArray){
							$scope.nameArray = nArray;
							$scope.cssLabel = '';
							$scope.markerLabel = '';						
							
							if(mArray.length > 0){							
								mArray.forEach(function(item, i, arr) {
									if (item.taskBy.category[0].id == 1 || item.taskBy.category[0].id == 2){
										$scope.markerIcon = 'images/icons/red.png';
										$scope.cirleColor = '#F54B4B';
										$scope.cssLabel = 'cssEmergency';
										if(item.taskBy.category[0].id == 1){										
											$scope.markerLabel = gettextCatalog.getString('Life is in danger!');
										}
										if(item.taskBy.category[0].id == 2){
											$scope.markerLabel = gettextCatalog.getString('I urgently need help!');
										}
									}else if (item.taskBy.category[0].id == 3 || item.taskBy.category[0].id == 4){
										$scope.markerIcon = 'images/icons/green.png';
										$scope.cirleColor = '#8EE30F';
										$scope.cssLabel = 'cssTask';
										if(item.taskBy.category[0].id == 3){
											$scope.markerLabel = gettextCatalog.getString('I set the task');
										}
										if(item.taskBy.category[0].id == 4){
											$scope.markerLabel = gettextCatalog.getString('I am performing tasks');
										}
									}else if (item.taskBy.category[0].id == 5 || item.taskBy.category[0].id == 6 || item.taskBy.category[0].id == 7){
										$scope.markerIcon = 'images/icons/blue.png';
										$scope.cirleColor = '#6FB7FF';
										$scope.cssLabel = 'cssCommerce';
										if(item.taskBy.category[0].id == 5){
											$scope.markerLabel = gettextCatalog.getString('I sell');
										}
										if(item.taskBy.category[0].id == 6){
											$scope.markerLabel = gettextCatalog.getString('I will buy');
										}
										if(item.taskBy.category[0].id == 7){
											$scope.markerLabel = gettextCatalog.getString('I am changing');
										}
									}else if (item.taskBy.category[0].id == 8 || item.taskBy.category[0].id == 9){
										$scope.markerIcon = 'images/icons/orange.png';
										$scope.cirleColor = '#FF7300';
										$scope.cssLabel = 'cssHelp';
										if(item.taskBy.category[0].id == 8){
											$scope.markerLabel = gettextCatalog.getString('Help me, please!');
										}
										if(item.taskBy.category[0].id == 9){
											$scope.markerLabel = gettextCatalog.getString('I want to help');
										}										
									}else{
										$scope.markerIcon = 'images/icons/gray.png';
										$scope.cirleColor = 'gray';			
									}
									$scope.coordLon = item.taskBy.position.coordinates[0];
									$scope.coordLat = item.taskBy.position.coordinates[1];									
									
									$scope.marker = new MarkerWithLabel({								
										position: new google.maps.LatLng($scope.coordLat, $scope.coordLon),
										icon: $scope.markerIcon,
										map: $scope.map,
										category: item.taskBy.category[0].id,
										status: item.taskBy.status[0].id,
										nameArray: $scope.nameArray,										
										labelContent: $scope.markerLabel,
										labelAnchor: new google.maps.Point(30, 47),
										labelClass: $scope.cssLabel,
										labelInBackground: false,
										infoItem: $scope.countItems
									});
									$scope.countItems++;
									$rootScope.markers.push($scope.marker);
									
									$scope.infoWindow = new google.maps.InfoWindow({
										/* jshint expr: true */
										maxWidth: 450,
									}), $scope.marker, i;
									
									var image = '';
									
									if (!item.taskBy.images[0]){
										image = './images/icons/dummy_task.jpg';
									}else{
										image = item.taskBy.images[0]+ '.thumb-card.jpg';
									}
									
									var title = item.taskBy.langs[0].title = item.taskBy.langs[0].title.substring(0,50);
									var description = item.taskBy.langs[0].shortdescription;
									var backColor = item.taskBy.category[0].color;
									var fontColor = item.taskBy.category[0].fontcolor;
									var catName = item.taskBy.category[0].name;
									var status = item.taskBy.status[0].title;
									var css = '';
									var statusCss = '';
									
									if(item.taskBy.category[0].id == 1 || item.taskBy.category[0].id == 2){
										css = 'catEmergency';
									}else if(item.taskBy.category[0].id == 3 || item.taskBy.category[0].id == 4){
										css = 'catTask';
									}else if(item.taskBy.category[0].id == 5 || item.taskBy.category[0].id == 6 || item.taskBy.category[0].id == 7){
										css = 'catCommerce';
									}else if(item.taskBy.category[0].id == 8 || item.taskBy.category[0].id == 9){
										css = 'catHelp';
									}
																		
									if(item.taskBy.status[0].id == 1){
										statusCss = 'statusOpen';
									}else if(item.taskBy.status[0].id == 2){
										statusCss = 'statusPERFORMING';
									}else if(item.taskBy.status[0].id == 3){
										statusCss = 'statusCOMPLETE';
									}else if(item.taskBy.status[0].id == 4){
										statusCss = 'statusCANCELED';
									}
									
									$scope.infoTemplate = '<table>' + '<col style="width:40%">' + '<tr>' + '<td>' +  '<a ui-sref="app.taskpublic({id:' + '\'' + item.taskBy._id + '\'' + ',' + '\'' + '#' + '\'' + ':' + '\'' + 'mainNavbar' + '\''+ '})">' + '<img class="vertical-center img-responsive img-thumbnail img-candList" src="'+image+'" >' + '</a>' + '</td>' + '<td valign="top">' + '<div class="space-left10">' + '<div class="text-mid vertical-top text-center '+ css +'"  translate>' + catName + '</div>' + '<div class="text-center text-small">' + title + '</div>' + '<div class="text-center text-small">' + description + '</div>' + '<div class="text-small text-center tasklist-footer"> Task status: ' + '<span class="text-center text-mid ' + statusCss + '  text-shadow">' + status + '</span>' + '</div>' + '</div>' + '</td>' + '</tr>' + '</table>';
									
									$scope.infoTemplate = $compile($scope.infoTemplate)($scope);
									
									$scope.infoWindowContent.push($scope.infoTemplate);
									var markerOne = $scope.marker;
									
									google.maps.event.addListener($scope.marker, 'click', (function(markerOne) {
										return function() {
											var i = markerOne.infoItem;
											$scope.infoWindow.setContent($scope.infoWindowContent[i][0]);
											$scope.infoWindow.open($scope.map, markerOne);
										};
									})(markerOne, i));									
								});							
							}
						};

						$scope.mapMarkers($rootScope.profile.usertasks, 'usertasks');						
						$scope.mapMarkers($scope.recommendeds, 'recommendeds');
						$scope.mapMarkers($scope.choiseds, 'choiseds');
						$scope.mapMarkers($scope.portfolio, 'portfolio');
						
						$rootScope.toggleMarkers();
				
					}, 500);
				};
				
				$timeout(function () {
					$(document).ready(function(){							
						$scope.mapInit();						
					});
				}, 500);

				$rootScope.profileLocation = { position: [$rootScope.profile.position.coordinates[1], $rootScope.profile.position.coordinates[0]]};
				$scope.showProfile = true;
				$scope.showUserTasks = true;
				$scope.showRecommendedTasks = true;
				$scope.showChoisedTasks = true;
				$scope.showPortfolioTasks = true;
				$scope.showComments = true;				
			},
			function (response) {
				if(response.status == 401 || response.status == 403){ 
					console.log('Error status ',response.status );
					var tick = 0;
					if(tick === 0){
						tick++;
						$rootScope.reloadState = 1;
						$rootScope.openLogin();			
					}				
				}else{				
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
			}
		);
	}
}])

.controller('ProfilePublicController', ['$scope', '$rootScope', '$state', '$stateParams', 'profileFactory', 'NgMap', '$timeout', '$sce', '$ngSpin', 'gettextCatalog', function($scope, $rootScope, $state, $stateParams, profileFactory, NgMap, $timeout, $sce, $ngSpin, gettextCatalog){
	
	$ngSpin.start();
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
	//this.router= Router;
	
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCE845A8xwaGY2syD92auS-Ff9WaqFGBXY";
	//$rootScope.profile = {};
    $scope.showProfile = false;
	$scope.showPortfolioTasks = false;
	$scope.showComments = false;
	$scope.viewPTaskList = false;
    $scope.message = gettextCatalog.getString("Loading ...");
	$scope.published = 0;
	$scope.completed = 0;
	
	$scope.currentPageRow = 1;
	$scope.pageSizeRow = 6;	
	$scope.currentPageList = 1;
	$scope.currentComPage = 1;
	$scope.pageSizeList = 5;

	if($rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.goback = true;
		$rootScope.openLogin();
	}else{
		$scope.profilePublic = profileFactory.get({
			id: $stateParams.id
        })
        .$promise.then(
            function (response) {
				$ngSpin.stop();
                $scope.profilePublic = response;
				$scope.published = $scope.profilePublic.usertasks.length;
				
				if($scope.profilePublic.othertasks.length > 0){
					$scope.profilePublic.othertasks.forEach(function(othertask){
						if(othertask.taskBy.status[0].id == 3){
							$scope.completed++;
						}
					});
				}
				
				$scope.userRating = function(){
					if($scope.profilePublic.ratingCount === 0){
						return 0;
					}else{
						return Math.round($scope.profilePublic.ratingSumm/$scope.profilePublic.ratingCount);
					}
				};
				
				$scope.pageChangeHandler = function(num) {
				};
				
				$scope.getTasks = function (rule, status = [1]){
					//console.log('status is ', status);
					var result = [];
					$scope.profilePublic.othertasks.forEach(function(item, i, arr){						
						if(item.taskstatus == rule){
							status.forEach(function(itemStatus){
								//console.log('itemStatus is ', itemStatus);
								//console.log('item.taskBy.status[0].id is ', item.taskBy.status[0].id);
								if(item.taskBy.status[0].id == itemStatus){
									result.push(item);
								}							
							});							
						}						 
					});	
					return result;
				};
				
				$scope.published = $scope.profilePublic.usertasks.length;
				
				$scope.portfolio = $scope.getTasks('Choised', [3]);
				//console.log('portfolio is ', $scope.portfolio);				
				
				$scope.info = $sce.trustAsHtml($scope.profilePublic.info);
				$scope.skills = $sce.trustAsHtml($scope.profilePublic.skills);
				$scope.random = (new Date()).toString();
				$rootScope.imageAvatar = $scope.profilePublic.image + "?cb=" + $scope.random;					

                $scope.showProfile = true;
				$scope.showComments = true;
				$scope.showPortfolioTasks = true;
				
            },
            function (response) {
				if(response.status == 401 || response.status == 403){
					console.log('Error status ',response.status );
					var tick = 0;
					if(tick === 0){
						tick++;
						$rootScope.reloadState = 1;
						$rootScope.openLogin();
					}
				}else{				
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
            }
        );
	}
}])

.controller('CandidateController', ['$scope', '$rootScope', '$state', '$stateParams', 'taskFactory', 'profileFactory', 'taskCandidateFactory', 'NgMap', '$timeout', '$sce', '$ngSpin', 'gettextCatalog', function($scope, $rootScope, $state, $stateParams, taskFactory, profileFactory, taskCandidateFactory, NgMap, $timeout, $sce, $ngSpin, gettextCatalog){
	
	$ngSpin.start();
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	$scope.message = gettextCatalog.getString("Loading ...");
	
    $scope.showProfile = false;
	$scope.showComments = false;
	$scope.viewPTaskList = false;
	$scope.showPortfolioTasks = false;
	$scope.completed = 0;
    
	$scope.userTaskStatus = '';
	$scope.candidate = {};
	
	$scope.currentPageRow = 1;
	$scope.pageSizeRow = 6;
	
	$scope.currentPageList = 1;
	$scope.pageSizeList = 5;
	
	$scope.currentComPage = 1;
	$scope.acceptCollapse = true;
	$scope.refuseCollapse  = true;
	$scope.thisCandidate = '';
	
	if($rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.needLogin = true;
		history.back();
	}else{
		$scope.candidate = profileFactory.get({
			id: $stateParams.profileid
		})
		.$promise.then(
			function (response) {
				$scope.candidate = response;
				$ngSpin.stop();
				
				$scope.task = taskFactory.get({					
				id: $stateParams.id
				})
				.$promise.then(
					function (response) {
						//console.log("success respond");
						$scope.task = response;
						
						$scope.showProfile = true;
						$scope.showComments = true;
						
						$rootScope.imageAvatar = $scope.candidate.image + "?cb=" + $rootScope.random;
						
						$scope.userRating = function(){
							if($scope.candidate.ratingCount === 0){
								return 0;
							}else{
								return Math.round($scope.candidate.ratingSumm/$scope.candidate.ratingCount);
							}
						};
						
						$scope.task.candidates.forEach(function(item, i, arr){
							if (item.postedBy._id == $stateParams.profileid){
								$scope.thisCandidate = item;
								$scope.userTaskStatus = item.status;
								$scope.statementText = item.statement;								
								$scope.replyText = item.reply;
							}
						});
						
						if($scope.candidate.othertasks.length > 0){
							$scope.candidate.othertasks.forEach(function(othertask){
								//console.log('othertask.taskBy.status.id is ', othertask.taskBy.status.id);
								if(othertask.taskBy.status[0].id == 3){
									$scope.completed++;
								}
							});
						}
						
						$scope.cancelResponse = function(){
							$scope.thisCandidate.reply = '';
						};
						
						$scope.published = $scope.candidate.usertasks.length;
						
						$scope.pageChangeHandler = function(num) {
						};
						
						$scope.getTasks = function (rule, status = [1]){
							//console.log('status is ', status);
							var result = [];
							if($scope.candidate.othertasks.length > 0){
								$scope.candidate.othertasks.forEach(function(item, i, arr){						
									if(item.taskstatus == rule){
										status.forEach(function(itemStatus){
											//console.log('itemStatus is ', itemStatus);
											//console.log('item.taskBy.status[0].id is ', item.taskBy.status[0].id);
											if(item.taskBy.status[0].id == itemStatus){
												result.push(item);
											}								
										});							
									}						 
								});
							}									
							return result;
						};
						
						$scope.portfolio = $scope.getTasks('Choised', [3]);
						
						$scope.showPortfolioTasks = true;
						$scope.acceptUser = function(){
							
							if( $rootScope.profileid === undefined){
								$rootScope.openLogin();
							}else{									
								$scope.thisCandidate.status = "Accepted";
								console.log('$scope.thisCandidate.reply is 2 ', $scope.thisCandidate.reply);
								console.log('$scope.thisCandidate is 2 ', $scope.thisCandidate);
								
								taskCandidateFactory.update({
									id:$stateParams.id,
									candidateId: $stateParams.candid
								},
									$scope.thisCandidate
								)
								.$promise.then(
									function (response) {
										var messageTitle = gettextCatalog.getString('Adopted for task execution!');
										var messageText = gettextCatalog.getString('User have been accepted to task perform!');
										$rootScope.modalInfo('modaldiv-green', messageTitle, messageText);
										$timeout(function () {								
											$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});
										}, 2000);
										
									},
									function (response) {
										if(response.status == 401 || response.status == 403){
											console.log('Error status ',response.status );
											$rootScope.needLogin = true;
											history.back();
										}else{
											var errorTitle = gettextCatalog.getString('Something wrong!');
											var errorText = gettextCatalog.getString("Error: ");					
											var message = errorText + " " + response.status + " " + response.statusText;
											$rootScope.modalInfo('modaldiv-red', errorTitle, message);
										}
									}
								);
							}	
						};
						
						$scope.cancelUser = function(){									
							if( $rootScope.profileid === undefined){
								$rootScope.openLogin();
							}else{
								$scope.thisCandidate.status = "Denied";
								
								taskCandidateFactory.update({
									id:$stateParams.id,
									candidateId: $stateParams.candid
								},
									$scope.thisCandidate
								)
								.$promise.then(
									function (response) {
										//console.log("taskCandidateFactory.save success", response);				
										$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});
									},
									function (response) {
										console.log('response.status is ', response.status);
										if(response.status == 401 || response.status == 403){ 
											console.log('Error status ',response.status );
											$rootScope.needLogin = true;
											history.back();
										}else{
											var errorTitle = gettextCatalog.getString('Something wrong!');
											var errorText = gettextCatalog.getString("Error: ");					
											var message = errorText + " " + response.status + " " + response.statusText;
											$rootScope.modalInfo('modaldiv-red', errorTitle, message);
										}
									}
								);
							}
						};
					},
					function (response) {
						if(response.status == 401 || response.status == 403){ 
							console.log('Error status ',response.status );
							$rootScope.needLogin = true;
							history.back();
						}else{
							var errorTitle = gettextCatalog.getString('Something wrong!');
							var errorText = gettextCatalog.getString("Error: ");					
							var message = errorText + " " + response.status + " " + response.statusText;
							$rootScope.modalInfo('modaldiv-red', errorTitle, message);
						}
					}							
				);
			},
			function (response) {
				if(response.status == 401 || response.status == 403){
					console.log('Error status ',response.status );
					$rootScope.needLogin = true;
					history.back();
				}else{
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
			}
		);
	}	
}])

.controller('ProfileModalController', ['config','$scope', '$rootScope', '$http', '$window', 'ngDialog','Upload', '$timeout', 'gettextCatalog', function (config, $scope, $rootScope, $http, $window, ngDialog, Upload, $timeout, gettextCatalog) {
	//console.log('User id is '+$scope.user._id);
	//console.log('Profile id is '+$rootScope.profile._id);
	//console.log('$rootScope.profile.postedBy._id is ' + $rootScope.profile.postedBy._id);
	$rootScope.random = (new Date()).toString();
	
	$scope.browsePhotoPlaceholder = gettextCatalog.getString("Browse Photo");
	
	$scope.showTitleResult = true;
	
	$scope.picFile='';
    $scope.croppedImage='';

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.picFile=evt.target.result;
        });
      };
      reader.readAsDataURL(file);
    };

    $scope.submitImage = function(){ 
		//console.log('picFile name is '+ $scope.picFile.name);
        if ($scope.profileImage.file.$valid && $scope.picFile) { 
            $scope.upload($scope.croppedImage, $scope.picFile.name);
        }
    };

    $scope.upload = function (file, name) {
		//console.log('Upload file name is '+ name);
		$scope.showTitleResult = false;		
        Upload.upload({
            url: config.apiUrl + 'profiles/upload', //webAPI exposed to upload the file
            //data:{file:file} //pass file as data, should be user ng-model
			data: { file: Upload.dataUrltoBlob(file, name) }
        }).then(function (resp) { //upload function returns a promise
			//console.log("upload resp.data.error_code is " + resp.data.error_code);
            if(resp.data.error_code === 0 || resp.data.error_code === undefined){ //validate success
                //console.log('Success ' + resp.config.data.file.name + ' uploaded. Response: ');
				
				var userdirstring = function (userid){
					var useridstring = userid.toString();
					var idstringlength = (useridstring.length / 3).toFixed(0);
					var userdir = config.userDir;
					var position = 0;				
					for(var i = 0; i < idstringlength; i++){
						userdir = userdir + '/' + useridstring.substring(position, position + 3);
						position = position + 3;
					}
					if (useridstring.length % 3 !== 0){	
						userdir = userdir + '/' + useridstring.substring(position, useridstring.length);
					}
					return userdir;				
				};		
				
				var nameString = name;
				var pos = nameString.lastIndexOf('.');				
				var nameExt = nameString.slice(pos);
				
				var userdir = userdirstring($rootScope.profile.postedBy._id);				
				var userlink = config.apiUrl + userdir.substring( 9, userdir.length);
				//console.log('userlink in upload is ' + userlink);
				
				$rootScope.imageAvatarReq = userlink +'/' + $rootScope.profile._id + nameExt;
				$rootScope.imageAvatar = userlink +'/' + $rootScope.profile._id + nameExt + "?cb=" + $rootScope.random; 
				
				//console.log('imageAvatar url ' + $rootScope.imageAvatar);
				
				
            } else {
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + resp.status + " " + resp.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
                
            }
        }, function (resp) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + resp.status + " " + resp.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);

        }, function (evt) { 
            //console.log(evt);
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
			
			if ($scope.progress == 100){
				$timeout(function () {			
					ngDialog.closeAll();
				}, 1000);		
			}
        });
    };	
}])

.controller('ProfileEditController', ['$scope', '$rootScope', '$state', '$stateParams', 'profileFactory', 'Upload', '$timeout', 'ngDialog', '$ngSpin', 'gettextCatalog', function($scope, $rootScope, $state, $stateParams, profileFactory, Upload, $timeout, ngDialog, $ngSpin, gettextCatalog){
	
	$ngSpin.start();
	$rootScope.random = (new Date()).toString();
	
	$scope.selectLangPlaceholder = gettextCatalog.getString("Select more languages...");
	$scope.mainlangPlaceholder = gettextCatalog.getString("Select interface language...");
	$scope.mapplace = gettextCatalog.getString("Are You somewhere here?");
	
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCE845A8xwaGY2syD92auS-Ff9WaqFGBXY";
	//$rootScope.profile = {};
	$scope.coordLat = 0;
	$scope.coordLon = 0;
	$rootScope.markers = [];
	//$scope.mainlang = [];
	//$rootScope.profile.morelang = {};
	
    $scope.showEditProfile = false;
	$scope.showUserTasks = false;
	$scope.showRecommendedTasks = false;
	$scope.showChoisedTasks = false;
	$scope.showComments = false;
    $scope.message = gettextCatalog.getString("Loading ...");
	//console.log("state params = " , $rootScope.profileId);
	
	$scope.imageProfile = function () {
		ngDialog.open({ template: 'views/profilemodal.html',
			scope: $scope,
			className: 'ngdialog-theme-default',
			showClose: false,
			controller:"ProfileModalController"
		});
    };
	
	if( $rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.openLogin();
	}else{	
		$rootScope.profile = profileFactory.get({
			id: $rootScope.profileid
        })
        .$promise.then(
            function (response) {
				$ngSpin.stop();
                $rootScope.profile = response;
				
				$scope.profileLang ={};					
				$scope.profileLang.selected = $rootScope.profile.mainlang[0];
				
				if($rootScope.profile.mainlang[0]){
					$rootScope.visitorLang.selected = $rootScope.profile.mainlang[0].id;
				}
				
				$scope.onSelectCallback = function(){
					$rootScope.visitorLang.selected = $scope.profileLang.selected;
					gettextCatalog.setCurrentLanguage($scope.profileLang.selected.id);		
				};
				
				if($rootScope.profile.mainlang[0]){
					$rootScope.profile.mainlang.selected = $rootScope.profile.mainlang[0];
				}
				$rootScope.profileLocation ={ position: [$rootScope.profile.position.coordinates[1], $rootScope.profile.position.coordinates[0]]};
				$rootScope.imageAvatarReq = $rootScope.profile.image;
                $scope.showEditProfile = true;
				$scope.showUserTasks = true;
				$scope.showRecommendedTasks = true;
				$scope.showChoisedTasks = true;
				$scope.showComments = true;
				
				$rootScope.imageAvatar = $rootScope.profile.image + "?cb=" + $rootScope.random;
				$rootScope.count = 0;		
				
				if ($rootScope.profile.range <= 500){
					$scope.zoomMap = 15;
				}else if ($rootScope.profile.range > 500 && $rootScope.profile.range <= 1000){
					$scope.zoomMap = 14;
				}else if ($rootScope.profile.range > 1000 && $rootScope.profile.range <= 2000){			
					$scope.zoomMap = 13;
				}else if ($rootScope.profile.range > 1000 && $rootScope.profile.range <= 4000){
					$scope.zoomMap = 12;
				}else if ($rootScope.profile.range > 4000 && $rootScope.profile.range <= 10000){
					$scope.zoomMap = 11;
				}else if ($rootScope.profile.range > 10000 && $rootScope.profile.range <= 16000){			
					$scope.zoomMap = 10;
				}else if ($rootScope.profile.range > 16000){		
					$scope.zoomMap = 9;
				}else{
					$scope.zoomMap = 9;
				}
				
				if($rootScope.profile.position.coordinates[0] === 0 && $rootScope.profile.position.coordinates[1] === 0){
					$scope.showInfo = true;
					
					if(navigator.geolocation) {
						console.log('Geolocation is supported!');
						navigator.geolocation.getCurrentPosition(function(position) {
							$scope.coordLat = position.coords.latitude;
							$scope.coordLon = position.coords.longitude;
							$scope.pos = {
								lat: position.coords.latitude,
								lng: position.coords.longitude
							};
							$(document).ready(function(){							
								$scope.mapInit();
								$timeout(function () {
									google.maps.event.addListener($scope.map, 'click', function(event) {
										var x = event.latLng.lat();
										$scope.coordLat = x;
										var y = event.latLng.lng();
										$scope.coordLon = y;
										$("#coordLat").val($scope.coordLat).trigger('change');
										$("#coordLon").val($scope.coordLon).trigger('change');
										if(!$scope.marker){
											$scope.metamarker(x,y,300);
										}else{
											$scope.marker.setPosition(event.latLng);
										}
									});
								}, 1000);
							});
						},
							function errorCallback(error) {
								var messageTitle = gettextCatalog.getString('Can not find your location!');
								var messageText = gettextCatalog.getString('Sorry, but automatic geolocation can not find your position now. <br> Try to use search line to find your position.');
								$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
							},
							{
								maximumAge:Infinity,
								timeout:5000
							}
						);
					}
				}else if($rootScope.profile.position.coordinates[0] !== 0 || $rootScope.profile.position.coordinates[1] !== 0){
					$scope.coordLon = $rootScope.profile.position.coordinates[0];
					$scope.coordLat = $rootScope.profile.position.coordinates[1];										
					$timeout(function () {
						$(document).ready(function(){
							$scope.mapInit();
							$timeout(function () {
								$scope.metamarker($scope.coordLat, $scope.coordLon,$rootScope.profile.range);
							}, 1000);
							$timeout(function () {
								google.maps.event.addListener($scope.map, 'click', function(event) {
									var x = event.latLng.lat();
									$scope.coordLat = x;
									var y = event.latLng.lng();
									$scope.coordLon = y;
									$("#coordLat").val($scope.coordLat).trigger('change');
									$("#coordLon").val($scope.coordLon).trigger('change');
									$scope.marker.setPosition(event.latLng);								
								});
							}, 2000);
						});
					}, 1000);
				}
				
				$scope.cirleColor = 'gray';
				
				$scope.metamarker = function (x,y,r){
					$scope.marker = new google.maps.Marker({
						map: $scope.map,
						icon: 'images/icons/person.png',
						position: new google.maps.LatLng(x, y),
						setMap: $scope.map,  
						draggable: true,
						title: 'Drag me!'
					});
					$scope.circle = new google.maps.Circle({
						map: $scope.map,
						radius: r, 
						editable:true,
						strokeColor: '#000',
						strokeOpacity: 0.3, 
						strokeWeight: 1, 
						fillColor: 'gray', 
						fillOpacity: 0.15
					});
					
					$rootScope.markers.push($scope.marker);
					
					$scope.circle.bindTo('center', $scope.marker, 'position');
					google.maps.event.addListener($scope.circle, 'radius_changed', function() {
						$rootScope.profile.range = Math.round($scope.circle.getRadius());
						$("#range").val($rootScope.profile.range).trigger('change');
					});
					
					google.maps.event.addListener($scope.circle, 'center_changed', function() {
						$scope.coordLat = $scope.circle.getCenter().lat();
						$scope.coordLon = $scope.circle.getCenter().lng();
						$("#coordLat").val($scope.coordLat).trigger('change');
						$("#coordLon").val($scope.coordLon).trigger('change');
					});	
					
				};
				
				$scope.mapInit = function () {
					$scope.mapCenter = new google.maps.LatLng($scope.coordLat, $scope.coordLon);

					$scope.map = new google.maps.Map(document.getElementById('map'), {
						'zoom': $scope.zoomMap,
						'center': $scope.mapCenter,
						'mapTypeId': google.maps.MapTypeId.ROADMAP,
						streetViewControl: false
					});
					
					if($scope.showInfo){
						var infoWindow = new google.maps.InfoWindow({map: $scope.map});
							infoWindow.setPosition($scope.pos);
							infoWindow.setContent($scope.mapplace);
							$scope.map.setCenter($scope.pos);
					}

					$scope.input = document.getElementById('pac-input');
					$scope.searchBox = new google.maps.places.SearchBox($scope.input);
					$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

					$scope.map.addListener('bounds_changed', function() {
						$scope.searchBox.setBounds($scope.map.getBounds());
					});

					$scope.searchBox.addListener('places_changed', function() {
						$scope.places = $scope.searchBox.getPlaces();
						if ($scope.places.length === 0) {
							return;
						}				
						var bounds = new google.maps.LatLngBounds();
						$scope.places.forEach(function(place) {
							if (!place.geometry) {
								return;
							}
							if (place.geometry.viewport) {
								bounds.union(place.geometry.viewport);
							} else {
								bounds.extend(place.geometry.location);
							}
						});				
						$scope.map.fitBounds(bounds);
					});
				};
				
				$scope.nlangArray = function(){
					$scope.langIs = {};
					if($rootScope.profile.mainlang !== undefined && typeof $rootScope.profile.mainlang === 'string'){
						$scope.langIs = $.parseJSON('[' + $rootScope.profile.mainlang + ']');
					}
					return $scope.langIs;
				};
				
				//$rootScope.profile.mainlang = $rootScope.profile.mainlang.selected;
	
				$scope.submitProfile = function () {
					var messageTitle = '';
					var messageText = '';
					$rootScope.profile.mainlang = $scope.profileLang.selected;
					console.log('$rootScope.profile is ', $rootScope.profile);
					$rootScope.profile.image = $rootScope.imageAvatarReq;
					if($rootScope.profile.mainlang === undefined){
						messageTitle = gettextCatalog.getString('Need to select!');
						messageText = gettextCatalog.getString('Please select interface language.');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else if($rootScope.profile.morelang.length === 0){
						messageTitle = gettextCatalog.getString('Need to select!');
						messageText = gettextCatalog.getString('Please select familiar languages.');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else if($rootScope.profile.info === ''){
						messageTitle = gettextCatalog.getString('Write something!');
						messageText = gettextCatalog.getString('Write information about yourself that will be visible to other people.');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else if($rootScope.profile.skills === ''){
						messageTitle = gettextCatalog.getString('Write something!');
						messageText = gettextCatalog.getString('Write about your skills and abilities.');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else if($rootScope.profile.position.coordinates[0] === 0 && $rootScope.profile.position.coordinates[1] === 0){
						messageTitle = gettextCatalog.getString('Need to choose a place!');
						messageText = gettextCatalog.getString('Set a marker in the place where you will receive notification of tasks.');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else{
						profileFactory.update({id: $rootScope.profile._id}, $rootScope.profile)
						.$promise.then(
							function (response) {
								$scope.testresp = response;
								messageTitle = gettextCatalog.getString('Profile saved!');
								$rootScope.modalInfo('modaldiv-green', messageTitle);
								$timeout(function () {
									$rootScope.jumboContent();
									$state.go('app.profileprivate', {'#': 'mainNavbar'});			
								}, 3000);				
							},
							function (response) {
								messageTitle = gettextCatalog.getString('Something wrong!');
								messageText = gettextCatalog.getString("Error: ");
								$scope.message = messageText +  response.status + " " + response.statusText;
								$rootScope.modalInfo('modaldiv-red', messageTitle, $scope.message);				
							}
						);
					}
				};
            },
            function (response) {
				if(response.status == 401 || response.status == 403){
					console.log('Error status ',response.status );
					var tick = 0;
					if(tick === 0){
						tick++;
						$rootScope.reloadState = 1;
						$rootScope.openLogin();
					}
				}else{				
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
            }
        );
	}	
}])

.controller('TasksController', ['$scope', '$rootScope', '$state', '$timeout', '$compile', '$stateParams', 'infoFactory', 'taskFactory', 'ngDialog', '$ngSpin', 'gettextCatalog', function ($scope, $rootScope, $state, $timeout, $compile, $stateParams, infoFactory, taskFactory, ngDialog, $ngSpin, gettextCatalog) {
	$ngSpin.start();
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
    $scope.showFreshTask = false;
    $scope.showLocalTask = false;
    $scope.showRegionalTasks = false;
	$scope.showTips = false;
	
	$scope.viewFTaskList = false;
	$scope.viewLTaskList = false;
	$scope.viewRTaskList = false;
	
	$scope.Math = Math;
    $scope.message = gettextCatalog.getString("Loading ...");
	
	$scope.currentPageRow = 1;
	$scope.pageSizeRow = 9;
	
	$scope.currentPageList = 1;
	$scope.pageSizeList = 5;
	
	$scope.coordLat = 0;
	$scope.coordLon = 0;
	$scope.zoomMap = 13;
	$rootScope.markers = [];
	$scope.infoWindowContent = [];
	
	$rootScope.taskFilter = {};
	
	$rootScope.taskFilter.freshFilter = true;
	$rootScope.taskFilter.localFilter = true;
	$rootScope.taskFilter.regionalFilter = true;
	$rootScope.taskFilter.langFilter = false;
	
	$rootScope.catFilter = {};
	$rootScope.catFilter.catGroup1 = true;
	$rootScope.catFilter.catGroup2 = true;
	$rootScope.catFilter.catGroup3 = true;
	$rootScope.catFilter.catGroup4 = true;
	
	$rootScope.statFilter = {};
	$rootScope.statFilter.statTask1 = true;
	$rootScope.statFilter.statTask2 = true;
	$rootScope.statFilter.statTask3 = true;
	

	$scope.marker = {};
	
	if($rootScope.profileid === undefined || !$scope.coordLat || !$scope.coordLon){	
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				$scope.coordLat = position.coords.latitude;
				$scope.coordLon = position.coords.longitude;
				$scope.pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				$(document).ready(function(){							
					$scope.mapInit();
				});
			},
				function errorCallback(error) {
					var messageTitle = gettextCatalog.getString('Can not find your location!');
					var messageText = gettextCatalog.getString('Sorry, but automatic geolocation can not find your position now. <br> Try to use search line to find your position.');
					$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
				},
				{
					maximumAge:Infinity,
					timeout:5000
				}			
			);
		}		
	}else{
		$scope.coordLat = $rootScope.profile.position.coordinates[1];
		$scope.coordLon = $rootScope.profile.position.coordinates[0];
		$timeout(function () {
			$(document).ready(function(){							
				$scope.mapInit();
			});
		}, 1000);
	}
	
	$scope.pageChangeHandler = function(num) {
	};
	
	$scope.showTasks = true;
	
	$scope.tip1 = infoFactory.query({
		category: "tips",
		randomOne: true
	})
	.$promise.then(		
		function (response) {
			$ngSpin.stop();
			$scope.tip1 = response[0];
			$scope.showTips = true;
			
		},
		function (response) {
			//ngDialog.closeAll();
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);

	$scope.tip2 = infoFactory.query({
		category: "tips",
		randomOne: true
	})
	.$promise.then(		
		function (response) {
			$ngSpin.stop();
			$scope.tip2 = response[0];
			$scope.showTips = true;
			
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);
	
	$scope.mapInit = function () {
		
		$scope.mapCenter = new google.maps.LatLng($scope.coordLat, $scope.coordLon);

		$scope.map = new google.maps.Map(document.getElementById('map'), {
			'zoom': $scope.zoomMap,
			'center': $scope.mapCenter,
			'mapTypeId': google.maps.MapTypeId.ROADMAP,
			streetViewControl: false
		});
		
		$scope.input = document.getElementById('pac-input');
		$scope.searchBox = new google.maps.places.SearchBox($scope.input);
		$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

		$scope.map.addListener('bounds_changed', function() {
			$scope.searchBox.setBounds($scope.map.getBounds());
		});

		$scope.searchBox.addListener('places_changed', function() {
			$scope.places = $scope.searchBox.getPlaces();
			if ($scope.places.length === 0) {
				return;
			}			
			var bounds = new google.maps.LatLngBounds();
			$scope.places.forEach(function(place) {
				if (!place.geometry) {
					return;
				}
				if (place.geometry.viewport) {
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});				
			$scope.map.fitBounds(bounds);
		});
		$scope.countItems = 0;
		$scope.mapMarkers = function(mArray, nArray){
			$scope.nameArray = nArray;
			$scope.cssLabel = '';
			$scope.markerLabel = '';		
			
			if(mArray.length > 0){
				mArray.forEach(function(item, i, arr) {
					if( $rootScope.profileid !== undefined){						
						var taskLangs = $rootScope.swapLang(item.langs);
						console.log("taskLangs 1 ", taskLangs);
						item.familiarLang = taskLangs[taskLangs.length-1];
						taskLangs.pop();
						console.log("taskLangs 2 ", taskLangs);
						item.langs = taskLangs;
						console.log("item ", item);
					}
					
					if (item.category[0].id == 1 || item.category[0].id == 2){
						$scope.markerIcon = 'images/icons/red.png';
						$scope.cirleColor = '#F54B4B';
						$scope.cssLabel = 'cssEmergency';
						if(item.category[0].id == 1){										
							$scope.markerLabel = gettextCatalog.getString('Life is in danger!');
						}
						if(item.category[0].id == 2){
							$scope.markerLabel = gettextCatalog.getString('I urgently need help!');
						}
					}else if (item.category[0].id == 3 || item.category[0].id == 4){
						$scope.markerIcon = 'images/icons/green.png';
						$scope.cirleColor = '#8EE30F';
						$scope.cssLabel = 'cssTask';
						if(item.category[0].id == 3){
							$scope.markerLabel = gettextCatalog.getString('I set the task');
						}
						if(item.category[0].id == 4){
							$scope.markerLabel = gettextCatalog.getString('I am performing tasks');
						}
					}else if (item.category[0].id == 5 || item.category[0].id == 6 || item.category[0].id == 7){
						$scope.markerIcon = 'images/icons/blue.png';
						$scope.cirleColor = '#6FB7FF';
						$scope.cssLabel = 'cssCommerce';
						if(item.category[0].id == 5){
							$scope.markerLabel = gettextCatalog.getString('I sell');
						}
						if(item.category[0].id == 6){
							$scope.markerLabel = gettextCatalog.getString('I will buy');
						}
						if(item.category[0].id == 7){
							$scope.markerLabel = gettextCatalog.getString('I am changing');
						}
					}else if (item.category[0].id == 8 || item.category[0].id == 9){
						$scope.markerIcon = 'images/icons/orange.png';
						$scope.cirleColor = '#FF7300';
						$scope.cssLabel = 'cssHelp';
						if(item.category[0].id == 8){
							$scope.markerLabel = gettextCatalog.getString('Help me, please!');
						}
						if(item.category[0].id == 9){
							$scope.markerLabel = gettextCatalog.getString('I want to help');
						}						
					}else{
						$scope.markerIcon = 'images/icons/gray.png';
						$scope.cirleColor = 'gray';			
					}
					
					$scope.marker = new MarkerWithLabel({
						position: new google.maps.LatLng(item.position.coordinates[1], item.position.coordinates[0]),
						icon: $scope.markerIcon,
						map: $scope.map,
						familiarLang: item.familiarLang,
						category: item.category[0].id,
						status: item.status[0].id,
						nameArray: $scope.nameArray,										
						labelContent: $scope.markerLabel,
						labelAnchor: new google.maps.Point(30, 47),
						labelClass: $scope.cssLabel,
						labelInBackground: false,
						infoItem: $scope.countItems
					});
					$scope.countItems++;
					$rootScope.markers.push($scope.marker);
					
					$scope.infoWindow = new google.maps.InfoWindow({
						/* jshint expr: true */
						maxWidth: 450,
					}), $scope.marker, i;
					
					var image = '';
					
					if (!item.images[0]){
						image = './images/icons/dummy_task.jpg';
					}else{
						image = item.images[0]+ '.thumb-card.jpg';
					}
					
					var title = item.langs[0].title = item.langs[0].title.substring(0,50);
					var description = item.langs[0].shortdescription;
					var backColor = item.category[0].color;
					var fontColor = item.category[0].fontcolor;
					var catName = item.category[0].name;
					var status = item.status[0].title;
					var css = '';
					var statusCss = '';
					
					if(item.category[0].id == 1 || item.category[0].id == 2){
						css = 'catEmergency';
					}else if(item.category[0].id == 3 || item.category[0].id == 4){
						css = 'catTask';
					}else if(item.category[0].id == 5 || item.category[0].id == 6 || item.category[0].id == 7){
						css = 'catCommerce';
					}else if(item.category[0].id == 8 || item.category[0].id == 9){
						css = 'catHelp';
					}
					
					if(item.status[0].id == 1){
						statusCss = 'statusOpen';
					}else if(item.status[0].id == 2){
						statusCss = 'statusPERFORMING';
					}else if(item.status[0].id == 3){
						statusCss = 'statusCOMPLETE';
					}else if(item.status[0].id == 4){
						statusCss = 'statusCANCELED';
					}
					
					$scope.infoTemplate = '<table>' + '<col style="width:40%">' + '<tr>' + '<td>' +  '<a ui-sref="app.taskpublic({id:' + '\'' + item._id + '\'' + ',' + '\'' + '#' + '\'' + ':' + '\'' + 'mainNavbar' + '\''+ '})">' + '<img class="vertical-center img-responsive img-thumbnail img-candList" src="'+image+'" >' + '</a>' + '</td>' + '<td valign="top">' + '<div class="space-left10">' + '<div class="text-mid vertical-top text-center '+ css +'"  translate>' + catName + '</div>' + '<div class="text-center text-small">' + title + '</div>' + '<div class="text-center text-small">' + description + '</div>' + '</td>' + '</tr>' + '</table>';
					
					$scope.infoTemplate = $compile($scope.infoTemplate)($scope);
						
					$scope.infoWindowContent.push($scope.infoTemplate);
					var markerOne = $scope.marker;					
					google.maps.event.addListener($scope.marker, 'click', (function(markerOne) {
						return function() {
							var i = markerOne.infoItem;
							$scope.infoWindow.setContent($scope.infoWindowContent[i][0]);
							$scope.infoWindow.open($scope.map, markerOne);
						};
					})(markerOne, i));
					
				});
			}
		};
		
		$scope.freshTasks = taskFactory.query({
			status: [1, 1],
			freshTasks: 'true',
			minDist: 0,
			maxDist: 30000,
			centerLon: $scope.coordLon,
			centerLat: $scope.coordLat,
			limit: 1000
		})
		.$promise.then(		
			function (response) {
				$ngSpin.stop();
				if( $rootScope.profileid === undefined){
					$scope.freshTasks = response;
				}else{
					var tempResponse = [];
					response.forEach(function(item, n, arr){
						var taskLangs = $rootScope.swapLang(item.langs);
						var tasktmp = item;
						taskLangs.pop();
						tasktmp.langs = taskLangs;
						tempResponse.push(tasktmp);
					});
					$scope.freshTasks = tempResponse;					
				}
				$scope.showFreshTask = true;
				$scope.mapMarkers($scope.freshTasks, 'fresh');				
			},
			function (response) {
				//ngDialog.closeAll();
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + response.status + " " + response.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
			}
		); 
		
		$scope.localTasks = taskFactory.query({
			status: [1, 1],
			freshTasks: 'false',
			minDist: 0,
			maxDist: 10000,
			centerLon: $scope.coordLon,
			centerLat: $scope.coordLat,
			limit: 1000
		})
		.$promise.then(		
			function (response) {
				$ngSpin.stop();
				if( $rootScope.profileid === undefined){
					$scope.localTasks = response;
				}else{
					var tempResponse = [];
					response.forEach(function(item, n, arr){
						var taskLangs = $rootScope.swapLang(item.langs);
						var tasktmp = item;
						taskLangs.pop();
						tasktmp.langs = taskLangs;
						tempResponse.push(tasktmp);
					});
					$scope.localTasks = tempResponse;					
				}
				$scope.showLocalTask = true;
				$scope.mapMarkers($scope.localTasks, 'local');				
			},
			function (response) {
				//ngDialog.closeAll();
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + response.status + " " + response.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
			}
		);
		
		$scope.regionalTasks = taskFactory.query({
			status: [1, 1],
			freshTasks: 'false',
			minDist: 10000,
			maxDist: 30000,	
			centerLon: $scope.coordLon,
			centerLat: $scope.coordLat,
			limit: 1000
		})
		.$promise.then(		
			function (response) {
				$ngSpin.stop();
				if( $rootScope.profileid === undefined){
					$scope.regionalTasks = response;
				}else{
					var tempResponse = [];
					response.forEach(function(item, n, arr){
						var taskLangs = $rootScope.swapLang(item.langs);
						var tasktmp = item;
						taskLangs.pop();
						tasktmp.langs = taskLangs;
						tempResponse.push(tasktmp);
					});
					$scope.regionalTasks = tempResponse;					
				}
				$scope.showRegionalTasks = true;
				$scope.mapMarkers($scope.regionalTasks, 'regional');
			},			
			function (response) {
				//ngDialog.closeAll();
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + response.status + " " + response.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
			}
		);		
		$rootScope.toggleMarkers();
	};
	
}])

.controller('TaskAddController', ['config', '$scope', '$rootScope', '$state', '$stateParams', '$timeout', 'taskFactory', 'profileFactory', 'infoFactory', 'ngDialog', '$sce', 'FileUploader', 'AuthFactory', '$ngSpin', 'gettextCatalog', function (config, $scope, $rootScope, $state, $stateParams, $timeout, taskFactory, profileFactory, infoFactory, ngDialog, $sce, FileUploader, AuthFactory, $ngSpin, gettextCatalog) {
	
	$ngSpin.start();
	$scope.showAddTask = false;
	$scope.areaDescIs = false;
	$scope.categoryIs = [];	
	
	$scope.catArray = function(){
		if($scope.task.category !== undefined && typeof $scope.task.category === 'string'){
			$scope.categoryIs = $.parseJSON('[' + $scope.task.category + ']');
		}
		return $scope.categoryIs;
	};

	$scope.tasktitle = gettextCatalog.getString("Task title");
	$scope.keywordsplaceholder = gettextCatalog.getString("Enter here the keywords");
	$scope.descriptionplaceholder = gettextCatalog.getString("Task description");
	$scope.conditionplaceholder = gettextCatalog.getString("Task conditions");
	$scope.rewardplaceholder = gettextCatalog.getString("Reward");
	$scope.locationplaceholder = gettextCatalog.getString("Approximate task location");
	$scope.languageplaceholder = gettextCatalog.getString("Select task language...");
	$scope.taskareaplaceholder = gettextCatalog.getString("Write here what the circle means");
	$scope.message = gettextCatalog.getString("Loading ...");
	$scope.mapplace = gettextCatalog.getString("Are You somewhere here?");
	
	$scope.task = {
		range: 0
	};
	
	$scope.coordLat = 0;
	$scope.coordLon = 0;
	$rootScope.markers = [];
	$scope.category = {};
	
	$scope.addrange = false;

	$scope.metamarker = function (x,y,r){		
		if($scope.task.category === undefined){
			var messageTitle = gettextCatalog.getString('Something wrong!');
			var messageText = gettextCatalog.getString('You must select task category first!');
			$scope.modalInfo('modaldiv-red', messageTitle, messageText);
		}else{
			var catId = $scope.catArray()[0].id;
			$('select').attr('disabled','disabled');
			if (catId == 1 || catId == 2){
				$scope.markerIcon = 'images/icons/red.png';
				$scope.cirleColor = '#F54B4B';
			}else if (catId == 3 || catId == 4){
				$scope.markerIcon = 'images/icons/green.png';
				$scope.cirleColor = '#8EE30F';
			}else if (catId == 5 || catId == 6 || catId == 7){
				$scope.markerIcon = 'images/icons/blue.png';
				$scope.cirleColor = '#6FB7FF';
			}else if (catId == 8 || catId == 9){
				$scope.markerIcon = 'images/icons/orange.png';
				$scope.cirleColor = '#FF7300';
			}else{
				$scope.markerIcon = 'images/icons/gray.png';
				$scope.cirleColor = 'gray';			
			}
			
			$scope.marker = new google.maps.Marker({
				map: $scope.map,
				icon: $scope.markerIcon,
				position: new google.maps.LatLng(x, y),
				setMap: $scope.map,  
				draggable: true,
				title: 'Drag me!'
			});			
	
			if($scope.marker){
				document.getElementById('rangeGroup').hidden = false;
				google.maps.event.addListener($scope.marker,'dragend',function(event){
					$scope.coordLat = $scope.marker.getPosition().lat();
					$scope.coordLon = $scope.marker.getPosition().lng();
					$("#coordLat").val($scope.coordLat).trigger('change');
					$("#coordLon").val($scope.coordLon).trigger('change');
					document.getElementById('coordLat').value = event.latLng.lat();
					document.getElementById('coordLon').value = event.latLng.lng();
				});			
			}
			
			$scope.range = function (event){				
				if(event.target.checked === true ){
					$scope.areaDescIs = true;
					//document.getElementById('taskAreaDecs').required = true;
					$scope.task.range = 300;
					
					$scope.circle = new google.maps.Circle({
						map: $scope.map,
						radius: $scope.task.range, 
						editable:true,
						strokeColor: '#000',
						strokeOpacity: 0.3, 
						strokeWeight: 1, 
						fillColor: $scope.cirleColor, 
						fillOpacity: 0.15
					});
					$scope.circle.bindTo('center', $scope.marker, 'position');
					google.maps.event.addListener($scope.circle, 'radius_changed', function() {
						$scope.task.range = Math.round($scope.circle.getRadius());
						$("#range").val($scope.task.range).trigger('change');
					});
					
					google.maps.event.addListener($scope.circle, 'center_changed', function() {
						$scope.coordLat = $scope.circle.getCenter().lat();
						$scope.coordLon = $scope.circle.getCenter().lng();
						$("#coordLat").val($scope.coordLat).trigger('change');
						$("#coordLon").val($scope.coordLon).trigger('change');
					});
				}
				if(event.target.checked === false ){
					document.getElementById('taskAreaDecs').required = false;
					$scope.circle.setMap(null);
					$scope.task.range = 0;
				}
			};			
			$rootScope.markers.push($scope.marker);
		}
	};	

	$scope.mapInit = function () {
		$timeout(function () {
			$scope.mapCenter = new google.maps.LatLng($scope.coordLat, $scope.coordLon);

			$scope.map = new google.maps.Map(document.getElementById('map'), {
				'zoom': $scope.zoomMap,
				'center': $scope.mapCenter,
				'mapTypeId': google.maps.MapTypeId.ROADMAP,
				streetViewControl: false
			});
			
			if($scope.showInfo){
				var infoWindow = new google.maps.InfoWindow({map: $scope.map});
				infoWindow.setPosition($scope.pos);
				infoWindow.setContent($scope.mapplace);
				$scope.map.setCenter($scope.pos);
			}

			$scope.input = document.getElementById('pac-input');
			$scope.searchBox = new google.maps.places.SearchBox($scope.input);
			$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

			$scope.map.addListener('bounds_changed', function() {
				$scope.searchBox.setBounds($scope.map.getBounds());
			});

			$scope.searchBox.addListener('places_changed', function() {
				$scope.places = $scope.searchBox.getPlaces();
				if ($scope.places.length === 0) {
					return;
				}			
				var bounds = new google.maps.LatLngBounds();
				$scope.places.forEach(function(place) {
					if (!place.geometry) {
						return;
					}
					if (place.geometry.viewport) {
						bounds.union(place.geometry.viewport);
					} else {
						bounds.extend(place.geometry.location);
					}
				});				
				$scope.map.fitBounds(bounds);
			});
		}, 500);
	};
	
	if( $rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.goback = true;
		$rootScope.openLogin();
	}else{	
		$rootScope.profile = profileFactory.get({
			id: $rootScope.profileid
		})
		.$promise.then(
			function (response) {
				$rootScope.profile = response;
				$ngSpin.stop();
				
				$( document ).ready(function() {
					$('select optgroup[label="Placeholder"] option:last-child').attr('selected','selected');
					$('select optgroup[label="Placeholder"] option:last-child').attr('disabled','disabled');
					$('select optgroup[label="Placeholder"] option:last-child').attr('hidden','hidden');
					$('optgroup[label="Placeholder"]').attr('hidden','hidden');		
					$("select option:hover").css('backgroundColor', '#FFFFFF');
					document.getElementById('rangeGroup').hidden = true;
				});
								
				
				$rootScope.profileLocation ={ position: [$rootScope.profile.position.coordinates[1], $rootScope.profile.position.coordinates[0]]};
				
				$scope.showAddTask = true;
				
				$scope.taskLang = $rootScope.profile.morelang;
				
				$rootScope.imageAvatar = $rootScope.profile.image + "?cb=" + $rootScope.random;
				$rootScope.count = 0;
				
				if ($rootScope.profile.range <= 500){
					$scope.zoomMap = 15;
				}else if ($rootScope.profile.range > 500 && $rootScope.profile.range <= 1000){
					$scope.zoomMap = 14;
				}else if ($rootScope.profile.range > 1000 && $rootScope.profile.range <= 2000){			
					$scope.zoomMap = 13;
				}else if ($rootScope.profile.range > 1000 && $rootScope.profile.range <= 4000){
					$scope.zoomMap = 12;
				}else if ($rootScope.profile.range > 4000 && $rootScope.profile.range <= 10000){
					$scope.zoomMap = 11;
				}else if ($rootScope.profile.range > 10000 && $rootScope.profile.range <= 16000){			
					$scope.zoomMap = 10;
				}else if ($rootScope.profile.range > 16000){		
					$scope.zoomMap = 9;
				}else{
					$scope.zoomMap = 9;
				}
				
				if ($rootScope.profile.position.coordinates[0] === 0 && $rootScope.profile.position.coordinates[1] === 0){
					$scope.showInfo = true;
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position) {
							$scope.coordLat = position.coords.latitude;
							$scope.coordLon = position.coords.longitude;
							$scope.pos = {
								lat: position.coords.latitude,
								lng: position.coords.longitude
							};
						});
					}
				}else if ($rootScope.profile.position.coordinates[0] !== 0 || $rootScope.profile.position.coordinates[1] !== 0){
					$scope.coordLon = $rootScope.profile.position.coordinates[0];
					$scope.coordLat = $rootScope.profile.position.coordinates[1];					
				}
				$timeout(function () {
					$(document).ready(function(){
						$scope.mapInit();
						$timeout(function () {
							google.maps.event.addListener($scope.map, 'click', function(event) {
								var x = event.latLng.lat();
								$scope.coordLat = x;
								var y = event.latLng.lng();
								$scope.coordLon = y;
								
								$("#coordLat").val($scope.coordLat).trigger('change');
								$("#coordLon").val($scope.coordLon).trigger('change');
								
								if(!$scope.marker){
									$scope.metamarker(x,y,300);
								}else{
									$scope.marker.setPosition(event.latLng);
								}
							});
						}, 1000);
					});
				}, 1000);	
			},
			function (response) {
				if(response.status == 401 || response.status == 403){
					console.log('Error status ',response.status );
					var tick = 0;
					if(tick === 0){
						tick++;
						$rootScope.openLogin();
					}
				}else{
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
			}
		);
	}	
	
	$scope.taskRules = function(){		
		$scope.rule = infoFactory.query({
			language: gettextCatalog.getCurrentLanguage(),
			category: "taskrules",
			limit: 1
		})
		.$promise.then(
			function (response) {
				var rules = response;
				$scope.rule = rules[0];
				var text = $sce.trustAsHtml($scope.rule.text);
				$rootScope.infoOk = true;
				$rootScope.modalConfirm('modaldiv-blue', $scope.rule.title, text, $rootScope.infoOk);						
			},
			function (response) {
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + response.status + " " + response.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
			}
		);
	};
	
	$scope.tokenNow = AuthFactory.getToken();
	
	var uploader = $scope.uploader = new FileUploader({
		url: config.apiUrl + 'tasks/upload',
		headers: {
			'x-access-token': $scope.tokenNow
		},
		queueLimit: 4			
	});
	
	$scope.uploader.clearQueue();	
	
	uploader.filters.push({
		name: 'imageFilter',
		fn: function(item /*{File|FileLikeObject}*/, options) {
			var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
			return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
		}
	});	

	uploader.filters.push({
		name: 'sizeFilter',
		fn: function(item) {
			var size = (item.size/1024/1024).toFixed(2);
			var action = false;
			if (item.size > config.maxFileSize){
				var messageTitle = gettextCatalog.getString('Something wrong!');
				var messageText1 = gettextCatalog.getString('File ');
				var messageText2 = gettextCatalog.getString(' have size ');
				var messageText3 = gettextCatalog.getString(' Mb and more than maximum ');
				var messageText4 = gettextCatalog.getString(' Mb accepted');			
				var message = messageText1 + item.name + messageText2 + size + messageText3 + config.maxFileSize/1024/1024 + messageText4;
				$scope.modalInfo('modaldiv-red', messageTitle, message);
			}else{		
				action = true; 
			}
			return action;
		}
	});	
		
	uploader.onBeforeUploadItem = function(item) {
		item.formData.push({taskid: $rootScope.taskid});
	};	
		
	$scope.accordion = {};
    $scope.accordion.oneAtATime = false;
	
	$scope.addLangs = {};

    $scope.addLangs.lastAddedID = 0;	
	
	$scope.task = {
		address: '',
		areadesc: '',
		notshowmarker: false,
		position: { coordinates: [] },
		langs:[]
	};
	
/* 	$scope.task.langs = [];
	$scope.task.langs.lang = []; */

	$scope.langList = function (){
		var langsStack = [];
		$rootScope.profile.morelang.forEach(function(item1, i, arr) {
			var langCounter = 0;
			var lang = item1.name;
			$scope.task.langs.forEach(function(item, i, arr) {
				if(item.lang.name != lang){
					langCounter++;
				}
			});
			if(langCounter == $scope.task.langs.length){
				langsStack.push(item1);
			}
		});
	  return langsStack;  
	};
	
    $scope.addLang = function(){
		if(!$scope.task.langs.selected){
			var messageTitle = gettextCatalog.getString('Something wrong!');
			var messageText = gettextCatalog.getString('Please select the language from list for the task');
			$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
		}else{		
			$scope.addLangs.lastAddedID++;
			var newLang = {
				"langId": $scope.addLangs.lastAddedID,
				"lang": $scope.task.langs.selected,
				"title": "",
				"description": "",
				"shortdescription":"",
				"conditions": "",
				"tags": [],
				"reward": ""
			};			
			$scope.task.langs.push(newLang);		
			$scope.taskLang = $scope.langList();
			$scope.task.langs.selected = undefined;
		}
    };
	
    $scope.deleteLang = function (langId){
        for(var i = 0; i < $scope.task.langs.length; i++){
            if($scope.task.langs[i].langId == langId){
                $scope.task.langs.splice(i, 1);
				$scope.taskLang = $scope.langList();
                break;
            }
        }
    };
	
	$scope.shortDesc = function(text){
		if(text.length <= 140){
			return text;
		}
		if(text.length > 140){
			return text.substring(0, 140) + "...</p>";
		}
	};
	
    $scope.submitTask = function () {
		$scope.breakFunc = false;
		var messageTitle = '';
		var messageText = '';
		var messageText1 ='';
		var messageText2 = '';
		
		if($scope.categoryIs.length === 0){
			console.log('$scope.task.category 2 is ', $scope.task.category);
			messageTitle = gettextCatalog.getString('Need to select!');
			messageText = gettextCatalog.getString('You must select task category!');
			$scope.modalInfo('modaldiv-red', messageTitle, messageText);
			return;
		}
		if($scope.task.langs.length === 0){
			messageTitle = gettextCatalog.getString('Something wrong!');
			messageText = gettextCatalog.getString('You need to add at least one task language!');
			$scope.modalInfo('modaldiv-red', messageTitle, messageText);
			return;
		} 
		if($scope.task.langs.length > 0){	
			$scope.task.langs.forEach(function(item){
				if(item.title === ''){
					console.log('item.title ', item.title);
					messageTitle = gettextCatalog.getString('Something wrong!');
					messageText1 = gettextCatalog.getString('You need to write a title of the task for the ');
					messageText2 = gettextCatalog.getString(' language!');
					$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
					$scope.breakFunc = true;
					return;
				}else if(item.tags.length === 0){
					messageTitle = gettextCatalog.getString('Something wrong!');
					messageText1 = gettextCatalog.getString('You need to add keywords or phrases of the task for the ');
					messageText2 = gettextCatalog.getString(' language!');
					$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
					$scope.breakFunc = true;
					return;	
				}else if(item.description === ''){
					messageTitle = gettextCatalog.getString('Something wrong!');
					messageText1 = gettextCatalog.getString('You need to write a description of the task for the ');
					messageText2 = gettextCatalog.getString(' language!');
					$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
					$scope.breakFunc = true;
					return;					
				}else if(item.conditions === ''){
					messageTitle = gettextCatalog.getString('Something wrong!');
					messageText1 = gettextCatalog.getString('You need to specify a conditions of the task for the ');
					messageText2 = gettextCatalog.getString(' language!');
					$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
					$scope.breakFunc = true;
					return;	
				}else if(item.reward === ''){
					messageTitle = gettextCatalog.getString('Something wrong!');
					messageText1 = gettextCatalog.getString('You need to write a reward of the task for the ');
					messageText2 = gettextCatalog.getString(' language!');
					$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
					$scope.breakFunc = true;
					return;	
				}	
			});
		}
		if($scope.breakFunc === true){
			return;
		}
		if($scope.task.address === ''){
			messageTitle = gettextCatalog.getString('Something wrong!');
			messageText = gettextCatalog.getString('You need to write a address of the task!');
			$scope.modalInfo('modaldiv-red', messageTitle, messageText);
			return;
		}
		if($scope.areaDescIs === true && $scope.task.areadesc === ''){
			messageTitle = gettextCatalog.getString('Something wrong!');
			messageText = gettextCatalog.getString('You need to specify a description of the range of the task!');
			$scope.modalInfo('modaldiv-red', messageTitle, messageText);
			return;
		}
		if(!$scope.task.position.coordinates[0] || !$scope.task.position.coordinates[1]){
			messageTitle = gettextCatalog.getString('Something wrong!');
			messageText = gettextCatalog.getString('You need to set a marker on the map!');
			$scope.modalInfo('modaldiv-red', messageTitle, messageText);
			return;
		}else{
			$scope.task.category = $scope.categoryIs;
			taskFactory.save($scope.task)
			.$promise.then(
				function (response) {
					$scope.taskresp = response;
					$rootScope.taskid = $scope.taskresp.taskid;					
				
					$scope.uploader.uploadAll();
					messageTitle = gettextCatalog.getString('Task published!');
					$scope.modalInfo('modaldiv-green', messageTitle);
					$timeout(function () {
						$scope.uploader.clearQueue();
						$rootScope.jumboContent();
						history.back();			
					}, 3000);
				},
				function (response) {
					if(response.status == 401 || response.status == 403){
						console.log('Error status ',response.status );
						$rootScope.openLogin();
					}else{
						var errorTitle = gettextCatalog.getString('Something wrong!');
						var errorText = gettextCatalog.getString("Error: ");					
						var message = errorText + " " + response.status + " " + response.statusText;
						$rootScope.modalInfo('modaldiv-red', errorTitle, message);
					}
				}
			);	
		}
	};
	$scope.cancelTask = function (){
		$scope.uploader.clearQueue();
		history.back();
	};	
	$scope.requireLocation = function toggleSelection(event) {		
		if (event.target.checked === true){
			document.getElementById('taskLocation').required = true;	
		}else if  (event.target.checked === false){
			document.getElementById('taskLocation').required = false;
		}
	};	
}])

.controller('TaskEditController', ['config', '$scope', '$rootScope', '$state', '$stateParams', 'profileFactory', 'taskFactory', 'infoFactory', 'NgMap', '$timeout', '$sce', '$ngSpin', 'ngDialog', 'FileUploader', 'AuthFactory', 'gettextCatalog', function(config, $scope, $rootScope, $state, $stateParams, profileFactory, taskFactory, infoFactory, NgMap, $timeout, $sce, $ngSpin, ngDialog, FileUploader, AuthFactory, gettextCatalog){
	
	$ngSpin.start();
	$scope.accordion = {};
    $scope.accordion.oneAtATime = true;
	$scope.maxImages = 4;
	$scope.taskEdit = '';
	$scope.cImages = '';
	$scope.addLangs = {};
	$scope.categoryIs = [];
	
	$scope.languageplaceholder = gettextCatalog.getString("Select task language...");
	
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCE845A8xwaGY2syD92auS-Ff9WaqFGBXY";
	//$rootScope.profile = {};
    $scope.showEditTask = false;

    $scope.message = gettextCatalog.getString("Loading ...");
	$scope.images = [];
	$scope.Math = Math;
	
	if($rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.openLogin();
	}else{	
		$rootScope.profile = profileFactory.get({
			id: $rootScope.profileid				
		})
		.$promise.then(
			function (response) {
				$rootScope.profile = response;
				
				
				
				$scope.taskEdit = taskFactory.get({
					id: $stateParams.id
				})
				.$promise.then(
					function (response) {
						$scope.showEditTask = true;
						$ngSpin.stop();
						$scope.taskEdit = response;	
						
						$scope.addLangs.lastAddedID = $scope.taskEdit.langs.length;
						
						if($scope.taskEdit.langs.length > 1){
							$scope.accordion.oneAtATime = true;
						}else{
							$scope.accordion.oneAtATime = false;
						}

						$scope.langList = function (){
							var langsStack = [];
							$rootScope.profile.morelang.forEach(function(item1, i, arr) {
								var langCounter = 0;
								var lang = item1.name;
								$scope.taskEdit.langs.forEach(function(item, i, arr) {
									if(item.lang.name != lang){
										langCounter++;
									}
								});
								if(langCounter == $scope.taskEdit.langs.length){
									langsStack.push(item1);
								}
							});
						  return langsStack;  
						};
						
						
						$scope.taskLang = $scope.langList();
							
						$scope.imagesCount = function(){
							$scope.cImages = $scope.maxImages-$scope.taskEdit.images.length;						
							return $scope.cImages;
						};
						$scope.imagesCount();
						$scope.coordLat = $scope.taskEdit.position.coordinates[1]; 
						$scope.coordLon = $scope.taskEdit.position.coordinates[0];
						$scope.getImages = function (){
							$scope.images = [];
							$scope.taskEdit.images.forEach(function(image, n, arr){
								var img = $scope.taskEdit.images[n];
								var thumb = img + '.thumb-list.jpg';					
								var lg = img + '.lg.jpg';
								thumb = $sce.trustAsResourceUrl(thumb);
								lg = $sce.trustAsResourceUrl(lg);
								var obj = {									
									'thumb': thumb,
									'lg': lg
								};
								//console.log('obj is' , obj);
								$scope.images.push(obj);					
							});
						};
						$scope.getImages();
		/* 				$(document).ready(function() {
							$("#lightgallery").lightGallery(); 
						}); */
						
						$timeout(function () {
							lightGallery(document.getElementById('lightgallery'),{
								mode: 'lg-fade',
								thumbnail:true,
								animateThumb: true,
								showThumbByDefault: true,
						  });
						}, 1000);				
						
						//$scope.taskLocation ={ position: [$scope.taskEdit.coordLat, $scope.taskEdit.coordLon]};
						$scope.taskLocation ={ position: [$scope.taskEdit.position.coordinates[0], $scope.taskEdit.position.coordinates[1]]};
	
							
						if ($scope.taskEdit.range <= 500){
							$scope.zoomMap = 15;
						}else if ($scope.taskEdit.range > 500 && $scope.taskEdit.range <= 1000){
							$scope.zoomMap = 14;
						}else if ($scope.taskEdit.range > 1000 && $scope.taskEdit.range <= 2000){			
							$scope.zoomMap = 13;
						}else if ($scope.taskEdit.range > 1000 && $scope.taskEdit.range <= 4000){
							$scope.zoomMap = 12;
						}else if ($scope.taskEdit.range > 4000 && $scope.taskEdit.range <= 10000){
							$scope.zoomMap = 11;
						}else if ($scope.taskEdit.range > 10000 && $scope.taskEdit.range <= 16000){			
							$scope.zoomMap = 10;
						}else if ($scope.taskEdit.range > 16000){		
							$scope.zoomMap = 9;
						}else{
							$scope.zoomMap = 9;
						}
						
						$scope.metamarker = function (x,y,r){
							if ($scope.taskEdit.category[0].id == 1 || $scope.taskEdit.category[0].id == 2){
								$scope.markerIcon = 'images/icons/red.png';
								$scope.cirleColor = '#F54B4B';
							}else if ($scope.taskEdit.category[0].id == 3 || $scope.taskEdit.category[0].id == 4){
								$scope.markerIcon = 'images/icons/green.png';
								$scope.cirleColor = '#8EE30F';
							}else if ($scope.taskEdit.category[0].id == 5 || $scope.taskEdit.category[0].id == 6 || $scope.taskEdit.category[0].id == 7){
								$scope.markerIcon = 'images/icons/blue.png';
								$scope.cirleColor = '#6FB7FF';
							}else if ($scope.taskEdit.category[0].id == 8 || $scope.taskEdit.category[0].id == 9){
								$scope.markerIcon = 'images/icons/orange.png';
								$scope.cirleColor = '#FF7300';
							}else{
								$scope.markerIcon = 'images/icons/gray.png';
								$scope.cirleColor = 'gray';			
							}
								
							$scope.marker = new google.maps.Marker({
								map: $scope.map,
								icon: $scope.markerIcon,
								position: new google.maps.LatLng($scope.coordLat, $scope.coordLon),
								setMap: $scope.map,  
								draggable: true,
								title: 'Drag me!'
							});
							
							$scope.setRangeCircle = function(){
								$scope.circle = new google.maps.Circle({
									map: $scope.map,
									radius: $scope.taskEdit.range, 
									editable:true,
									strokeColor: '#000',
									strokeOpacity: 0.3, 
									strokeWeight: 1, 
									fillColor: $scope.cirleColor, 
									fillOpacity: 0.15
								});
								$scope.circle.bindTo('center', $scope.marker, 'position');
										
								google.maps.event.addListener($scope.circle, 'radius_changed', function() {
									//console.log('getRadius circle '+ Math.round($scope.circle.getRadius()));
									$scope.taskEdit.range = Math.round($scope.circle.getRadius());
									$("#range").val($scope.taskEdit.range).trigger('change');
								});	
							};
													
							
							google.maps.event.addListener($scope.marker,'dragend',function(event){
								$scope.coordLat = $scope.marker.getPosition().lat();
								$scope.coordLon = $scope.marker.getPosition().lng();
								$("#coordLat").val($scope.coordLat).trigger('change');
								$("#coordLon").val($scope.coordLon).trigger('change');
								document.getElementById('coordLat').value = event.latLng.lat();
								document.getElementById('coordLon').value = event.latLng.lng();
							});			
							
							$scope.range = function (event){								
								if(event.target.checked === true && $scope.taskEdit.range > 0){		
									//document.getElementById('taskAreaDecs').required = true;
									$scope.areaDescIs = true;
									$scope.setRangeCircle();
								}
								if(event.target.checked === true && $scope.taskEdit.range === 0){
									$scope.taskEdit.range = 300;
									//document.getElementById('taskAreaDecs').required = true;
									$scope.areaDescIs = true;
									$scope.setRangeCircle();
								}
								if(event.target.checked === false ){
									//document.getElementById('taskAreaDecs').required = false;
									$scope.areaDescIs = false;
									$scope.circle.setMap(null);
									$scope.taskEdit.range = 0;
								}
							};
							
							if ($scope.taskEdit.areadesc.length > 0){
								$('#addRange').trigger('click');
							}						
						};
						
						$scope.mapInit = function () {
							$timeout(function () {
								$scope.mapCenter = new google.maps.LatLng($scope.coordLat, $scope.coordLon);

								$scope.map = new google.maps.Map(document.getElementById('map'), {
									'zoom': $scope.zoomMap,
									'center': $scope.mapCenter,
									'mapTypeId': google.maps.MapTypeId.ROADMAP,
									streetViewControl: false
								});
								
								if($scope.showInfo){
									var infoWindow = new google.maps.InfoWindow({map: $scope.map});
										infoWindow.setPosition($scope.pos);
										infoWindow.setContent($scope.mapplace);
										$scope.map.setCenter($scope.pos);
								}

								$scope.input = document.getElementById('pac-input');
								$scope.searchBox = new google.maps.places.SearchBox($scope.input);
								$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

								$scope.map.addListener('bounds_changed', function() {
									$scope.searchBox.setBounds($scope.map.getBounds());
								});

								$scope.searchBox.addListener('places_changed', function() {
									$scope.places = $scope.searchBox.getPlaces();
									if ($scope.places.length === 0) {
										return;
									}				
									var bounds = new google.maps.LatLngBounds();
									$scope.places.forEach(function(place) {
										if (!place.geometry) {
											//console.log("Returned place contains no geometry");
											return;
										}
										if (place.geometry.viewport) {
										// Only geocodes have viewport.
											bounds.union(place.geometry.viewport);
										} else {
											bounds.extend(place.geometry.location);
										}
									});				
									$scope.map.fitBounds(bounds);
								});
							}, 500);
						};
						
						$scope.addLang = function(){
							if(!$scope.taskEdit.langs.selected){
								var messageTitle = gettextCatalog.getString('Upps!');
								var messageText = gettextCatalog.getString('Please select the language for the task first');
								$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
							}else{
							
								$scope.addLangs.lastAddedID++;
								var newLang = {
									"langId": $scope.addLangs.lastAddedID,
									"lang": $scope.taskEdit.langs.selected,
									"title": "",
									"description": "",
									"shortdescription":"",
									"conditions": "",
									"tags": [],
									"reward": ""
								};
								
								$scope.taskEdit.langs.push(newLang);		
								$scope.taskLang = $scope.langList();
								$scope.taskEdit.langs.selected = undefined;
							}
						};
						
						$scope.deleteLang = function (langId){
							for(var i = 0; i < $scope.taskEdit.langs.length; i++){
								if($scope.taskEdit.langs[i].langId == langId){
									$scope.taskEdit.langs.splice(i, 1);
									$scope.taskLang = $scope.langList();
									break;
								}
							}
						};

						//$scope.taskEdit.langs = [];
						
						$scope.submitTask = function () {
							$scope.breakFunc = false;
							var messageTitle = '';
							var messageText = '';
							var messageText1 = '';
							var messageText2 = '';
							
							if($scope.taskEdit.langs.length === 0){
								messageTitle = gettextCatalog.getString('Something wrong!');
								messageText = gettextCatalog.getString('You need to add at least one task language!');
								$scope.modalInfo('modaldiv-red', messageTitle, messageText);
								return;
							}
							if($scope.taskEdit.langs.length > 0){	
								$scope.taskEdit.langs.forEach(function(item){
									if(item.title === ''){
										console.log('item.title ', item.title);
										messageTitle = gettextCatalog.getString('Something wrong!');
										messageText1 = gettextCatalog.getString('You need to write a title of the task for the ');
										messageText2 = gettextCatalog.getString(' language!');
										$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
										$scope.breakFunc = true;
										return;
									}else if(item.tags.length === 0){
										messageTitle = gettextCatalog.getString('Something wrong!');
										messageText1 = gettextCatalog.getString('You need to add keywords or phrases of the task for the ');
										messageText2 = gettextCatalog.getString(' language!');
										$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
										$scope.breakFunc = true;
										return;	
									}else if(item.description === ''){
										messageTitle = gettextCatalog.getString('Something wrong!');
										messageText1 = gettextCatalog.getString('You need to write a description of the task for the ');
										messageText2 = gettextCatalog.getString(' language!');
										$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
										$scope.breakFunc = true;
										return;					
									}else if(item.conditions === ''){
										messageTitle = gettextCatalog.getString('Something wrong!');
										messageText1 = gettextCatalog.getString('You need to specify a conditions of the task for the ');
										messageText2 = gettextCatalog.getString(' language!');
										$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
										$scope.breakFunc = true;
										return;	
									}else if(item.reward === ''){
										messageTitle = gettextCatalog.getString('Something wrong!');
										messageText1 = gettextCatalog.getString('You need to write a reward of the task for the ');
										messageText2 = gettextCatalog.getString(' language!');
										$scope.modalInfo('modaldiv-red', messageTitle, messageText1 + item.lang.nativeName + messageText2);
										$scope.breakFunc = true;
										return;	
									}	
								});
							}
							if($scope.breakFunc === true){
								return;
							}
							if($scope.taskEdit.address === ''){
								messageTitle = gettextCatalog.getString('Something wrong!');
								messageText = gettextCatalog.getString('You need to write a address of the task!');
								$scope.modalInfo('modaldiv-red', messageTitle, messageText);
								return;
							}
							if($scope.areaDescIs === true && $scope.taskEdit.areadesc === ''){
								messageTitle = gettextCatalog.getString('Something wrong!');
								messageText = gettextCatalog.getString('You need to specify a description of the range of the task!');
								$scope.modalInfo('modaldiv-red', messageTitle, messageText);
								return;
							}
							if(!$scope.taskEdit.position.coordinates[0] || !$scope.taskEdit.position.coordinates[1]){
								messageTitle = gettextCatalog.getString('Something wrong!');
								messageText = gettextCatalog.getString('You need to set a marker on the map!');
								$scope.modalInfo('modaldiv-red', messageTitle, messageText);
								return;
							}else{
								taskFactory.update({
									id: $scope.taskEdit._id
								},
								$scope.taskEdit
								)
								.$promise.then(
									function (response) {
										$scope.taskresp = response;
										//console.log('taskresponse ', $scope.taskresp);
										$rootScope.taskid = $scope.taskEdit._id;
										//console.log('Updated task with id ' + $rootScope.taskid);					
									
										$scope.uploader.uploadAll();
										var messageTitle = gettextCatalog.getString('Task updated!');
										$scope.modalInfo('modaldiv-green', messageTitle);
										$timeout(function () {
											$scope.uploader.clearQueue();
											$rootScope.jumboContent();
											history.back();			
										}, 3000);
									},
									function (response) {
										if(response.status == 401 || response.status == 403){
											console.log('Error status ',response.status );
											$rootScope.openLogin();
										}else{
											var errorTitle = gettextCatalog.getString('Something wrong!');
											var errorText = gettextCatalog.getString("Error: ");					
											var message = errorText + " " + response.status + " " + response.statusText;
											$rootScope.modalInfo('modaldiv-red', errorTitle, message);
										}
									}
								);	
							}
						};

						$scope.cancelTask = function (){
							$scope.uploader.clearQueue();
							$scope.taskEdit = {};
							history.back();		
						};
						
						$scope.requireLocation = function toggleSelection(event) {		
							if (event.target.checked === true){
								document.getElementById('taskLocation').required = true;	
							}else if  (event.target.checked === false){
								document.getElementById('taskLocation').required = false;
							}
							//$document[0].getElementById('taskLocation').required = event.target.checked;
							  // how to check if checkbox is selected or not
							  //console.log(event.target.checked);
						};	
						
						$scope.taskRules = function(){		
							$scope.rule = infoFactory.query({
								language: gettextCatalog.getCurrentLanguage(),
								category: "taskrules",
								limit: 1
							})
							.$promise.then(
								function (response) {
									var rules = response;
									$scope.rule = rules[0];
									var text = $sce.trustAsHtml($scope.rule.text);
									$rootScope.infoOk = true;
									$rootScope.modalConfirm('modaldiv-blue', $scope.rule.title, text, $rootScope.infoOk);						
								},
								function (response) {
									var errorTitle = gettextCatalog.getString('Something wrong!');
									var errorText = gettextCatalog.getString("Error: ");					
									var message = errorText + " " + response.status + " " + response.statusText;
									$rootScope.modalInfo('modaldiv-red', errorTitle, message);
								}
							);
						};
						
						$timeout(function () {
							$(document).ready(function(){
								
								
								document.getElementById('rangeGroup').hidden = false;
								$scope.mapInit();						
								$timeout(function () {
									$scope.metamarker($scope.coordLat,$scope.coordLon,$scope.taskEdit.range);
								}, 1000);
							});
						}, 1000);
						
						$scope.deleteTaskImage = function (index){							
							$scope.taskEdit.images.splice(index,1);
							$scope.imagesCount();
							$scope.getImages();
						};
							
						$scope.tokenNow = AuthFactory.getToken();	
						var uploader = $scope.uploader = new FileUploader({
							url: config.apiUrl + 'tasks/upload',
							headers: {
								'x-access-token': $scope.tokenNow									
							},
							queueLimit: $scope.cImages		
						});						
						
						$scope.uploader.clearQueue();	
						
						uploader.filters.push({
							name: 'imageFilter',
							fn: function(item /*{File|FileLikeObject}*/, options) {
								var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
								return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
							}
						});	

						uploader.filters.push({
							name: 'sizeFilter',
							fn: function(item) {
								var size = (item.size/1024/1024).toFixed(2);
								var action = false;
								if (item.size > config.maxFileSize){
									var message = 'File ' + item.name + ' have size ' + size + ' Mb and more than maximum ' + config.maxFileSize/1024/1024 + ' Mb accepted';
									$scope.modalInfo('modaldiv-red', 'Oops, something go wrong!', message);
								}else{		
									action = true; 
								}
								return action;
							}
						});	
							
						uploader.onBeforeUploadItem = function(item) {
							item.formData.push({taskid: $scope.taskEdit._id});
							console.info('onBeforeUploadItem', item);
						};	
						
						console.info('uploader', uploader);	
					},
					function (response) {
						if(response.status == 401 || response.status == 403){
							console.log('Error status ',response.status );
							var tick = 0;
							if(tick === 0){
								tick++;
								$rootScope.reloadState = 1;
								$rootScope.openLogin();
							}
						}else{
							var errorTitle = gettextCatalog.getString('Something wrong!');
							var errorText = gettextCatalog.getString("Error: ");					
							var message = errorText + " " + response.status + " " + response.statusText;
							$rootScope.modalInfo('modaldiv-red', errorTitle, message);
						}
					}
				);	
			},
			function (response) {
				if(response.status == 401 || response.status == 403){ console.log('Error status ',response.status );
					var tick = 0;
					if(tick === 0){
						tick++;
						$rootScope.reloadState = 1;
						$rootScope.openLogin();							
					}
				}else{
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
			}
		);
	}	
	
}])

.controller('TaskPrivateController', ['$scope', '$rootScope', '$state', '$stateParams', 'profileFactory', 'profileCommentFactory', 'taskFactory', 'taskQuestionFactory', 'taskCommentFactory', 'taskCandidateFactory', 'NgMap', '$timeout', '$sce', '$ngSpin', 'gettextCatalog', function($scope, $rootScope, $state, $stateParams, profileFactory, profileCommentFactory, taskFactory, taskQuestionFactory, taskCommentFactory, taskCandidateFactory, NgMap, $timeout, $sce, $ngSpin, gettextCatalog){
	
	$ngSpin.start();
	$scope.accordion = {};
	
    $scope.statusplaceholder = gettextCatalog.getString("Select task status ...");
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCE845A8xwaGY2syD92auS-Ff9WaqFGBXY";
	//$rootScope.profile = {};
    $scope.showTask = false;
	$scope.showComments = false;
	$scope.showQuestions = false;
	$scope.showCandidates = false;
	$scope.viewCandList = false;
	
    $scope.message = gettextCatalog.getString("Loading ...");
	$scope.images = [];
	$scope.Math = Math;
	
	$scope.rating = 0;
	
	$scope.currentPageRow = 1;
	$scope.pageSizeRow = 3;
	
	$scope.currentPageList = 1;
	$scope.pageSizeList = 6;

	$scope.question = {};
	
	$scope.pageSizeQRow = 5;
	$scope.currentQPage = 1;	
	
	$scope.pageSizeCRow = 5;
	$scope.currentCPage = 1;
	
	$scope.questions = [];
	
	$scope.pageChangeHandler = function(num) {
		//console.log('tasks page changed to ' + num);
	};
	
	if($rootScope.needLogin === true){
		$rootScope.needLogin = false;
		$rootScope.openLogin();		
	}

	if( $rootScope.profileid === undefined){
		$rootScope.reloadState = 1;
		$rootScope.openLogin();
	}else{	
		$scope.task = taskFactory.get({
			id: $stateParams.id
        })
        .$promise.then(
            function (response) {
				if($rootScope.profileid != response.postedBy._id){
					$rootScope.goback = true;
					$rootScope.reloadState = 1;
					$rootScope.openLogin();
				}else{
					$scope.showTask = true;
					$scope.showQuestions = true;
					$scope.showComments = true;				
					$scope.showCandidates = true;
					$ngSpin.stop();
				}
				$scope.task = response;
				$scope.chkStatus = function(){
					var result = [];
					$rootScope.setStatus.forEach(function(status){
						if (status.id > $scope.task.status[0].id) result.push(status);
					});
					return result;
				};
				
				$scope.statusList = $scope.chkStatus();
				//$scope.statusList = $rootScope.setStatus;
				
				if($scope.task.langs.length === 1) {
					$scope.taskLangsOpen = true;				
				}else{
					$scope.taskLangsOpen = false;
				}

				$scope.task.images.forEach(function(image, n, arr){
					var img = $scope.task.images[n];
					var thumb = img + '.thumb-list.jpg';					
					var lg = img + '.lg.jpg';
					thumb = $sce.trustAsResourceUrl(thumb);
					lg = $sce.trustAsResourceUrl(lg);
					var obj = {
						'thumb': thumb,
						'lg': lg
					};
					$scope.images.push(obj);					
				});
				
/* 				$(document).ready(function() {
					$("#lightgallery").lightGallery(); 
				}); */
				
				$timeout(function () {
					lightGallery(document.getElementById('lightgallery'),{
						mode: 'lg-fade',
						thumbnail:true,
						animateThumb: true,
						showThumbByDefault: true,
				  });
				}, 1000);
				
				$scope.taskLocation = { position: [$scope.task.position.coordinates[1], $scope.task.position.coordinates[0]]};
					
				if ($scope.task.range <= 500){
					$scope.zoomMap = 15;
				}else if ($scope.task.range > 500 && $scope.task.range <= 1000){
					$scope.zoomMap = 14;
				}else if ($scope.task.range > 1000 && $scope.task.range <= 2000){			
					$scope.zoomMap = 13;
				}else if ($scope.task.range > 1000 && $scope.task.range <= 4000){
					$scope.zoomMap = 12;
				}else if ($scope.task.range > 4000 && $scope.task.range <= 10000){
					$scope.zoomMap = 11;
				}else if ($scope.task.range > 10000 && $scope.task.range <= 16000){			
					$scope.zoomMap = 10;
				}else if ($scope.task.range > 16000){		
					$scope.zoomMap = 9;
				}else{
					$scope.zoomMap = 9;
				}
				
				if ($scope.task.category[0].id == 1 || $scope.task.category[0].id == 2){
					$scope.markerIcon = 'images/icons/red.png';
					$scope.cirleColor = '#F54B4B';
				}else if ($scope.task.category[0].id == 3 || $scope.task.category[0].id == 4){
					$scope.markerIcon = 'images/icons/green.png';
					$scope.cirleColor = '#8EE30F';
				}else if ($scope.task.category[0].id == 5 || $scope.task.category[0].id == 6 || $scope.task.category[0].id == 7){
					$scope.markerIcon = 'images/icons/blue.png';
					$scope.cirleColor = '#6FB7FF';
				}else if ($scope.task.category[0].id == 8 || $scope.task.category[0].id == 9){
					$scope.markerIcon = 'images/icons/orange.png';
					$scope.cirleColor = '#FF7300';
				}else{
					$scope.markerIcon = 'images/icons/gray.png';
					$scope.cirleColor = 'gray';			
				}			
				
				$scope.gMap = NgMap.getMap().then(function(map) {
					map.setZoom($scope.zoomMap);
				});
				
				$scope.accordion = {};
				
				if($scope.task.candidates.length > 1){
					$scope.accordion.onePerformerAtATime = true;
				}else{
					$scope.accordion.onePerformerAtATime = false;
				}
				
				$scope.performers = [];
				$scope.counterP = 0;

				if($scope.task.candidates.length > 0 && $scope.task.status[0].id == 2){						
					$scope.task.candidates.forEach(function(unit){
						if(unit.status == 'Performer'){
							$scope.counterP++;
							var performerComment = {
								"commentId": $scope.counterP,
								"image": unit.postedBy.image,
								"fullname": unit.postedBy.fullname,
								"performerId": unit.postedBy._id,
								"rating": 0,
								"comment": "",
								"postedBy":$rootScope.profileid,
								"taskBy": $scope.task._id
							};						
							$scope.performers.push(performerComment);
						}	
					});
				}
				
				$scope.candidateRating = function(count, summ){
					if(count === 0){
						return 0;
					}else{
						return Math.round(summ/count);
					}
				};
				
				$scope.changeStatus = function(){
					var messageTitle = '';
					var messageText = '';
					console.log("$scope.task.status.selected is ", $scope.task.status.selected);
					if($scope.task.status.selected === undefined){
						messageTitle = gettextCatalog.getString('Need to select!');
						messageText = gettextCatalog.getString('Before change task status u must sellect from list!');

						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else{
						$scope.taskStatus = {
							status: [$scope.task.status.selected]
						};
						
						taskFactory.update({
							id: $scope.task._id
						},
							$scope.taskStatus
						)
						.$promise.then(
							function (response) {
								$scope.task = response;
								if($scope.taskStatus.status[0].id == 2){
									$scope.candidate = {
											status: "Performer"
									};
									$scope.task.candidates.forEach(function(cand){
										if(cand.status == 'Accepted'){
											taskCandidateFactory.update({
												id:$scope.task._id,
												candidateId: cand._id
											},
												$scope.candidate
											)
											.$promise.then( function (response) {},
												function (response) {
													if(response.status == 401 || response.status == 401){
														console.log('Error status ',response.status );
														var tick = 0;
														if(tick === 0){
															tick++;
															$rootScope.reloadState = 1;
															$rootScope.openLogin();
														}
													}else{
														var errorTitle = gettextCatalog.getString('Something wrong!');
														var errorText = gettextCatalog.getString("Error: ");					
														var message = errorText + " " + response.status + " " + response.statusText;
														$rootScope.modalInfo('modaldiv-red', errorTitle, message);
													}
												}
											);
										}
									});
									messageTitle = gettextCatalog.getString('Task status updated!');
									messageText = gettextCatalog.getString('You successfull change task status to ');
									$rootScope.modalInfo('modaldiv-green', messageTitle, messageText + $scope.taskStatus.status[0].title + '!');
									$timeout(function () {								
										$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});
									}, 2000);
									
								}else if($scope.taskStatus.status[0].id == 3){
									messageTitle = gettextCatalog.getString('Task status updated!');
									messageText = gettextCatalog.getString('You successfull change task status to ');
									$rootScope.modalInfo('modaldiv-green', messageTitle, messageText + $scope.taskStatus.status[0].title + '!');
									if($scope.performers.length > 0){
										$scope.performers.forEach(function(performer, i, arr){
											
											var performerComment = {
												"rating": performer.rating,
												"comment": performer.comment,
												"postedBy": performer.postedBy,
												"taskBy": performer.taskBy
											};
											profileCommentFactory.save(
												{id: performer.performerId}, performerComment
											)
											.$promise.then(
												function (response) {
												},
												function (response) {
													var errorTitle = gettextCatalog.getString('Something wrong!');
													var errorText = gettextCatalog.getString("Error: ");					
													var message = errorText + " " + response.status + " " + response.statusText;
													$rootScope.modalInfo('modaldiv-red', errorTitle, message);
												}
											);
										});
									}
									
									$timeout(function () {								
										$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});
									}, 2000);
								}else if($scope.taskStatus.status[0].id == 4){
									messageTitle = gettextCatalog.getString('Task status updated!');
									messageText = gettextCatalog.getString('You successfull change task status to ');
									$rootScope.modalInfo('modaldiv-green', messageTitle, messageText + $scope.taskStatus.status[0].title + '!');
									$timeout(function () {								
										$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});
									}, 2000);
								}
							},
							function (response) {
								if(response.status == 401 || response.status == 403){
									console.log('Error status ',response.status );
									var tick = 0;
									if(tick === 0){
										tick++;
										$rootScope.reloadState = 0;
										$rootScope.openLogin();
									}
								}else{
									var errorTitle = gettextCatalog.getString('Something wrong!');
									var errorText = gettextCatalog.getString("Error: ");					
									var message = errorText + " " + response.status + " " + response.statusText;
									$rootScope.modalInfo('modaldiv-red', errorTitle, message);
								}
							}
						);
					}	
				};				
				$(document).ready(function(){							
					if($scope.task.langs.length > 1) {
						$('#oneOpen').trigger('click');
						$('#langId1').trigger('click');
						$scope.accordion.oneAtATime = true;
						$scope.taskLangsOpen = true;				
					}else{
						
						$scope.taskLangsOpen = false;
					}
				});

				$scope.answer = {
					text: ""
				};
				
				$scope.collapseOthersReply = function (id){
					$scope.task.questions.forEach(function(item, i, arr) {
						if(item.id != id){
							var idAlink = '#make_answer'+item.id;
							$(idAlink).collapse('hide');
						}
					});
				};
				
				$scope.collapseOthersEdits = function (id){
					$scope.task.questions.forEach(function(item, i, arr) {
						if(item.id != id){
							var idElink = '#make_editAnswer'+item.id;
							$(idElink).collapse('hide');
						}
					});
				};
				
				$scope.setText = function(answer){
					//console.log('answer is ', answer);
					$scope.answer = answer;
				};
				
				$scope.submitAnswer = function (taskId, questionId){
					$scope.answer.status = 1;
					var messageTitle = '';
					var messageText = '';
					
					if( $rootScope.profileid === undefined){
						$rootScope.openLogin();
					}else{
						$scope.task.questions.forEach(function (item, i , arr){
							if(item._id == questionId){
								$scope.question = item;
								$scope.question.answer = $scope.answer;
								$scope.question.answer[0].status = 1;
							}
						});
						
						if ($scope.question.answer[0].text === '' || $scope.question.answer[0].text === undefined){
							messageTitle = gettextCatalog.getString('Something is not right!');
							messageText = gettextCatalog.getString('You must enter the text of the answer before sending it');
							$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
						}else if($rootScope.profileid != $scope.task.postedBy._id){
							messageTitle = gettextCatalog.getString('Something is not right!');
							messageText = gettextCatalog.getString('Sorry, You can not answer this question, because you are not the master of the task');
							$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
						}else{
							taskQuestionFactory.update({
								id:taskId,
								questionId: questionId
							},
								$scope.question
							)
							.$promise.then(
								function (response) {
									messageTitle = gettextCatalog.getString('Answer edited successfully!');
									messageText = gettextCatalog.getString('You edit answer and save!');
									$rootScope.modalInfo('modaldiv-green', messageTitle, messageText);
									$scope.answer = {
										text: ""
									};
									
									$scope.task = taskFactory.get({
										id: $stateParams.id
									})
									.$promise.then(
										function (response) {											
											$scope.task = response;
											
										},
										function (response) {
											if(response.status == 401 || response.status == 403){
												console.log('Error status ',response.status );
												$rootScope.openLogin();
											}else{
												var errorTitle = gettextCatalog.getString('Something wrong!');
												var errorText = gettextCatalog.getString("Error: ");					
												var message = errorText + " " + response.status + " " + response.statusText;
												$rootScope.modalInfo('modaldiv-red', errorTitle, message);
											}
										}
									);									
								},
								function (response) {
									if(response.status == 401 || response.status == 403){
										console.log('Error status ',response.status );
										var tick = 0;
										if(tick === 0){
											tick++;
											$rootScope.reloadState = 1;
											$rootScope.openLogin();											
										}
									}
									var errorTitle = gettextCatalog.getString('Something wrong!');
									var errorText = gettextCatalog.getString("Error: ");					
									var message = errorText + " " + response.status + " " + response.statusText;
									$rootScope.modalInfo('modaldiv-red', errorTitle, message);
								}
							);
						}
					}
				};				
		
				$scope.comment = {				
					text: "",
					avatar: ""
				};

				$scope.submitComment = function () {
					var messageTitle = '';
					var messageText = '';
					
					if ($scope.comment.text === '' || $scope.comment.text === undefined){
						messageTitle = gettextCatalog.getString('Something is not right!');
						messageText = gettextCatalog.getString('You must enter the text of the comment before sending it');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else{
						$scope.commentIdCounter = 0;
						
						$scope.task = taskFactory.get({
							id: $stateParams.id
						})
						.$promise.then(
							function (response) {
								$scope.task = response;
								if($scope.task.comments){							
									$scope.task.comments.forEach(function(item, i, arr) {
										if($scope.commentIdCounter < item.id){
											$scope.commentIdCounter = item.id;
										} 
									});
								}
								$scope.comment.id = $scope.commentIdCounter + 1;
								
								if($rootScope.profileid === undefined){
									$rootScope.openLogin();
								}else{
									$rootScope.profile = profileFactory.get({
										id: $rootScope.profileid
									})
									.$promise.then(
										function (response) {
											$rootScope.profile = response;
											$scope.comment.avatar = $rootScope.profile.image;
											taskCommentFactory.save(
												{id: $stateParams.id}, $scope.comment
											)
											.$promise.then(
												function (response) {
													document.getElementById('commentCollapse').click();
													$state.go($state.current, {}, {reload: true});
													messageTitle = gettextCatalog.getString('Comment added to task!');
													messageText = gettextCatalog.getString('Your comment successfully added!');
													$rootScope.modalInfo('modaldiv-green', messageTitle, messageText);
													$scope.comment = {
														title: "",
														commenttext: ""
													};	
												},
												function (response) {
													if(response.status == 401 || response.status == 403){
														console.log('Error status ',response.status );
														$rootScope.reloadState = 1;
														$rootScope.openLogin();
														
													}else{
														var errorTitle = gettextCatalog.getString('Something wrong!');
														var errorText = gettextCatalog.getString("Error: ");					
														var message = errorText + " " + response.status + " " + response.statusText;
														$rootScope.modalInfo('modaldiv-red', errorTitle, message);
													}
												}
											);	
										},
										function (response) {
											if(response.status == 401 || response.status == 403){
												console.log('Error status ',response.status );
												$rootScope.openLogin();
											}else{
												var errorTitle = gettextCatalog.getString('Something wrong!');
												var errorText = gettextCatalog.getString("Error: ");					
												var message = errorText + " " + response.status + " " + response.statusText;
												$rootScope.modalInfo('modaldiv-red', errorTitle, message);
											}
										}
									);
								}
							},
							function (response) {
								if(response.status == 401 || response.status == 403){
									console.log('Error status ',response.status );
									$rootScope.openLogin();
								}else{
									var errorTitle = gettextCatalog.getString('Something wrong!');
									var errorText = gettextCatalog.getString("Error: ");					
									var message = errorText + " " + response.status + " " + response.statusText;
									$rootScope.modalInfo('modaldiv-red', errorTitle, message);
								}
							}							
						);
					}       
				};
            },
            function (response) {
				if(response.status == 401 || response.status == 403){
					console.log('Error status ',response.status );
					var tick = 0;
					if(tick === 0){
						tick++;
						$rootScope.reloadState = 1;
						$rootScope.openLogin();					
					}
				}else{
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
				}
            }
        );
	}
}])

.controller('TaskPublicController', ['$scope', '$rootScope', '$state', '$stateParams', 'profileFactory', 'taskFactory', 'taskQuestionFactory', 'taskCommentFactory', 'taskCandidateFactory', 'profileOtherTaskFactory', 'NgMap', '$timeout', '$sce', '$ngSpin', 'gettextCatalog', function($scope, $rootScope, $state, $stateParams, profileFactory, taskFactory, taskQuestionFactory, taskCommentFactory, taskCandidateFactory, profileOtherTaskFactory, NgMap, $timeout, $sce, $ngSpin, gettextCatalog){
	

	$ngSpin.start();
	$scope.accordion = {};
    $scope.accordion.oneAtATime = true;
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
	$scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyCE845A8xwaGY2syD92auS-Ff9WaqFGBXY";
	//$rootScope.profile = {};
    $scope.showTask = false;
	$scope.showQuestions = false;
	$scope.showComments = false;	
    $scope.message = gettextCatalog.getString("Loading ...");
    $scope.notRated = gettextCatalog.getString('Not rated');

	$scope.taskImage = '';
	$scope.candExist = 0;
	$scope.images = [];
	
	$scope.currentQPage = 1;
	$scope.currentCPage = 1;
	$scope.pageSizeRow = 5;

    $scope.task = taskFactory.get({
		id: $stateParams.id
	})
	.$promise.then(
		function (response) {
			$scope.showTask = true;
			$scope.showQuestions = true;
			$scope.showComments = true;
			$ngSpin.stop();
			//$scope.task = response;
			
			
			if( $rootScope.profileid === undefined){
				console.log("$rootScope.profileid === undefined");
				$scope.task = response;
			}else{
				console.log("$rootScope.profileid is ", $rootScope.profileid);
				var taskLangs = $rootScope.swapLang(response.langs);
				console.log("taskLangs is ", taskLangs);
				var tasktmp = response;
				taskLangs.pop();
				tasktmp.langs = taskLangs;
				$scope.task = tasktmp;
			}
			
			if($scope.task.images[0]){
				$scope.taskImage = $scope.task.images[0] + '.thumb-card.jpg';
			}else{
				$scope.taskImage = './images/icons/dummy_task.jpg';
			}
			
			$scope.checkOwner = function(){
				if($rootScope.profile){
					if($scope.task.postedBy._id == $rootScope.profile._id){
						$state.go('app.taskprivate', {'id': $scope.task._id, '#': 'mainNavbar'});
					}
				}
			};
			
			$scope.userRating = function(){
				if($scope.task.postedBy.ratingCount === 0){
					return $scope.notRated;
				}else{
					return Math.round($scope.task.postedBy.ratingSumm/$scope.task.postedBy.ratingCount);
				}
			};
			
			$scope.checkOwner();
			
			$scope.task.images.forEach(function(image, n, arr){
				var img = $scope.task.images[n];
				var thumb = img + '.thumb-list.jpg';					
				var lg = img + '.lg.jpg';
				thumb = $sce.trustAsResourceUrl(thumb);
				lg = $sce.trustAsResourceUrl(lg);
				var obj = {
					'thumb': thumb,
					'lg': lg
				};
				$scope.images.push(obj);					
			});
			
/* 				$(document).ready(function() {
				$("#lightgallery").lightGallery(); 
			}); */
			
			$timeout(function () {
				lightGallery(document.getElementById('lightgallery'),{
					mode: 'lg-fade',
					thumbnail:true,
					animateThumb: true,
					showThumbByDefault: true,
			  });
			}, 1000);
			
			if($scope.task.langs.length === 1) {
				$scope.taskLangsOpen = true;				
			}else{
				$scope.taskLangsOpen = false;
			}
			
			$scope.taskLocation ={ position: [$scope.task.position.coordinates[1], $scope.task.position.coordinates[0]]};
				
			if ($scope.task.range <= 500){
				$scope.zoomMap = 15;
			}else if ($scope.task.range > 500 && $scope.task.range <= 1000){
				$scope.zoomMap = 14;
			}else if ($scope.task.range > 1000 && $scope.task.range <= 2000){			
				$scope.zoomMap = 13;
			}else if ($scope.task.range > 1000 && $scope.task.range <= 4000){
				$scope.zoomMap = 12;
			}else if ($scope.task.range > 4000 && $scope.task.range <= 10000){
				$scope.zoomMap = 11;
			}else if ($scope.task.range > 10000 && $scope.task.range <= 16000){			
				$scope.zoomMap = 10;
			}else if ($scope.task.range > 16000){		
				$scope.zoomMap = 9;
			}else{
				$scope.zoomMap = 9;
			}
			
			
			if ($scope.task.category[0].id == 1 || $scope.task.category[0].id == 2){
				$scope.markerIcon = 'images/icons/red.png';
				$scope.cirleColor = '#F54B4B';
			}else if ($scope.task.category[0].id == 3 || $scope.task.category[0].id == 4){
				$scope.markerIcon = 'images/icons/green.png';
				$scope.cirleColor = '#8EE30F';
			}else if ($scope.task.category[0].id == 5 || $scope.task.category[0].id == 6 || $scope.task.category[0].id == 7){
				$scope.markerIcon = 'images/icons/blue.png';
				$scope.cirleColor = '#6FB7FF';
			}else if ($scope.task.category[0].id == 8 || $scope.task.category[0].id == 9){
				$scope.markerIcon = 'images/icons/orange.png';
				$scope.cirleColor = '#FF7300';
			}else{
				$scope.markerIcon = 'images/icons/gray.png';
				$scope.cirleColor = 'gray';			
			}
			
			$scope.gMap = NgMap.getMap().then(function(map) {
				map.setZoom($scope.zoomMap);
			});
			
			$scope.reply = '';
			
			$scope.candidateExist = function (){
				$scope.candExist = 0;

				if($rootScope.profile !== undefined){
					if($rootScope.profileid !== undefined){
						if($scope.task.candidates.length > 0){								
							$scope.task.candidates.forEach(function(item, i, arr) {	
					
								if($rootScope.profileid == item.postedBy._id) {
									$scope.candExist = 1;
									$scope.reply = item.reply;								
								}
							});
							if($scope.candExist === 0){
								return false;								
							}else{
								return true;
							}
						}else{							
							return false;
						}
					}else{
						return false;
					}
				}else{
					return false;
				}
			};
					
			$scope.candidateExist();
			
			$scope.candidateStatus = function(){
				$scope.status = '';
				if($rootScope.profileid !== undefined){					
					if($scope.task.candidates.length > 0){
						$scope.task.candidates.forEach(function(item, i, arr) {									
							if($rootScope.profileid == item.postedBy._id) {
								$scope.status = item.status;									
							}
						});
					}
				}
				return $scope.status;					
			};
			
			$scope.candidate = {
				taskid: $stateParams.id,
				status: 'Applicant',
				statement: ''
			};
			
			$scope.choisedTask = {
				taskBy: $stateParams.id,
				taskstatus: 'Choised'
			};
	
			$scope.submitCandidate = function () {
				var messageTitle = '';
				var messageText = '';
				
				if($rootScope.profileid === undefined){
				$rootScope.reloadState = 1;
				$rootScope.goback = true;
				$rootScope.openLogin();
				}else{
					$rootScope.profile = profileFactory.get({
						id: $rootScope.profileid
					})
					.$promise.then(
						function (response) {
							$rootScope.profile = response;
							if($rootScope.profile == $scope.task.postedBy._id){
								messageTitle = gettextCatalog.getString('Something is not right!');
								messageText = gettextCatalog.getString('You can not be a candidate for the task, because you own it!');
								$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
								$state.reload();
							}else{
								$scope.candidateExist();							
								
								var exist = $scope.candidateExist();
								if(exist === false){	
									$scope.addCandidate();
									
								}else if(exist === true) {
									messageTitle = gettextCatalog.getString('Something is not right!');
									messageText = gettextCatalog.getString('You already added as candidate for task!');
									$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
								}
							}	
						},
						function (response) {
							if(response.status == 401 || response.status == 403){
								console.log('Error status ',response.status );
								$rootScope.reloadState = 1;
								$rootScope.openLogin();	
								$scope.candidateExist();
							}else{
								var errorTitle = gettextCatalog.getString('Something wrong!');
								var errorText = gettextCatalog.getString("Error: ");					
								var message = errorText + " " + response.status + " " + response.statusText;
								$rootScope.modalInfo('modaldiv-red', errorTitle, message);
							}
						}
					);
				}
				$scope.addCandidate = function(){
					if($scope.candidate.statement === ''){
						messageTitle = gettextCatalog.getString('Something is not right!');
						messageText = gettextCatalog.getString('Please fill out the statement form!');
						$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
					}else{	
						taskCandidateFactory.save(
							{id: $stateParams.id}, $scope.candidate
						)
						.$promise.then(
							function (response) {
								//console.log("taskCandidateFactory.save success");
								if($scope.candidate.status == 'Applicant'){
									messageTitle = gettextCatalog.getString('Added to task!');
									messageText = gettextCatalog.getString('You have been added to task as posible performer with applicant status, thanks');
									$rootScope.modalInfo('modaldiv-green', messageTitle, messageText);
								}
								if($scope.candidate.status == 'Not interested'){
									messageTitle = gettextCatalog.getString('Task is checked!');
									messageText = gettextCatalog.getString('You marked the task as not interesting');
									$rootScope.modalInfo('modaldiv-yellow', messageTitle, messageText);
								}
								$scope.isRecommended = false;
								$scope.otherTaskId = '';
								if ($rootScope.profile.othertasks.length > 0){
									$rootScope.profile.othertasks.forEach(function(item, i, arr){
										if (item.taskBy._id == $stateParams.id && item.taskstatus == 'Recommended'){
											$scope.isRecommended = true;
											$scope.otherTaskId = item._id;											
										}
									});
								}
								
								if($scope.isRecommended === true){
									$scope.choisedTask = {
										taskstatus: 'Choised'
									};
									
									profileOtherTaskFactory.update({
										id: $rootScope.profileid,
										othertaskId: $scope.otherTaskId										
									}, 
										$scope.choisedTask
									)
									.$promise.then(
										function (response) {											
											$rootScope.reLoadProfile();
										},
										function (response) {
											var errorTitle = gettextCatalog.getString('Something wrong!');
											var errorText = gettextCatalog.getString("Error: ");					
											var message = errorText + " " + response.status + " " + response.statusText;
											$rootScope.modalInfo('modaldiv-red', errorTitle, message);
										}
									);								
								}
								
								if($scope.isRecommended === false){			
									profileOtherTaskFactory.save(
										{id: $rootScope.profileid}, $scope.choisedTask
									)
									.$promise.then(
										function (response) {											
											$rootScope.reLoadProfile();
										},
										function (response) {
											var errorTitle = gettextCatalog.getString('Something wrong!');
											var errorText = gettextCatalog.getString("Error: ");					
											var message = errorText + " " + response.status + " " + response.statusText;
											$rootScope.modalInfo('modaldiv-red', errorTitle, message);
										}
									);
								}
								$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});
							},
							function (response) {
								var errorTitle = gettextCatalog.getString('Something wrong!');
								var errorText = gettextCatalog.getString("Error: ");					
								var message = errorText + " " + response.status + " " + response.statusText;
								$rootScope.modalInfo('modaldiv-red', errorTitle, message);
							}
						);
					}	
				};
			};

			$scope.cancelCandidate = function(){
				$scope.candidate = {
					taskid: $stateParams.id,
					status: 'Not interested'
				};
				$scope.choisedTask = {
					taskBy: $stateParams.id,
					taskstatus: 'Refused'
				};
				$scope.submitCandidate();
			};				
			
			$scope.question = {				
				title: "",
				text: "",
				avatar: ""
			};

			$scope.submitQuestion = function () {
				var messageTitle = '';
				var messageText = '';
				
				if ($scope.question.text === '' || $scope.question.text === undefined){
					messageTitle = gettextCatalog.getString('Something is not right!');
					messageText = gettextCatalog.getString('You must enter the text of the question before sending it');
					$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
				}else{
					$scope.questionIdCounter = 0;
					
					$scope.taskQuestion = taskFactory.get({
						id: $stateParams.id
					})
					.$promise.then(
						function (response) {
							$scope.taskQuestion = response;
							if($scope.taskQuestion.questions){							
								$scope.taskQuestion.questions.forEach(function(item, i, arr) {
									if($scope.questionIdCounter < item.id) $scope.questionIdCounter = item.id;
								});
							}
							$scope.question.id = $scope.questionIdCounter + 1;
							if($rootScope.profileid === undefined){
								$rootScope.openLogin();
							}else if($rootScope.profileid == $scope.task.postedBy._id){
								messageTitle = gettextCatalog.getString('Sorry!');
								messageText = gettextCatalog.getString('You can not ask yourself.<br>If there is anything to say write this in the description of the task, thank you');
								$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
								$state.go('app.taskprivate', {'id': $scope.task._id, '#': 'mainNavbar'});									
							}else{
								$rootScope.profile = profileFactory.get({
									id: $rootScope.profileid
								})
								.$promise.then(
									function (response) {
										$rootScope.profile = response;
										$scope.question.avatar = $rootScope.profile.image;
										taskQuestionFactory.save(
											{id: $stateParams.id}, $scope.question
										)
										.$promise.then(
											function (response) {
												document.getElementById('questionCollapse').click();
												$state.go($state.current, {}, {reload: true});
												$scope.question = {
													title: "",
													questiontext: ""
												};	
											},
											function (response) {
												if(response.status == 401 || response.status == 403){ 
													console.log('Error status ',response.status );
													$rootScope.openLogin();
												}else{
													var errorTitle = gettextCatalog.getString('Something wrong!');
													var errorText = gettextCatalog.getString("Error: ");					
													var message = errorText + " " + response.status + " " + response.statusText;
													$rootScope.modalInfo('modaldiv-red', errorTitle, message);
												}
											}
										);	
									},
									function (response) {
										if(response.status == 401 || response.status == 403){ 
											console.log('Error status ',response.status );
											$rootScope.openLogin();
										}else{
											var errorTitle = gettextCatalog.getString('Something wrong!');
											var errorText = gettextCatalog.getString("Error: ");					
											var message = errorText + " " + response.status + " " + response.statusText;
											$rootScope.modalInfo('modaldiv-red', errorTitle, message);
										}
									}
								);
							}
						},
						function (response) {									
							var errorTitle = gettextCatalog.getString('Something wrong!');
							var errorText = gettextCatalog.getString("Error: ");					
							var message = errorText + " " + response.status + " " + response.statusText;
							$rootScope.modalInfo('modaldiv-red', errorTitle, message);
						}						
					);
				}       
			};
			
			$scope.comment = {				
				text: "",
				avatar: ""
			};

			$scope.submitComment = function () {
				var messageTitle = '';
				var messageText = '';				
				if ($scope.comment.text === '' || $scope.comment.text === undefined){
					messageTitle = gettextCatalog.getString('Something is not right!');
					messageText = gettextCatalog.getString('You must enter the text of the comment before sending it');
					$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
				}else{
					$scope.commentIdCounter = 0;
					
					$scope.taskComment = taskFactory.get({
						id: $stateParams.id
					})
					.$promise.then(
						function (response) {
							$scope.taskComment = response;
							if($scope.taskComment.comments){							
								$scope.taskComment.comments.forEach(function(item, i, arr) {
									if($scope.commentIdCounter < item.id) $scope.commentIdCounter = item.id;
								});
							}
							$scope.comment.id = $scope.commentIdCounter + 1;
							
							if($rootScope.profileid === undefined){
								$rootScope.openLogin();	
							}else{
								$rootScope.profile = profileFactory.get({
									id: $rootScope.profileid
								})
								.$promise.then(
									function (response) {
										$rootScope.profile = response;
										$scope.comment.avatar = $rootScope.profile.image;
										taskCommentFactory.save(
											{id: $stateParams.id}, $scope.comment
										)
										.$promise.then(
											function (response) {
												document.getElementById('commentCollapse').click();
												$state.go($state.current, {}, {reload: true});
												$scope.comment = {
													title: "",
													commenttext: ""
												};	
											},
											function (response) {
												if(response.status == 401 || response.status == 403){ 
													console.log('Error status ',response.status );
													$rootScope.reloadState = 1;
													$rootScope.openLogin();													
												}else{
													var errorTitle = gettextCatalog.getString('Something wrong!');
													var errorText = gettextCatalog.getString("Error: ");					
													var message = errorText + " " + response.status + " " + response.statusText;
													$rootScope.modalInfo('modaldiv-red', errorTitle, message);
												}
											}
										);	
									},
									function (response) {
										if(response.status == 401 || response.status == 403){ 
											console.log('Error status ',response.status );
											$rootScope.openLogin();
										}
										var errorTitle = gettextCatalog.getString('Something wrong!');
										var errorText = gettextCatalog.getString("Error: ");					
										var message = errorText + " " + response.status + " " + response.statusText;
										$rootScope.modalInfo('modaldiv-red', errorTitle, message);
									}
								);
							}
						},
						function (response) {
							if(response.status == 401 || response.status == 403){ 
								console.log('Error status ',response.status );
								$rootScope.openLogin();
							}else{
								var errorTitle = gettextCatalog.getString('Something wrong!');
								var errorText = gettextCatalog.getString("Error: ");					
								var message = errorText + " " + response.status + " " + response.statusText;
								$rootScope.modalInfo('modaldiv-red', errorTitle, message);
							}
						}						
					);
				}       
			};
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);	
}])

.controller('ContactController', ['$scope', '$rootScope', '$state', '$stateParams', 'proposalFactory', 'infoFactory', 'complainFactory', '$ngSpin', 'gettextCatalog', function ($scope, $rootScope, $state, $stateParams, proposalFactory, infoFactory, complainFactory, $ngSpin, gettextCatalog) {
	$ngSpin.start();
    $scope.showProposal = false;
	$scope.showComplain = false;
	$scope.showTips = false;
	$scope.showAbout = false;
    $scope.message = gettextCatalog.getString("Loading ...");
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
	$scope.currentPropsPage = 1;
	$scope.currentCompsPage = 1;
	$scope.pageSizeRow = 5;
	
	$scope.proposals = proposalFactory.query();
	$scope.showProposal = true;
	
	$scope.complains = complainFactory.query();
	$scope.showComplain = true;
	
	var tips = infoFactory.query({
		language: gettextCatalog.getCurrentLanguage(),
		category: "tips",
		randomOne: true
	})
	.$promise.then(		
		function (response) {
			$ngSpin.stop();
			var tips = response;
			
			$scope.tip = tips[0];
			$scope.showTips = true;
			
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);
	
	var about = infoFactory.query({
		language: gettextCatalog.getCurrentLanguage(),
		category: "about",
		randomOne: true
	})
	.$promise.then(		
		function (response) {
			$ngSpin.stop();
			var about = response;
			
			$scope.about = about[0];
			$scope.showAbout = true;
			
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);	
	
	$scope.proposal = {
		title: "",
		proposaltext: ""
	};	
	
    $scope.submitProposal = function () {
		if ($scope.proposal.proposaltext === '' || $scope.proposal.proposaltext === undefined){
			var messageTitle = gettextCatalog.getString('Something is not right!');
			var messageText = gettextCatalog.getString('You must enter the text of the proposal before sending it');
			$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
		}else{
			proposalFactory.save(
				$scope.proposal
			)
			.$promise.then(
				function (response) {
					$scope.showProposal = false;
					$scope.proposals = proposalFactory.query();
					//console.log($scope.proposals);
					$scope.showProposal = true;
					document.getElementById('proposalCollapse').click();
					document.getElementById('proposalSubmit').disabled = true;
					$scope.proposal = {
						title: "",
						proposaltext: ""
					}; 
				},
				function (response) {
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
					
				}
			);
		}     
    };
	
	$scope.complain = {
		title: "",
		complaintext: ""
	};	
	
    $scope.submitComplain = function () {
		if ($scope.complain.complaintext === '' || $scope.complain.complaintext === undefined){
			var messageTitle = gettextCatalog.getString('Something wrong!');
			var messageText = gettextCatalog.getString('You must enter the text of the complain before trying to send');
			$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
		}else{
			complainFactory.save(
				$scope.complain
			)
			.$promise.then(
				function (response) {
					$scope.showQuestion = false;
					$scope.complains = complainFactory.query();
					//console.log($scope.complain);
					$scope.showQuestion = true;
					document.getElementById('complainCollapse').click();
					document.getElementById('complainSubmit').disabled = true;
					$scope.complain = {
						title: "",
						complaintext: ""
					}; 
				},
				function (response) {
					var errorTitle = gettextCatalog.getString('Something wrong!');
					var errorText = gettextCatalog.getString("Error: ");					
					var message = errorText + " " + response.status + " " + response.statusText;
					$rootScope.modalInfo('modaldiv-red', errorTitle, message);
					
				}
			);
		}
	};	
}])

.controller('InfoController', ['$scope', '$rootScope', '$state', '$stateParams', 'infoFactory', '$ngSpin', 'gettextCatalog', function ($scope, $rootScope, $state,  $stateParams, infoFactory, $ngSpin, gettextCatalog) {
	$ngSpin.start();
    $scope.showInfo = false;
    $scope.message = gettextCatalog.getString("Loading ...");
	
	infoFactory.query(function (response) {
			$ngSpin.stop();
            $scope.info = response;
            $scope.showInfo = true;

        },
        function (response) {
            var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
        });

}])

.controller('InfoDetailsController', ['$scope', '$rootScope', '$state', '$stateParams', 'infoFactory', '$ngSpin', 'gettextCatalog', function ($scope, $rootScope, $state, $stateParams, infoFactory, $ngSpin, gettextCatalog) {
	$ngSpin.start();
    $scope.info = {};
    $scope.showInfo = false;
    $scope.message = gettextCatalog.getString("Loading ...");
	
    $scope.info = infoFactory.get({
		id: $stateParams.id
	})
	.$promise.then(
		function (response) {
			$ngSpin.stop();
			$scope.info = response;
			$scope.showInfo = true;
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);
}])
	
.controller('NewsController', ['$scope', '$rootScope', '$state', '$timeout', '$compile', '$stateParams', 'infoFactory', 'taskFactory', '$ngSpin', 'gettextCatalog', function ($scope, $rootScope, $state, $timeout, $compile, $stateParams, infoFactory, taskFactory, $ngSpin, gettextCatalog) {	
	
	$ngSpin.start();
	
	$scope.filterTextPlaceholder = gettextCatalog.getString("Filter text");
	
	// var category = req.query.category;
	// var skip = req.query.skip || 0;
	// var limit = req.query.limit || 20;	
	// var randomOne = req.query.randomOne || false;
	
	$scope.viewNews = false;
	$scope.viewFTaskList = false;
	$scope.viewNTaskList = false;
	$scope.showTips = false;
	
	$scope.Math = Math;
    $scope.message = gettextCatalog.getString("Loading ...");
	
	$scope.currentFPageRow = 1;
	$scope.currentNPageRow = 1;
	$scope.pageFSizeRow = 6;
	$scope.pageNSizeRow = 6;
	
	$scope.currentFPageList = 1;
	$scope.currentNPageList = 1;
	$scope.pageFSizeList = 5;
	$scope.pageNSizeList = 5;
		
	$scope.coordLat = 0;
	$scope.coordLon = 0;
	$scope.zoomMap = 13;
	$rootScope.markers = [];
	$scope.infoWindowContent = [];
	
	$rootScope.taskFilter = {};
	
	$rootScope.taskFilter.freshFilter = true;
	$rootScope.taskFilter.localFilter = true;
	$rootScope.taskFilter.regionalFilter = true;
	
	$rootScope.catFilter = {};
	$rootScope.catFilter.catGroup1 = true;
	$rootScope.catFilter.catGroup2 = true;
	$rootScope.catFilter.catGroup3 = true;
	$rootScope.catFilter.catGroup4 = true;
	
	$rootScope.statFilter = {};
	$rootScope.statFilter.statTask1 = true;
	$rootScope.statFilter.statTask2 = true;
	$rootScope.statFilter.statTask3 = true;
	
	$scope.tip1 = infoFactory.query({
		category: "tips",
		randomOne: true
	})
	.$promise.then(		
		function (response) {
			$ngSpin.stop();
			$scope.tip1 = response[0];
			//console.log("$scope.tip 1 is ", $scope.tip);
			$scope.showTips = true;
			
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);

	if($rootScope.profileid === undefined || !$scope.coordLat || !$scope.coordLon){	
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				$scope.coordLat = position.coords.latitude;
				$scope.coordLon = position.coords.longitude;
				$scope.pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				$(document).ready(function(){							
					$scope.mapInit();
				});
			},
				function errorCallback(error) {
					var messageTitle = gettextCatalog.getString('Can not find your location!');
					var messageText = gettextCatalog.getString('Sorry, but automatic geolocation can not find your position now. <br> Try to use search line to find your position.');
					$rootScope.modalInfo('modaldiv-red', messageTitle, messageText);
				},
				{
					maximumAge:Infinity,
					timeout:5000
				}
			
			);
		}		
	}else{
		$scope.coordLon = $rootScope.profile.position.coordinates[0];
		$scope.coordLat = $rootScope.profile.position.coordinates[1];		
		$timeout(function () {
			$(document).ready(function(){							
				$scope.mapInit();
			});
		}, 2000);
	}
	
	$scope.tips = infoFactory.query({
		category: "tips",
		randomOne: true
	})
	.$promise.then(
		function (response) {
			$ngSpin.stop();
			$scope.tips = response;
			
			$scope.tip = $scope.tips[0];
			$scope.showTips = true;
			
		},
		function (response) {
			var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
		}
	);
	
    $scope.showNews1 = false;
	$scope.showNews2 = false;
	//$scope.showTasks = false;
    $scope.message = gettextCatalog.getString("Loading ...");
	
	$scope.news = infoFactory.query({
		category: "news",
		limit: 100
		
		},
        function (response) {
            $scope.news = response;
            //$scope.showInfo = true;
			$scope.showNews = true;
			//console.log($scope.news);

        },
        function (response) {
            var errorTitle = gettextCatalog.getString('Something wrong!');
			var errorText = gettextCatalog.getString("Error: ");					
			var message = errorText + " " + response.status + " " + response.statusText;
			$rootScope.modalInfo('modaldiv-red', errorTitle, message);
        });
		
/* 	infoFactory.query({
		category: "news",
		skip: 9,
		limit: 9
		
		},
        function (response) {
            $scope.news2 = response;
            //$scope.showInfo = true;
			$scope.showNews2 = true;
			//console.log($scope.news2);

        },
        function (response) {
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });	 */	

	$scope.mapInit = function () {
		$scope.mapCenter = new google.maps.LatLng($scope.coordLat, $scope.coordLon);

		$scope.map = new google.maps.Map(document.getElementById('map'), {
			'zoom': $scope.zoomMap,
			'center': $scope.mapCenter,
			'mapTypeId': google.maps.MapTypeId.ROADMAP,
			streetViewControl: false
		});
		
		$scope.input = document.getElementById('pac-input');
		$scope.searchBox = new google.maps.places.SearchBox($scope.input);
		$scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

		$scope.map.addListener('bounds_changed', function() {
			$scope.searchBox.setBounds($scope.map.getBounds());
		});

		$scope.searchBox.addListener('places_changed', function() {
			$scope.places = $scope.searchBox.getPlaces();
			if ($scope.places.length === 0) {
				return;
			}				
			var bounds = new google.maps.LatLngBounds();
			$scope.places.forEach(function(place) {
				if (!place.geometry) {
					//console.log("Returned place contains no geometry");
					return;
				}
				if (place.geometry.viewport) {
				// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});				
			$scope.map.fitBounds(bounds);
		});
		$scope.countItems = 0;
		$scope.mapMarkers = function(mArray, nArray){
			$scope.nameArray = nArray;
			$scope.cssLabel = '';
			$scope.markerLabel = '';
			
			//console.log('nArray is ' + nArray);
			if(mArray.length > 0){
				mArray.forEach(function(item, i, arr) {
					if (item.category[0].id == 1 || item.category[0].id == 2){
						$scope.markerIcon = 'images/icons/red.png';
						$scope.cirleColor = '#F54B4B';
						$scope.cssLabel = 'cssEmergency';
						if(item.category[0].id == 1){										
							$scope.markerLabel = gettextCatalog.getString('Life is in danger!');
						}
						if(item.category[0].id == 2){
							$scope.markerLabel = gettextCatalog.getString('I urgently need help!');
						}
					}else if (item.category[0].id == 3 || item.category[0].id == 4){
						$scope.markerIcon = 'images/icons/green.png';
						$scope.cirleColor = '#8EE30F';
						$scope.cssLabel = 'cssTask';
						if(item.category[0].id == 3){
							$scope.markerLabel = gettextCatalog.getString('I set the task');
						}
						if(item.category[0].id == 4){
							$scope.markerLabel = gettextCatalog.getString('I am performing tasks');
						}
					}else if (item.category[0].id == 5 || item.category[0].id == 6 || item.category[0].id == 7){
						$scope.markerIcon = 'images/icons/blue.png';
						$scope.cirleColor = '#6FB7FF';
						$scope.cssLabel = 'cssCommerce';
						if(item.category[0].id == 5){
							$scope.markerLabel = gettextCatalog.getString('I sell');
						}
						if(item.category[0].id == 6){
							$scope.markerLabel = gettextCatalog.getString('I will buy');
						}
						if(item.category[0].id == 7){
							$scope.markerLabel = gettextCatalog.getString('I am changing');
						}
					}else if (item.category[0].id == 8 || item.category[0].id == 9){
						$scope.markerIcon = 'images/icons/orange.png';
						$scope.cirleColor = '#FF7300';
						$scope.cssLabel = 'cssHelp';
						if(item.category[0].id == 8){
							$scope.markerLabel = gettextCatalog.getString('Help me, please!');
						}
						if(item.category[0].id == 9){
							$scope.markerLabel = gettextCatalog.getString('I want to help');
						}
					}else{
						$scope.markerIcon = 'images/icons/gray.png';
						$scope.cirleColor = 'gray';			
					}
					
					$scope.marker = new MarkerWithLabel({								
						position: new google.maps.LatLng(item.position.coordinates[1], item.position.coordinates[0]),
						icon: $scope.markerIcon,
						map: $scope.map,
						category: item.category[0].id,
						status: item.status[0].id,
						nameArray: $scope.nameArray,										
						labelContent: $scope.markerLabel,
						labelAnchor: new google.maps.Point(30, 47),
						labelClass: $scope.cssLabel,
						labelInBackground: false,
						infoItem: $scope.countItems
					});
					$scope.countItems++;
					$rootScope.markers.push($scope.marker);
					
					$scope.infoWindow = new google.maps.InfoWindow({
						/* jshint expr: true */
						maxWidth: 450,
					}), $scope.marker, i;
					
					var image = '';
					
					if (!item.images[0]){
						image = './images/icons/dummy_task.jpg';
					}else{
						image = item.images[0]+ '.thumb-card.jpg';
					}
					
					var title = item.langs[0].title = item.langs[0].title.substring(0,50);
					var description = item.langs[0].shortdescription;
					var backColor = item.category[0].color;
					var fontColor = item.category[0].fontcolor;
					var catName = item.category[0].name;
					var status = item.status[0].title;
					var css = '';
					var statusCss = '';
					
					if(item.category[0].id == 1 || item.category[0].id == 2){
						css = 'catEmergency';
					}else if(item.category[0].id == 3 || item.category[0].id == 4){
						css = 'catTask';
					}else if(item.category[0].id == 5 || item.category[0].id == 6 || item.category[0].id == 7){
						css = 'catCommerce';
					}else if(item.category[0].id == 8 || item.category[0].id == 9){
						css = 'catHelp';
					}
					
					if(item.status[0].id == 1){
						statusCss = 'statusOpen';
					}else if(item.status[0].id == 2){
						statusCss = 'statusPERFORMING';
					}else if(item.status[0].id == 3){
						statusCss = 'statusCOMPLETE';
					}else if(item.status[0].id == 4){
						statusCss = 'statusCANCELED';
					}
					
					$scope.infoTemplate = '<table>' + '<col style="width:40%">' + '<tr>' + '<td>' +  '<a ui-sref="app.taskpublic({id:' + '\'' + item._id + '\'' + ',' + '\'' + '#' + '\'' + ':' + '\'' + 'mainNavbar' + '\''+ '})">' + '<img class="vertical-center img-responsive img-thumbnail img-candList" src="'+image+'" >' + '</a>' + '</td>' + '<td valign="top">' + '<div class="space-left10">' + '<div class="text-mid vertical-top text-center '+ css +'"  translate>' + catName + '</div>' + '<div class="text-center text-small">' + title + '</div>' + '<div class="text-center text-small">' + description + '</div>' + '</td>' + '</tr>' + '</table>';
					
					$scope.infoTemplate = $compile($scope.infoTemplate)($scope);
						
					$scope.infoWindowContent.push($scope.infoTemplate);
					var markerOne = $scope.marker;
					
					google.maps.event.addListener($scope.marker, 'click', (function(markerOne) {
						var i = markerOne.infoItem;
						return function() {
							$scope.infoWindow.setContent($scope.infoWindowContent[i][0]);
							$scope.infoWindow.open($scope.map, markerOne);
						};
					})(markerOne, i));
					
				});
			}
		};
		
		$scope.freshTasks = taskFactory.query({
			status: [1, 1],
			freshTasks: 'true',
			minDist: 0,
			maxDist: 30000,
			centerLon: $scope.coordLon,
			centerLat: $scope.coordLat,
			limit: 1000
		})
		.$promise.then(		
			function (response) {
				$ngSpin.stop();
				$scope.freshTasks = response;
				$scope.showFreshTask = true;
				$scope.mapMarkers($scope.freshTasks, 'fresh');
			},
			function (response) {
				var errorTitle = gettextCatalog.getString('Something wrong!');
				var errorText = gettextCatalog.getString("Error: ");					
				var message = errorText + " " + response.status + " " + response.statusText;
				$rootScope.modalInfo('modaldiv-red', errorTitle, message);
			}
		); 
 		//$scope.mapMarkers($scope.localTasks, 'local');
		//$scope.mapMarkers($scope.regionalTasks, 'regional');
		$rootScope.toggleMarkers();
	};
	
}])
;