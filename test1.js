var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var moment = require("moment");
var passport = require("passport");
var passportLocal = require("passport-local");
var methodOverride = require("method-override");


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/userProfiles3");
var mongoosedb = mongoose.connection
mongoosedb.on('error', console.error.bind(console, 'connection error: '));
mongoosedb.once('open', function(){
	console.log("Connected to database!");
});


var testSchema = new mongoose.Schema({
	name: String,
	image: String,
	comments: [
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
		}
	]
});

var commentSchema = new mongoose.Schema ({
	name: String,
	text: String,
	date: String
});

var TestData = mongoose.model("User", testSchema);
var Comment = mongoose.model("Comment", commentSchema);

var nowDateAndTime = moment().format("l , LT")





//GET ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


app.get("/", function(req, res){
	res.render("index", {title: "The index Page!!!!"});
});

app.get("/about", function(req, res){
	res.render("about");
});

app.get("/new", function(req, res) {
	res.render("new");
});

app.get("/index/:id/edit", function(req, res) {
	TestData.findById(req.params.id, function(err, editUser){
		if(err){
			console.log(err);
		} else {
			res.render("editProfile", {editUser: editUser});
		}
	});
});

//SHOW pictures
app.get("/index", function(req, res){
	TestData.find({}, function(err, allUsers){
		if(err) {
			console.log(err);
		} else {
			res.render("users", {allUsers: allUsers});
		}
	});
});


//SHOW more info and comments
app.get("/index/:id", function(req,res){
	TestData.findById(req.params.id).populate("comments").exec(function(err, userID){
		if(err) {
			console.log(err);
		} else {
			res.render("profile", {userID: userID});
		}
	});
});

app.post("/index/:id/comments", function(req, res){
	
	TestData.findById(req.params.id, function(err, foundUser){
		if (err) {
			console.log(err);
		} else {
			Comment.create(req.body.comment, function(err, theComment){
				console.log(req.body.comment);
				if (err) {
					console.log(err);
				} else {
					theComment.save();
					foundUser.comments.push(theComment);
					foundUser.save();
					console.log(theComment);
					res.redirect("/index/" + foundUser._id);
				}
			});
		}
	});
});

app.get("/index/:id/comments/new", function(req, res){
	TestData.findById(req.params.id, function(err, userID){
		if (err) {
			console.log(err);
		} else {
			res.render("newComment", {userID: userID, nowDateAndTime: nowDateAndTime});
		}
	});
});


//POST ROUTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.post("/index", function(req, res){
	var name = req.body.name;
	var image = req.body.image;

	var userData = {
		name: name,
		image: image
	}

	TestData.create(userData, function(err, newlyCreatedUser){
		if(err) {
			console.log(err);
			res.redirect("/new");
		} else {
			console.log(newlyCreatedUser);
			res.redirect("/index");
		}
	});

});



//EDIT route

app.put("/index/:id", function(req, res){
	TestData.findByIdAndUpdate(req.params.id, req.body.user, function(err, updateUser){
		if(err){
			console.log(err);
		} else {
			console.log(updateUser);
			res.redirect("/index/" + updateUser._id);
		}
	})
})





app.listen(3000, function(){
	console.log("Server started! Listening on port 3000");
});