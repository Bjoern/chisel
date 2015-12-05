console.log("starting test.js");


$(function(){
    function success(data){
      console.log("data received");

      console.dir(data);

      //create download link

     // var encodedData = window.btoa(data);

      //$('#download').attr('href', 'data:application/pdf;base64,'+encodedData);

      //$('#download').removeClass('hidden');

      //console.dir(data);
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
