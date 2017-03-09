const $ = require('jquery');

require('./markup_opvizor.css');

function markupWidget(slice, payload) {
  console.log(slice);
  //get issue Title if case of it
    var filters = payload.form_data.filters;
    var title = "";
    for(var i = 0; i < filters.length; i++){
      var filtername = filters[i].col;
      if(filtername == "issuetitle"){
        title = filters[i].val[0];      }
    }
if(title.length < 1){title = " ";}
  var iDiv = document.createElement('div');
  $('#code').attr('rows', '15');
  var desc = payload.data.html;
  desc = "<div class='markup_opvizor'><h2 style='align-content: center'>"+title+"</h2>" + desc+"</div>";
   slice.container.html(desc);
}

module.exports = markupWidget;
