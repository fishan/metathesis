module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl' : 'mongodb://localhost:27017/metathesis',
	//'serverUrl': 'https://localhost:3443/',
	'serverUrl': 'https://localhost:3000/',
	'userDir': './public/users',
	
    'facebook': {
        clientID: '804329679716244',
        clientSecret: '540df55be8881c099aa96f8fd3af6ec0',
        //callbackURL: 'https://localhost:3443/users/facebook/callback'
        callbackURL: 'https://localhost:3000/users/facebook/callback'
    }
}


//callbackURL: 'https://localhost:3443/users/facebook/callback'