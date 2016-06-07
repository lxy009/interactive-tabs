var tables = {
  'table1':{
    'raw_cnts': [ [118, 57], [4, 140] ],
    'dims': [
              {'name':'survived','levels':['yes','no']},
              {'name':'gender', 'levels': ['male','female']}
            ]
  }
};

//document.getElementById("by_row").addEventListener("click", display_by_row("table1"));

function setup_table(table_name){
  table_obj = tables[table_name]
  table_obj.row_marg = table_obj.raw_cnts.map(function(el){
    total =  el.reduce(function(pv, cv) {
      return pv + cv;
    });
    return total;
  });
  table_obj.col_marg = table_obj.raw_cnts.map(function(el,idx, arr){
    total = 0;
    for(i = 0; i < el.length; i++){
      total = total + arr[i][idx];
    }
    return total;
  });
  table_obj.total = table_obj.col_marg.reduce(
    function(prev, curr){
      return prev + curr;
    }
  );
  table_obj.dim = [table_obj.raw_cnts.length, table_obj.raw_cnts[0].length];
};

function make_headers_and_blanks(dom_id, table_name){
  table_obj = tables[table_name];
  var x = document.getElementById(dom_id);

  //row headers
  row = x.insertRow(-1);
  cell = row.insertCell(-1);
  cell.innerHTML = '';
  cell.setAttribute('class','column_level row_level');
  table_obj.dims[1].levels.forEach(function(el){
    cell = row.insertCell(-1);
    cell.innerHTML = el;
    cell.setAttribute('class','column_level');
  });
  cell = row.insertCell(-1);
  cell.innerHTML = 'row_total';
  cell.setAttribute('class','column_level row_total');

  //col headers and empty entry cells
  table_obj.dims[0].levels.forEach(function(el){
    row = x.insertRow(-1);
    cell = row.insertCell(-1);
    cell.innerHTML = el;
    cell.setAttribute('class','row_level');
    for(i = 0; i < this; i++){
      row.insertCell(-1).innerHTML = '';
    }
    cell = row.insertCell(-1);
    cell.innerHTML = '';
    cell.setAttribute('class','row_total');
  }, table_obj.dims[1].levels.length);
  row = x.insertRow(-1);
  cell = row.insertCell(-1);
  cell.innerHTML = 'col_total';
  cell.setAttribute('class','row_level col_total');
  for(i = 0; i < table_obj.dims[1].levels.length; i++){
    cell = row.insertCell(-1);
    cell.innerHTML = '';
    cell.setAttribute('class','col_total');
  }
  cell = row.insertCell(-1);
  cell.innerHTML = '';
  cell.setAttribute('class', 'col_total row_total grand_total');
};



function clear_elements(dom_id){
  var x = document.getElementById(dom_id).getElementsByTagName('tr');
  for(i = 1; i < x.length; i++){
    tds = x[i].getElementsByTagName('td');
    for(j = 1; j < tds.length; j++){
      tds[j].innerHTML = '';
    }
  }
}

function display_raw(dom_id,table_name){
  table_obj = tables[table_name];
  var x = document.getElementById(dom_id).getElementsByTagName('tr');
  //clear out
  clear_elements(dom_id);
  //fill with raw
  var N = table_obj.dim[0];
  var M = table_obj.dim[1];
  for(i = 0; i < N; i++){
    tds = x[i+1].getElementsByTagName('td');
    for(j = 0; j < M; j++){
      tds[j+1].innerHTML = table_obj.raw_cnts[i][j];
    }
    tds[M+1].innerHTML = table_obj.row_marg[i];
  }
  tds = x[N+1].getElementsByTagName('td');
  for(j = 0; j < M; j++){
    tds[j+1].innerHTML = table_obj.col_marg[j];
  }
  tds[M+1].innerHTML = table_obj.total;
}

function calculate_by_row(table_name){
  table_obj = tables[table_name];
  rows = table_obj.raw_cnts;
  rows.push(table_obj.col_marg);
  row_margs = table_obj.row_marg;
  row_margs.push(row_margs.reduce(function(p,c){
    return p + c;
  }));
  relatives = rows.map(function(el, id, arr){
    var my_this = this[id];
    return el.map(function(col_el, col_idx, col_arr){
      perc = Math.round(10000*col_el/this)/100;
      return perc.toString() + '%';
    }, my_this);
  }, row_margs);
  return relatives;
}

function display_by_row (dom_id,table_name){
  table_obj = tables[table_name];
  //clear out
  clear_elements(dom_id);

  //calculate
  res = calculate_by_row(table_name);
  //fill back in
  var N = table_obj.dim[0];
  var M = table_obj.dim[1];
  trs = document.getElementById(dom_id).getElementsByTagName('tr');
  for(i = 0; i < N+1; i++){
    tds = trs[i+1].getElementsByTagName('td');
    res[i].forEach(function(el,idx){
      this[idx+1].innerHTML = el;
    },tds);
    if(i < N){
      tds[res[i].length+1].innerHTML = table_obj.row_marg[i];
    }else{
      tds[res[i].length+1].innerHTML = table_obj.total;
    }
  }

};

document.addEventListener('DOMContentLoaded', function() {

    setup_table("table1");
    make_headers_and_blanks("table1","table1");
    display_raw("table1","table1");
}, false);
