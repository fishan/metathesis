module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl' : 'mongodb://metathesis:Kl12l1l1@metathesis-shard-00-00-etr45.mongodb.net:27017,metathesis-shard-00-01-etr45.mongodb.net:27017,metathesis-shard-00-02-etr45.mongodb.net:27017/test?ssl=true&replicaSet=metathesis-shard-0&authSource=admin&retryWrites=true',
	//'mongoUrl' : 'mongodb://localhost:27017/metathesis',
	'serverUrl': 'https://localhost:8080/',
	//'serverUrl': 'https://localhost:3000/',
	'userDir': './public/users',
	
    'facebook': {
        clientID: '804329679716244',
        clientSecret: '540df55be8881c099aa96f8fd3af6ec0',
        //callbackURL: 'https://localhost:3443/users/facebook/callback'
        callbackURL: 'https://localhost:3000/users/facebook/callback'
    }
}


//callbackURL: 'https://localhost:3443/users/facebook/callback'
