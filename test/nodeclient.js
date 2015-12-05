var Request = require('request');
var fs = require('fs');

var data = {
  template: "coupon-master-template.html",
  data: {
    items: [
      {code: "123435344"},
      {code: "324231234"},
      {code: "345345345"},
      {code: "123234534534"},
      {code: "7477745678"}
    ]
  }
};

console.log("let's go");

function requestPDF(count){
  Request.post({
      url: 'http://localhost:3000/generate',
      method: 'POST',
      body: JSON.stringify(data),
      encoding: null,

    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log("pdf "+count+" received") // Show the HTML for the Google homepage.
        fs.writeFileSync('tmp/test'+count+'.pdf',body);   
      } else {
        //console.log("error, status: "+response.statusCode);
        console.log("error");
        console.dir(error);
      }
    });
}

for(var i = 0;i<20;i++){
  requestPDF(i);
}

