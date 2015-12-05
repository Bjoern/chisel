console.log("starting test.js");


$(function(){
    function success(data){
      console.dir(data);
    }

    function clickit(){
      console.log("clicked");
    }

    function runTest(){
      console.log("run test");

      //$.get('/test.txt', success);

      var data = {
        template: "coupon-master-template.html",
        data: {
          items: [
            {code: "1234"},
            {code: "7477745678"}
          ]
        }
      };

      $.post('/generate', data, success);
    }
    console.log("waiting for clicks");
    $('#generate').click(runTest);
});
