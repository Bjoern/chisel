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
  
      var template = compileTemplate(request.payload.template);    

      var html = template(request.payload.data);

      //console.log(html);

      var options = { format: 'A4' };

      Pdf.create(html, options).toStream(function(err, stream){
          reply(stream).type('application/pdf');
        });
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

function compileTemplate(templateName){
  var file = fs.readFileSync('templates/'+templateName, {encoding: 'utf8'});
  return Handlebars.compile(file);
}
/*
var template = compileTemplate('coupon-master-template.html');
var data = {
    items: [
      {code: "1234"},
      {code: "5678"}
    ]
  };

var html = template(data);

var options = { format: 'A4' };
 */
/*Pdf.create(html, options).toFile('./hello.pdf', function(err, res) {
  if (err) return console.log(err);
  console.log(res);
});*/