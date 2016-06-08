
// from raw_cnts - calculate marginals, dimensions, residuals, and statistics
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
  table_obj.residuals = calculate_residuals(table_name);
  table_obj.chisq = calculate_chisq(table_name);
  table_obj.df = calculate_df(table_name);
  console.log(table_obj.df);
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

function make_dummy_table(table_obj){
  dummy_table = [];
  table_obj.raw_cnts.forEach(function(el,idx){
    dummy = el.slice();
    dummy_table.push(dummy);
  });
  return dummy_table;
}

function calculate_by_col(table_name){
  table_obj = tables[table_name];
  rows = make_dummy_table(table_obj); //copy raw counts
  rows.forEach(function(el,idx){
    el.push(table_obj.row_marg[idx]);
  });//add column for row marginals
  col_margs = table_obj.col_marg.slice(); //copy column marginals
  col_margs.push(col_margs.reduce(function(p,c){
    return p + c;
  })); // add grand total for column marginals
  relatives = rows.map(function(el, id, arr){
    var my_this = this;
    return el.map(function(col_el, col_idx, col_arr){
      perc = Math.round(10000*col_el/this[col_idx])/100;
      return perc.toString() + '%';
    }, my_this);
  }, col_margs);
  return relatives;
}

function display_by_col (dom_id,table_name){
  table_obj = tables[table_name];
  //clear out
  clear_elements(dom_id);

  //calculate
  res = calculate_by_col(table_name);
  //fill back in
  var N = table_obj.dim[0];
  var M = table_obj.dim[1];
  trs = document.getElementById(dom_id).getElementsByTagName('tr');
  for(i = 0; i < N; i++){
    tds = trs[i+1].getElementsByTagName('td');
    res[i].forEach(function(el,idx){
      this[idx+1].innerHTML = el;
    },tds);
  }
  //fill in last row with raw cnts
  tds = trs[N+1].getElementsByTagName('td');
  for(i = 0; i < M ; i++){
    tds[i+1].innerHTML = table_obj.col_marg[i];
  }
  tds[M+1].innerHTML = table_obj.total;

};

function calculate_residuals(table_name){
  table_obj = tables[table_name];
  to_pass = {'row_marg':table_obj.row_marg,'col_marg':table_obj.col_marg,'total':table_obj.total}
  res = table_obj.raw_cnts.map(function(el,row_idx){
    second_pass = this;
    second_pass.row_idx = row_idx;
    return el.map(function(row_el, col_idx){
      expected = (this.row_marg[this.row_idx]*this.col_marg[col_idx]/this.total);
      raw_res = row_el - expected;
      std_res = raw_res/Math.sqrt(expected);
      round_res = Math.round(10000*std_res)/10000;
      return round_res;
    },second_pass);
  },to_pass)
  return res;
};

function display_residuals (dom_id,table_name){
  table_obj = tables[table_name];
  //clear out
  clear_elements(dom_id);

  //calculate
  //res = calculate_residuals(table_name);
  res = table_obj.residuals;
  //fill back in
  var N = table_obj.dim[0];
  var M = table_obj.dim[1];
  trs = document.getElementById(dom_id).getElementsByTagName('tr');
  for(i = 0; i < N; i++){
    tds = trs[i+1].getElementsByTagName('td');
    res[i].forEach(function(el,idx){
      this[idx+1].innerHTML = el;
    },tds);
    tds[M+1].innerHTML = table_obj.row_marg[i];
  }
  //fill in last row with raw cnts
  tds = trs[N+1].getElementsByTagName('td');
  for(i = 0; i < M ; i++){
    tds[i+1].innerHTML = table_obj.col_marg[i];
  }
  tds[M+1].innerHTML = table_obj.total;

};

function calculate_chisq (table_name){
  table_obj = tables[table_name];
  var stat;
  stat = table_obj.residuals.reduce(function(pv,cv){
    tmp = cv.reduce(function(ppv,ccv){
      return ppv + (ccv*ccv);
    },0);
    return pv + tmp;
  },0);
  return Math.round(1000*stat)/1000;
};

function calculate_df (table_name){
  return (tables[table_name].dim[0]-1) * (tables[table_name].dim[1]-1);
}

function calculate_p_value (table_name){

}
