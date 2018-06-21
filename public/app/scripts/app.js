/*jshint esversion: 6 */
/*jslint devel: true */
/*jslint jquery: true */
/*jshint strict:false */
/*jshint node: true */
/*jslint browser: true */
/*global angular:false */
/*global google:false */
'use strict';

angular.module('metathesisApp', ['ngTouch','ngAnimate', 'ui.bootstrap','ui.router', 'ngResource', 'ngDialog', 'ngMap', 'ngFileUpload', 'angularFileUpload', 'uiCropper', 'ui.select', 'ngSanitize', 'ui.tinymce', 'gettext', 'thatisuday.ng-spin', 'mgcrea.ngStrap', 'angularUtils.directives.dirPagination', 'jkAngularRatingStars'])
.config(function($qProvider, $stateProvider, $urlRouterProvider) {
	
	
	
	$stateProvider
	
	// route for the index page
		.state('app', {
			url:'/index',
			views: {
				'header': {
					templateUrl : 'views/header.html',
					controller  : 'HeaderController'
				},
				'content': {
					templateUrl : 'views/news.html', 
					controller  : 'NewsController' 
				},
				'footer': {
					templateUrl : 'views/footer.html',
				}
			}
		})

	// route for the info page
		.state('app.info', {
			url:'/info',
			views: {
				'content@': {
					templateUrl : 'views/infos.html', 
					controller  : 'InfoController'                 
				}
			}
		})
		.state('app.infodetails', {
			url: '/info/:id',
			views: {
				'content@': {
					templateUrl : 'views/infodetails.html',
					controller  : 'InfoDetailsController'
				}
			}
		})			

	// route for the contact page
		.state('app.contact', {
			url:'/contact',
			views: {
				'content@': {
					templateUrl : 'views/contact.html',
					controller  : 'ContactController'                 
				}
			}
		})

	// tasks
		.state('app.tasks', { 
			url: '/tasks',
			views: {
				'content@': {
					templateUrl : 'views/tasks.html', 
					controller  : 'TasksController' 
				}
			}
		})
		.state('app.taskadd', { 
			url: '/taskadd',
			views: {
				'content@': {
					templateUrl : 'views/taskadd.html', 
					controller  : 'TaskAddController' 
				}
			}
		})
		.state('app.taskpublic', {
			url: '/taskpublic/:id',
			views: {
				'content@': {
					templateUrl : 'views/taskpublic.html', 
					controller  : 'TaskPublicController' 
				}
			}
		})
		.state('app.taskprivate', {
			url: '/taskprivate/:id',
			views: {
				'content@': {
					templateUrl : 'views/taskprivate.html', 
					controller  : 'TaskPrivateController' 
				}
			}
		})
		.state('app.taskedit', {
			url: '/taskedit/:id',
			views: {
				'content@': {
					templateUrl : 'views/taskedit.html', 
					controller  : 'TaskEditController' 
				}
			}
		})
	//profile 
		.state('app.profilepublic', {
			url: '/profilepublic/:id',
			views: {
				'content@': {
					templateUrl : 'views/profilepublic.html', 
					controller  : 'ProfilePublicController' 
				}
			}
		})
		.state('app.profileprivate', {
			url: '/profileprivate/:id',
			views: {
				'content@': {
					templateUrl : 'views/profileprivate.html', 
					controller  : 'ProfilePrivateController' 
				}
			}
		})
		.state('app.profileedit', {
			url: '/profileedit/:id',
			views: {
				'content@': {
					templateUrl : 'views/profileedit.html', 
					controller  : 'ProfileEditController' 
				}
			}
		})
		.state('app.candidate', {
			url: '/candidate/:id',
			params: { 
				id:'', 
				profileid: '',
				candid:''
			},
			views: {
				'content@': {
					templateUrl : 'views/candidate.html', 
					controller  : 'CandidateController' 
				}
			}
		});    
		/* 
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		}).hashPrefix('!'); */
        $urlRouterProvider.otherwise('/index');
    })	
;
