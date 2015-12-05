var fs = require('fs');
var Pdf = require('html-pdf');
var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Joi = require('joi');

var server = new Hapi.Server();
server.connection({ port: 3000 });

var genCount = 0;

function makeReply(reply){
  return function(err, stream){
    reply(stream).type('application/pdf');
  }
}

server.route({
    method: 'POST',
    path: '/generate',
    config: {
      /*validate: {
        payload: Joi.object({
            template: Joi.string().required()
            //items: Joi.array().required()
          }).without('password', 'accessToken')
      }*/

    },

    handler: function (request, reply) {
      console.log("payload: "+request.payload);
      console.log("generate pdf");
      console.log('template: '+request.payload.template);
      console.log('items: '+request.payload.data.items);
  
      queueJob(request.payload.template, request.payload.data, makeReply(reply));
    }
});



server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
          directory: {
            path: 'public',
            index: true
          }
        }
      });
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

var MAX_WORKERS = 4;//max pdfs creation triggers at a time

var queue = [];
var workers = 0;//active workers

function queueJob(template, data, callback){

  genCount++;

  console.log("queue job "+genCount+", length: "+queue.length+", workers: "+workers);
  queue.push({
      template: template,
      data: data,
      callback: callback,
      genCount: genCount
    });

  processQueue();
}


function jobFinished(genCount){
  return function(){
    console.log("** job finished: "+genCount);
    workers--;
    processQueue();
  };
}

function makePDFGenCallback(nextJob){
  return function(err, stream){
    stream.on('end', jobFinished(nextJob.genCount));
    nextJob.callback(err, stream);
  }
}


function processQueue(){
  console.log("process queue");

  if(workers < MAX_WORKERS && queue.length > 0){

    nextJob = queue.shift();

    console.log("** process request "+nextJob.genCount);

    workers++;

    var template = compileTemplate(nextJob.template);    

    var html = template(nextJob.data);

    var options = { format: 'A4' };

    Pdf.create(html, options).toStream(makePDFGenCallback(nextJob));
  } else {
    console.log("nothing to do or waiting for another worker to finish, length: "+queue.length+", workers: "+workers);
  }
}

function compileTemplate(templateName){
  var file = fs.readFileSync('templates/'+templateName, {encoding: 'utf8'});
  return Handlebars.compile(file);
}