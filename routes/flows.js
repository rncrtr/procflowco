var express = require('express'),
		router = express.Router(),
		mongoose = require('mongoose'),
		bodyParser = require('body-parser'),
		methodOverride = require('method-override');

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function(req,res){
	if(req.body && typeof req.body === 'object' && '_method' in req.body){
		var method = req.body._method;
		delete req.body._method;
		return method;
	}
}));

router.route('/')
// get all flows
.get(function(req,res,next){
	mongoose.model('Flow').find({},function(err,flows){
		if(err){
			return console.error(err);
		}else{
			res.format({
				html: function(){
					res.render('flows/index',{
						title: 'All Flows',
						'flows':flows
					});
				},
				json: function(){
					res.json(flows);
				}
			});
		}
	})
})
// create a new flow REST CALLS
.post(function(req,res){
	var title = req.body.title;
	var url = req.body.url;
	mongoose.model('Flow').create({
		title: title,
		url: url
	}, function(err,flow){
		if(err){
			res.send("There was a problem");
		}else{
			console.log('POST creating new flow: '+flow);
			res.format({
				html: function(){
					res.location('flows')
					res.redirect('/flows')
				},
				json: function(){
					res.json(flow)
				}
			})
		}
	})
});
// create new flow via form
router.get('/new',function(req,res){
	res.render('flows/new',{title: 'Add New Flow'});
});

// id validation
router.param('id',function(req,res, next, id){
	mongoose.model('Flow').findById(id,function(err,flow){
		// id not found
		if(err){
			console.log(id+' was not found');
			res.status(404);
			var err = new Error('Not Found');
			err.status = 404;
			res.format({
				html: function(){
					next(err);
				},
				json: function(){
					res.json({message: err.status + ' ' + err})
				}
			});
			// id is found
		}else{
			req.id = id;
			next();
		}
	});
});
// get flow for display
router.route('/:id')
.get(function(req,res){
	mongoose.model('Flow').findById(req.id,function(err,flow){
		if(err){
			console.log('GET Error: Problem getting '+err);
		}else{
			console.log('GET ID: '+flow._id);
			res.format({
				html: function(){
					res.render('flows/show',{
						'flow': flow
					});
				},
				json: function(){
					res.json(flow);
				}
			});
		}
	});
});
// get a flow by id FOR EDIT
router.get('/:id/edit',function(req,res){
	mongoose.model('Flow').findById(req.id,function(err,flow){
		if(err){
			console.log('GET Error: Problem getting '+err);
		}else{
			console.log('GET Retrieving ID: ' + flow._id);
			res.format({
				html: function(){
					res.render('flows/edit',{
						title: 'Flow'+flow._id,
						'flow': flow
					});
				},
				json: function(){
					res.json(flow);
				}
			});
		}
	});
});
// put a flow update 
router.put('/:id/edit',function(req,res){
	var title = req.body.title;
	var url = req.body.url;
	mongoose.model('Flow').findById(req.id,function(err,flow){
		flow.update({
			title: title,
			url: url
		}), function(err,flowID){
			if(err){
				res.send('There was a problem updating the db: '+err);
			}else{
				res.format({
					html: function(){
						res.redirect('/flows/'+flow._id);
					},
					json: function(){
						res.json(flow);
					}
				});
			}
		}
	});
});

// delete a flow
router.delete('/:id/edit',function(req,res){
	mongoose.model('Flow').findById(req.id,function(err,flow){
		if(err){
			return console.log(err);
		}else{
			flow.remove(function(err,flow){
				console.log('DELETE id: '+flow._id);
				res.format({
					html: function(){
						res.redirect('/flows');
					},
					json: function(){
						res.json({message: 'deleted',
							item: flow
						});
					}
				});
			});
		}
	});
});
module.exports = router;