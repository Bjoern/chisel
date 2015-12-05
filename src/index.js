var fs = require('fs');
var Pdf = require('html-pdf');
var Handlebars = require('handlebars');
var Hapi = require('hapi');
var Joi = require('joi');

var server = new Hapi.Server();
server.connection({ port: 3000 });

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
  
      queueJob(request.payload.template, request.payload.data, function(err, stream){
         reply(stream).type('application/pdf');
       });
/*
      var template = compileTemplate(request.payload.template);    

      var html = template(request.payload.data);

      //console.log(html);

      var options = { format: 'A4' };

      Pdf.create(html, options).toStream(function(err, stream){
          reply(stream).type('application/pdf');
        });
*/
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
  queue.push({
      template: template,
      data: data,
      callback: callback
    });

  processQueue();
}


function jobFinished(){
  workers--;
  processQueue();
}

function processQueue(){
  if(workers < MAX_WORKERS && queue.length > 0){
    nextJob = queue.shift();

    workers++;

    var template = compileTemplate(nextJob.template);    

    var html = template(nextJob.data);

    var options = { format: 'A4' };

    Pdf.create(html, options).toStream(function(err, stream){
        stream.on('end', jobFinished);
        nextJob.callback(err, stream);
      });
  } 
}

function compileTemplate(templateName){
  var file = fs.readFileSync('templates/'+templateName, {encoding: 'utf8'});
  return Handlebars.compile(file);
}