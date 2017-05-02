var models  = require('../models');
var express = require('express');
var router  = express.Router();
var Q = require('q');

// create project
const step1 = function(name, t) {
  // let deferred = Q.defer();

  let Project = models.Project;
  // todo
  return Project.create({
             name: name
         }, {transaction: t})
         .then(function(project) {
             return project;
         })

  // return deferred.promise;
}

// create user
const step2 = function(id, projectId, t) {
    let User = models.User;
    // todo
    return User.create({
                username: 'user#' + id,
                ProjectId: projectId
            }, {transaction: t})
            .then(function(user){
                return user;
            });
}

// create role
const step3 = function(id, user, t) {
    return models.Role.create({
                name: 'role#' + id,
                UserId: user.id
            }, {transaction: t})
            .then(function(role) {
                throw new Error("Step 3: create role failed!");
                return user;
            });
}

// create task
const step4 = function(id, user, t) {
    return models.Task.create({
                title: 'task#' + id,
                UserId: user.id
            }, {transaction: t})
            .then(function(task){
              return user;
            })
}

// create comment
const step5 = function(id, user, t) {
    return models.Comment.create({
                content: 'comment#' + id,
                UserId: user.id
            }, {transaction: t})
            .then(function(comment) {
                return true;
            })
}

router.get('/', function(req, res) {
  models.User.findAll({
    include: [ models.Task ]
  }).then(function(users) {
    res.render('index', {
      title: 'Try Sequelize',
      users: users
    });
  });
});

router.post('/create/project/:projectName', function(req, res) {
    let id = req.body.id;

    return models.sequelize.transaction(function(t) {
        return step1(req.params.projectName, t)
                   .then(function(project) {
                        return step2(id,project.id,t);
                   })
                   .then(function(user){
                        return step3(id,user,t);
                   })
                   .then(function(user){
                        return step4(id,user,t);
                   })
                   .then(function(user){
                        return step5(id,user,t);
                   });

    }).then(function(committed){
        console.log('Transaction committed:', committed)
        res.status(200).send({
            success: true
        });
    })
    .catch(function(err) {
        console.log('Transaction rollback!')
        console.log('Error:', err)
        res.status(500).send({
            success: false
        });
    })
});

module.exports = router;
