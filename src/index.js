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
      validate: {
        payload: Joi.object({
            template: Joi.string(),
            title: Joi.string(),
            description: Joi.string()
          }).without('password', 'accessToken')
      }

    },

    handler: function (request, reply) {
      console.log("payload: "+request.payload);
      //var payload = JSON.parse(request.payload);
      cosole.log('template: '+request.payload.template);
      reply('Hello, world!');
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

function compileTemplate(templateName){
  var file = fs.readFileSync('templates/'+templateName, {encoding: 'utf8'});
  console.log("file: "+file);
  return Handlebars.compile(file);
}

var template = compileTemplate('test.html');// Handlebars.compile("Hello {{name}}");
var data = {name: "Consumer"};

var html = template(data);

var options = { format: 'A4' };
 
Pdf.create(html, options).toFile('./hello.pdf', function(err, res) {
  if (err) return console.log(err);
  console.log(res);
});