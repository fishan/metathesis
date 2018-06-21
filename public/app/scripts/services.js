/*jshint esversion: 6 */
/*jslint devel: true */
/*jslint jquery: true */
/*jshint strict:false */
/*jshint node: true */
/*jslint browser: true */
/*global angular:false */
/*jshint -W080 */
'use strict';

angular.module('metathesisApp')
.constant("baseURL", "https://localhost:3443/") //secure
//.constant("baseURL", "https://localhost:3000/")

.factory('infoFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "infos/:id", null, {
            'update': {method: 'PUT'}

	});
}])

.factory('taskFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "tasks/:id", null, {
            'update': {method: 'PUT'}
	});
}])

.factory('taskCandidateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "tasks/:id/candidates/:candidateId", {id:"@Id", candidateId: "@CandidateId"}, {'update': {method: 'PUT'}
	});
}])

.factory('taskQuestionFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "tasks/:id/questions/:questionId", {id:"@Id", questionId: "@QuestionId"}, {'update': {method: 'PUT'}
	});
}])

.factory('taskAnswerFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
		return $resource(baseURL + "tasks/:id/answers/:answerId", {id:"@Id", answerId: "@AnswerId"}, {'update': {method: 'PUT'}
	});
}])

.factory('taskCommentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "tasks/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {'update': {method: 'PUT'}
	});
}])

.factory('favoriteFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "favorites/:id", null, {
            'update': {method: 'PUT'},
            //'query':  {method:'GET', isArray:true}
	});
}])

.factory('profileFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "profiles/:id", null, {
            'update': {method: 'PUT'},
           //'query':  {method:'GET', isArray:true}
	});
}])

.factory('profileOtherTaskFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "profiles/:id/othertasks/:othertaskId", {id:"@Id", othertaskId: "@OthertaskId"}, {'update': {method: 'PUT'}
	});
}])

.factory('profileCommentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "profiles/:id/comments/:commentId", {id:"@Id", commentId: "@CommentId"}, {'update': {method: 'PUT'}
	});
}])

.factory('profileUserTasksFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
        return $resource(baseURL + "profiles/:id/usertasks/:usertaskId", {id:"@Id", commentId: "@UsertaskId"}, {'update': {method: 'PUT'}
	});
}])


.factory('proposalFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "proposals/:id", null, {
            'update': {method: 'PUT'},
			'query':  {method:'GET', isArray:true}
	});
}])

.factory('complainFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
    return $resource(baseURL + "complains/:id", null, {
            'update': {method: 'PUT'},
			'query':  {method:'GET', isArray:true}
	});
}])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    };
}])

.factory('AuthFactory', ['$state', '$stateParams', '$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', '$timeout', 'profileFactory', '$ngSpin', 'gettextCatalog', function($state, $stateParams, $resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog, $timeout, profileFactory, $ngSpin, gettextCatalog){

    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
	var userid = '';
	var profileid = '';
    var authToken = undefined;

	function loadUserCredentials() {
		var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
		if (credentials.username !== undefined) {
		useCredentials(credentials);
		}
	}

	function storeUserCredentials(credentials) {
		$localStorage.storeObject(TOKEN_KEY, credentials);
		useCredentials(credentials);
	}

	function useCredentials(credentials) {
		isAuthenticated = true;
		username = credentials.username;
		profileid = credentials.profileid;
		authToken = credentials.token;
		// Set the token as header for your requests!
		$http.defaults.headers.common['x-access-token'] = authToken;
	}

	function destroyUserCredentials() {
		authToken = undefined;
		userid = '';
		username = '';
		profileid = '';
		isAuthenticated = false;
		$http.defaults.headers.common['x-access-token'] = authToken;
		$localStorage.remove(TOKEN_KEY);
	}
    authFac.login = function(loginData) {
		$ngSpin.start();
        $resource(baseURL + "users/login")
        .save(loginData,
			function(response) {				
				storeUserCredentials({username:loginData.username, profileid: response.profileid, token: response.token});
				$rootScope.profileid = response.profileid;
				$rootScope.userid = response.userid;
				$rootScope.token = response.token;
				$rootScope.$broadcast('login:Successful');
				$rootScope.profile = profileFactory.get({
					id: $rootScope.profileid
				})
				.$promise.then(
					function (response) {
						$rootScope.profile = response;
						$ngSpin.stop();
						if(response.mainlang[0]){
							console.log('response.mainlang[0].id ' + response.mainlang[0].id);
							$rootScope.visitorLang.selected = response.mainlang[0].id;								
							gettextCatalog.setCurrentLanguage(response.mainlang[0].id);
						}
						if($rootScope.reloadState == 1){
							$rootScope.reloadState = 0;
							$state.go($state.current, {'#': 'mainNavbar'}, {reload: true});							
						}
					},
					function (response) {
						var message = "Error: " + response.status + " " + response.statusText;
					}
				);			  
           },
           function(response){
				isAuthenticated = false;
				$rootScope.infodiv = 'modaldiv-red';
				$rootScope.info = gettextCatalog.getString('Login Failed !');
				console.log('response.data is ', response.data);
				if(response.data.err.name == 'IncorrectUsernameError'){
					$rootScope.infomid = gettextCatalog.getString('Password or username are incorrect');
				}else{
					$rootScope.infomid = response.data.err.message;
				}				
				ngDialog.open({ 
					template: 'views/infomodal.html',
					showClose: false,
					controller:"InfoModalController"
				});
           }
        );
    };

    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
		$rootScope.profile = {};
		$rootScope.profileid = undefined;
    };

    authFac.register = function(registerData) {

        $resource(baseURL + "users/register")
        .save(registerData,
			function(response) {			   
				authFac.login({username:registerData.username, password:registerData.password});
				$rootScope.infodiv = 'modaldiv-green';
				$rootScope.info = gettextCatalog.getString('Register Successful !');
				ngDialog.open({ 
					template: 'views/infomodal.html',
					className: 'ngdialog-theme-default',
					showClose: false,
					controller:"InfoModalController"
				});
			  
				if (registerData.rememberMe) {
					$localStorage.storeObject('userinfo',
						{username:registerData.username, password:registerData.password});
				}
				$rootScope.$broadcast('registration:Successful');
           },
           function(response){			   
				$rootScope.infodiv = 'modaldiv-red';
				$rootScope.info = gettextCatalog.getString('Registration Failed !');
				$rootScope.infomid = response.data.err.message;

                ngDialog.open({ 
					template: 'views/infomodal.html',
					showClose: false,
					controller:"InfoModalController"
				});
           }
        );
    };

    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };

    authFac.getUsername = function() {
        return username;
    };
	
	authFac.getUserId = function(){
		return userid;
	};
	
	authFac.getToken = function(){
		return authToken;
	};
	
	authFac.getProfileid = function (){
		return profileid;
	};
	
    loadUserCredentials();

    return authFac;

}])
;
