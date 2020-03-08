//thanks http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
  
$(window).load(function () {
    //$(".trigger_popup_fricc").click(function(){
    //   $('.hover_bkgr_fricc').show();
    //});
    $('.hover_bkgr_fricc').click(function(){
        $('.hover_bkgr_fricc').hide();
    });
    $('.popupCloseButton').click(function(){
        $('.hover_bkgr_fricc').hide();
    });
});

function trigger_func(){
    $('.hover_bkgr_fricc').show();
}

const proxyurl = "https://cors-anywhere.herokuapp.com/" //thanks sideshowbarker, stack 

//var demo_data;

d3.json(proxyurl+'https://raw.github.com/sgGoel/fake-news-proj/master/demo_data_lpa_initial.json',function(graph){
    
    /*function make_json_network(demo_data){
    var graph = {'nodes':[], 'links':[]}
        h = ['domain', 'id', 'color', 'poster1','poster2','poster3','network1','network2','network3','network4','network5']
        var counter_test = 0
        nodes = new Set()
        for (row in demo_data){
            counter_test += 1
            id = parseInt(row['id'],10)
            nodes.add(id)
            var g = 1
            if (row['color'] == 'GY'){
                g = 10 //g=10 is good, g=1 is bad
            }
            d1 = {'id':id, 'group':g}
            graph['nodes'].push(d1)
            d2 = new Set()
            for (k in h.slice(-5,)){
                if (row[k]==''){
                    continue
                }
                d2.add(parseInt(row[k],10));
            }
            for (n in d2){
                if (nodes.has(n)){
                    continue
                }    
                graph['links'].push({'source':id, 'target':n, 'value':1})
            }
            if (counter_test >= 10){
                //break 
            }
        }
    return graph
}*/
 
    //graph = make_json_network(dem_data)
    
    //var mis = document.getElementById('mis').innerHTML;
    //graph = JSON.parse(mis);
    console.log(graph)
    
    //Constants for the SVG
var width = 1400,
    height = 700;

//Set up the colour scale
//var color = d3.scale.category10();
var color = function ret_col(n){
    if (n==0){
        //return "rgb(232, 113, 84)"
        return "rgb(232, 168, 116)"
    }
    else if (n==5) {
        //return "rgb(143, 179, 80)"
        return "rgb(202, 214, 107)"
    }
    else {return "rgb(222, 222, 222)"}
    
}
    
//Set up the force layout
var force = d3.layout.force()
    .nodes(graph.nodes)
    .links(graph.links)
    .charge(-120)
    .linkDistance(function(l, i) {
      var n1 = l.source, n2 = l.target;
    // larger distance for bigger groups:
    // both between single nodes and _other_ groups (where size of own node group still counts),
    // and between two group nodes.
    //
    // reduce distance for groups with very few outer links,
    // again both in expanded and grouped form, i.e. between individual nodes of a group and
    // nodes of another group or other group node or between two group nodes.
    //
    // The latter was done to keep the single-link groups ('blue', rose, ...) close.
        //I SHOULD MAKE THESE REFLECTIVE OF ACTUAL EDGE WEIGHTS AT SOME POINT
        
    //(50-13,50-3,50-3) --> 37,47,47
    if (n1.group==n2.group && n1.group==0){ //30 for all = standard, 100-33,100-15,100-15 (All over 2) = scaled by avg sim score
        return 37; 
    }
    else if (n1.group==n2.group){
        return 47;
    }
    return 47;
    })
    .size([width, height]);
/*var force = d3.forceManyBody()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);*/

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
//var svg = d3.select("body").append("svg")
//    .attr("width", width)
 //   .attr("height", height);

var svg = d3.select("svg");

function forceCluster(){
    return 1;
}
    
//Creates the graph data structure out of the json data
//force.nodes(graph.nodes)
//    .links(graph.links)
//    .start();
 force.start();
   

//Create all the line svgs but without locations yet
var link = svg.selectAll(".link")
    .data(graph.links)
    .enter().append("line")
    .attr("class", "link")
    //.distance("distance", function (d) {
    //return Math.sqrt(graph.nodes[d.source]);
    .style("stroke-width", function (d) {
    return Math.sqrt(d.value);
});

//Do the same with the circles for the nodes - no 
var node = svg.selectAll(".node")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 8)
    .style("fill", function (d) {
    return color(d.group);
})
    .call(force.drag)
    .on('dblclick', connectedNodes); 
    //.on('dblclick', trigger_func); //Added code


//Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements
force.on("tick", function () {
    link.attr("x1", function (d) {
        return d.source.x;
    })
        .attr("y1", function (d) {
        return d.source.y;
    })
        .attr("x2", function (d) {
        return d.target.x;
    })
        .attr("y2", function (d) {
        return d.target.y;
    });

    node.attr("cx", function (d) {
        return d.x;
    })
        .attr("cy", function (d) {
        return d.y;
    });

/*var radius = 10;
    
force.on("tick", function () {
    node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  //}*/
    
    /*graph.nodes.forEach(function(o, i) {
        o.y += i & 0 ? 1 : -1;
        o.x += i & 5 ? 1 : -1;
      });*/
});

//Toggle stores whether the highlighting is on
var toggle = 0;
//Create an array logging what is connected to what
var linkedByIndex = {};
for (i = 0; i < graph.nodes.length; i++) {
    linkedByIndex[i + "," + i] = 1;
};
graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
});
//This function looks up whether a pair are neighbours
function neighboring(a, b) {
    return linkedByIndex[a.index + "," + b.index];
}
function connectedNodes() {
    if (toggle == 0) {
        //Reduce the opacity of all but the neighbouring nodes
        d = d3.select(this).node().__data__;
        //d3.select(this).node().remove("circle");
        node.style("opacity", function (o) {
            return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        });
        link.style("opacity", function (o) {
            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        });
        //Reduce the op
        toggle = 1;
    } else {
        //Put them back to opacity=1
        node.style("opacity", 1);
        link.style("opacity", 1);
        toggle = 0;
    }
    
    /*if (toggle == 0) {
        d = d3.select(this).node().__data__;
        window.open('https://www.quackit.com/javascript/examples/sample_popup.cfm','popUpWindow','height=500,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes');
        toggle = 1;
    } else {
        toggle = 0;
    }*/
}
    

var optArray = [];
for (var i = 0; i < graph.nodes.length - 1; i++) {
    optArray.push(graph.nodes[i].name);
}
optArray = optArray.sort();
    
$("button.playback").click(function(){ searchNode(); }); //thanks PitaJ, stack
    
    
/*$(function () {
    $("#search").autocomplete({
        source: optArray
    });
});*/
    

function searchNode() {
    //find the node
    var selectedVal = document.getElementById('search').value;
    var node = svg.selectAll(".node");
    if (selectedVal == "none") {
        node.style("stroke", "white").style("stroke-width", "1");
    } else {
        var selected = node.filter(function (d, i) {
            return d.name != selectedVal;
        });
        selected.style("opacity", "0");
        var link = svg.selectAll(".link")
        link.style("opacity", "0");
        d3.selectAll(".node, .link").transition()
            .duration(5000)
           .style("opacity", 1);
    }
}


$("button.onClickLpa").click(function(){ run_lpa(); });
    
function run_lpa(){
d3.json(proxyurl+'https://raw.github.com/sgGoel/fake-news-proj/master/demo_data_steps.json',function(updated_cols){
    steps = updated_cols["steps"]
    console.log(steps)
    var prev_cols = {}
    for (i in steps){ //should currently only be one step
        s = steps[i]
        //console.log(s)
        var new_cols = s['colors'] //INTERESTING
        //console.log(prev_cols)
        console.log(new_cols)
        /*var color2 = function ret_col(n){
            c = new_cols[n]
            if (c in prev_cols){
                return color3(n)
            }
            if (c=='ROB'){
                return "rgb(232, 113, 84)"
            }
            if (c=='GY'){
                return "rgb(143, 179, 80)"
            }
            return "rgb(222, 222, 222)"
        }*/
        var color3 = function ret_col2(n){
            c = new_cols[n]
            if (c=='ROB'){
                return "rgb(232, 168, 116)"
            }
            if (c=='GY'){
                return "rgb(202, 214, 107)"
            }
            return "rgb(222, 222, 222)"
        }
        prev_cols = {}
        for (k in new_cols){
            prev_cols[k] = new_cols[k]
        }
        /*d3.selectAll(".node").transition()
            .duration(1000)
            .delay(function(){
                return (i*3000)-2000
                })
            .style("fill", function (d) {
                return color2(d.index);})*/
        d3.selectAll(".node").transition()
            .duration(1000)
            .delay(function(){
                return (i*3000)
                })
            .style("fill", function (d) {
                return color3(d.index);})
    }
})
}

})
