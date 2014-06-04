/*
ph                          4    6      8         10
water temp             30   60     90      120
nitrogen                60   120  180       240
air temp                 0    50    100      150
dissolved oxygen    0    30    60        90
param               a     b     c       d 
e_new = (e - a) * 50 / (b - a)
*/
var textMargin = {top:100, left:40},
    totalWidth = 960,
    totalHeight = 650,
    margin = {top: 10, right: 10, bottom: 150, left: 40},
    margin2 = {top: 430, right: 10, bottom: 50, left: 40},
    width = totalWidth - margin.left - margin.right,
    height = totalHeight - margin.top - margin.bottom - textMargin.top,
    height2 = totalHeight - margin2.top - margin2.bottom - textMargin.top;

var parseDate = d3.time.format("%b %Y").parse;

var date1 = new Date(2014, 8, 1),
    date2 = new Date(2014, 11, 1);

var p = "ph",
    wt = "waterTemp",
    n = "nitrogen",
    at = "airTemp",
    diso = "dissolvedOxygen",
    titleText = "Skales Aquaponics",
    grey = "grey";

// domain input
// range output
var phLow = 6, phHigh = 8, phMin = 4,
    wtLow = 60, wtHigh = 90, wtMin = 30,
    nLow = 120, nHigh = 180, nMin = 60,
    atLow = 50, atHigh = 100, atMin = 0,
    disoLow = 30, disoHigh = 60, disoMin = 0,
    tempLow = 50, tempHigh = 100;

var highlighted = null;

var x = d3.time.scale()
    .range([0, width]);

var x2 = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0])
    .domain([0, 150]);

var yDot = d3.scale.linear()
    .range([height, 0]);

var y2 = d3.scale.linear()
    .range([height2, 0])
    .domain(y.domain());

var color = d3.scale.category10();

var xAxis = d3.svg.axis() // top x Axis
    .scale(x)
    .orient("bottom");

var xAxis2 = d3.svg.axis() // bottom x Axis
    .scale(x2)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(""); //disable text label

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);
    // .on("click", function() {});

var line = d3.svg.line() // top line
    .interpolate("cardinal")
    .x(function(d) { return x(d.date);})
    .y(function(d) { return y(d.levelVal); });

var bLine = d3.svg.line() // bottom line
    .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y(function(d) { checkOutOfZone(d); return y2(d.levelVal); });

var tip = d3.tip().attr('class', 'd3-tip') // tooltip
        .offset([-10, 0])        
        .style({
            "position": "absolute", 
            "line-height": 1,
            "font-weight": "bold",
            "padding": 12 + "px",
            "background": "rgba(0, 0, 0, 0.8)",
            "color": "#fff",
            "border-radius": 2 + "px"
            });

var lineStrokeWidth = 1.5,
    dotR = 3,
    clickName = "",
    isClick = false,
    insideRect, 
    fontSize = 20;

var overall = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + textMargin.top);

var svg = overall.append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top+ textMargin.top) + ")")
    .call(tip);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var title = overall.append("g")
          .append("text")
          .attr("id", "visTitle")
          .attr("x", margin.left)
          .attr("y", 50)
          .text(titleText)
          .attr("font-size", 42);

var focus = svg.append("g") // top part
    .attr("class", "focus");

var context = svg.append("g") // bottom part
    .attr("class", "context")
    .attr("transform", "translate(0," + margin2.top + ")");

var paramVals, points, bottomLine;

var rectTop = svg.append('rect') // top save region rect
              .attr("x",0)
              .attr("y",y(tempHigh))
              .attr("width", width)
              .attr("height", y(tempLow)- y(tempHigh))
              .attr("class", "rectTop")
              .attr("stroke", "none")
              .attr("fill", "green")
              .attr("fill-opacity", 0.2);

var rectBtm = context.append('rect') // bottom save region rect
              .attr("x",0)
              .attr("y",y2(tempHigh))
              .attr("width", width)
              .attr("height", y2(tempLow)- y2(tempHigh))
              .attr("class", "rectBtm")
              .attr("stroke", "none")
              .attr("fill", "green")
              .attr("fill-opacity", 0.2);

var lowText = svg.append('text')
                .attr("class", "lowText")
                .attr("id", "lowText")
                .attr("x", -40)
                .attr("y", y(tempLow))
                .text("Low")  
                .attr("font-size", 14);

var highText = svg.append('text')
                .attr("class", "highText")
                .attr("id", "highText")
                .attr("x", -40)
                .attr("y", y(tempHigh))
                .text("High")  
                .attr("font-size", 14);

// bottom warnings
function checkOutOfZone(d){
  var low = y2(tempLow),
      high = y2(tempHigh),
      val = y2(d.levelVal)
      xPosition = x(d.date);
      offset = -20,
      rectLen = 10;

      if (val <= low && val >= high) {
        return;
      }
      if (val > low) {
        offset = -1*offset - rectLen;
      }
      bottomLine.append("rect")
            .attr('class', 'bottomWarnings')
            .attr('x', xPosition - rectLen/2)
            .attr('y', val + offset)
            .attr('width', rectLen)
            .attr('height', rectLen)
            .attr('fill', "YELLOW")
            .attr('fill-opacity', 0.5);

      bottomLine.append('text')
            .attr('class', 'dot')
            .attr('x', xPosition)
            .attr('y', val + offset + rectLen - 3)
            .attr("font-size", 8)
            .attr("text-anchor", "middle")
            .attr("fill", "RED")
            .text("!")
}
// normalize the param
function normalize(a, b, e) {
  return (e - a) * 50 / (b - a);
}

// invert the normalized param
function invert(a, b, e) {
  return e * (b - a) / 50 + a;
}

// get the data
d3.csv("./liveData/dummyData.csv", function(error, data) {
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  paramVals = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
       // here do the normalize
        var val = +d[name];
        if (name == p) {
          val = normalize(phMin, phLow, val);
        } else if (name == wt) {
          val = normalize(wtMin, wtLow, val);
        } else if (name == n) {
          val = normalize(nMin, nLow, val);
        } else if (name == at) {
          val = normalize(atMin, atLow, val);
        } else if (name == diso) {
          val = normalize(disoMin, disoLow, val);
        }
        return {date: d.date, levelVal: val};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));
  x2.domain(x.domain());
  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .style("shape-rendering", "crispEdges")
      .attr("fill", "none")
      .attr("stroke", "black")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .style("shape-rendering", "crispEdges")
      .attr("fill", "black")
      //.attr("fill", "none") // for debug
      //.attr("stroke", grey)
      // .attr("stroke-width", 1)
      .call(yAxis);

  context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .style("shape-rendering", "crispEdges")
      .attr("fill", "none")
      .attr("stroke", "black")
      .call(xAxis2);

  context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7)
      .attr("stroke", "#fff")
      .attr("fill-opacity", 0.125);

 bottomLine = context.selectAll(".bLines")
      .data(paramVals)
    .enter().append("g")
      .attr("class", "bLines");

  bottomLine.append("path")
      .attr("class", "botline")
      .attr("d", function(d) { return bLine(d.values); })
      .attr("fill", "none")//stroke: steelblue;
      .attr("stroke-width", 2)
      .style("stroke", function(d) { return color(d.name); });

  
var ph = focus.selectAll(".phval") // ph line
      .data(paramVals)
    .enter().append("g")
      .attr("class", "phval")
      .append("path")
      .attr("clip-path", "url(#clip)")
      .attr("class", function(d) { return d.name == p ? "phLine" : "dump";})
      .attr("d", function(d) {  return d.name == p ? line(d.values) : 0;})
      .attr("fill", "none")//stroke: steelblue;
      .attr("stroke-width", lineStrokeWidth)
      .style("stroke", function(d) { return color(d.name); });

var wl = focus.selectAll(".wlval") // water temp line
      .data(paramVals)
    .enter().append("g")
      .attr("class", "wlval")
      .append("path")
      .attr("clip-path", "url(#clip)")
      .attr("class", function(d) { return d.name == wt ? "wtLine" : "dump";})
      .attr("d", function(d) { return  d.name == wt ? line(d.values) : 0})
      .attr("fill", "none")//stroke: steelblue;
      .attr("stroke-width", lineStrokeWidth)
      .style("stroke", function(d) { return color(d.name); });


focus.selectAll(".nLine")
      .data(paramVals)
    .enter().append("g")
      .attr("class", "nLine")
      .append("path")
      .attr("clip-path", "url(#clip)")
      .attr("class", function(d) { return d.name == n ? "nitrogenLine" : "dump";})
      .attr("d", function(d) { return  d.name == n ? line(d.values) : 0})
      .attr("fill", "none")//stroke: steelblue;
      .attr("stroke-width", lineStrokeWidth)
      .style("stroke", function(d) { return color(d.name); });


focus.selectAll(".atLine")
      .data(paramVals)
    .enter().append("g")
      .attr("class", "atLine")
      .append("path")
      .attr("clip-path", "url(#clip)")
      .attr("class", function(d) { return d.name == at ? "airTempLine" : "dump";})
      .attr("d", function(d) { return  d.name == at ? line(d.values) : 0})
      .attr("fill", "none")//stroke: steelblue;
      .attr("stroke-width", lineStrokeWidth)
      .style("stroke", function(d) { return color(d.name); });

focus.selectAll(".disoLine")
      .data(paramVals)
    .enter().append("g")
      .attr("class", "disoLine")
      .append("path")
      .attr("clip-path", "url(#clip)")
      .attr("class", function(d) { return d.name == diso ? "dissolvedOxygenLine" : "dump";})
      .attr("d", function(d) { return  d.name == diso ? line(d.values) : 0})
      .attr("fill", "none")//stroke: steelblue;
      .attr("stroke-width", lineStrokeWidth)
      .style("stroke", function(d) { return color(d.name); });



/////////////////legend///////////////
// not use this
//drawLegend();

///////////////// points //////////////////////
points = svg.append("g")
  .attr("class", "dots");
 
drawPoints();
firstBrush();
drawButton();
drawSwitch();
});

function drawSwitch() {
  // button on the top right corner
  var d = [{name:"Line"},{name:"Bar"},{name:"Camera"},{name:"Setting"}];
overall.selectAll("switchText")
          .data(d)
          .enter()
          .append("text")
          .attr("class", "switchText")
          .attr("id", function (d, i) { return "switchText" + i; })
          .attr("x", width)
          .attr("y", function(d, i) {return i*35 + 40;})
          .attr("text-anchor", "middle")
          .text(function (d) { return d.name; })  
          .attr("font-size", 20)
          .on("mouseover", rectOver)
          .on("mouseout", rectOut)
          .on("click", changeView);

overall.selectAll("switchRect")
          .data(d)
          .enter()
          .append("rect")
          .attr("class", "switchRect")
          .attr("id", function (d, i) { return "switchRect" + i; })
          .attr("x", width-40)
          .attr("y", function(d, i) {return (i-1)*35 + 45;})
          .attr("width", 80)
          .attr("height", 35)
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("fill-opacity", 0.3)
          .on("mouseover", rectOver)
          .on("mouseout", rectOut)
          .on("click", changeView);

}

function changeView(d, i){
  if (d.name != 'Setting') {
    return;
  }
  overall.append("rect")
          .attr("class", "backgroundBox")
          .attr("id", "backgroundBox")
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', totalWidth)
          .attr('height', totalHeight)
          .attr("fill-opacity",0.3)
          .attr('fill', grey)
          .on('click', cancelBox);


  insideRect = overall.append("g")
                    .attr("id", "insideRect")
                    .attr("transform", "translate(" +totalWidth/4 + "," + totalHeight/4 + ")");

  var rectBackground = insideRect.append("rect") // background box
          .attr("class", "backgroundBox")
          .attr("id", "topUpBox")
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', totalWidth/2)
          .attr('height', totalHeight/2)
          .attr("fill-opacity",1)
          .attr('fill', "white");

  var SettingText = insideRect.append('text')
                .attr('class', 'backgroundBox')
                .attr('x', totalWidth/4)
                .attr('y', 25)
                .attr("font-size", 25)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .text("Setting");

  var lowXPos = totalWidth/4,
      highXPos = lowXPos + totalWidth/8;

  var lowText = insideRect.append('text')
                .attr('class', 'backgroundBox')
                .attr('x', lowXPos)
                .attr('y', 50)
                .attr("font-size", fontSize)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .text("Low");            

  var highText = insideRect.append('text')
                .attr('class', 'backgroundBox')
                .attr('x', highXPos)
                .attr('y', 50)
                .attr("font-size", fontSize)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .text("High"); 


  var yPos = 80, interval = 30, textXPos = 10;
  var phText = addText(textXPos, yPos, "PH value", "Left");
  var phLowText = addText(lowXPos, yPos, phLow, "middle");
  var phHighText = addText(highXPos, yPos, phHigh, "middle");
  
  yPos += interval;
  var wtText = addText(textXPos, yPos, "Water Temperature", "Left");
  var wtLowText = addText(lowXPos, yPos, wtLow, "middle");
  var wtHighText = addText(highXPos, yPos, wtHigh, "middle");

  yPos += interval;
  var nText = addText(textXPos, yPos, "Nitrogen", "Left");
  var nLowText = addText(lowXPos, yPos, nLow, "middle");
  var nHighText = addText(highXPos, yPos, nHigh, "middle");

  yPos += interval;
  var atText = addText(textXPos, yPos, "Air Temperature", "Left");
  var atLowText = addText(lowXPos, yPos, atLow, "middle");
  var atHighText = addText(highXPos, yPos, atHigh, "middle");

  yPos += interval;
  var disoText = addText(textXPos, yPos, "Dissolved Oxygen", "Left");
  var disoLowText = addText(lowXPos, yPos, disoLow, "middle");
  var disoHighText = addText(highXPos, yPos, disoHigh, "middle");

  yPos += interval;
  var submitRect = insideRect.append('rect')
                    .attr('class', 'backgroundBox')
                    .attr('id', 'submitBtn')
                    .attr('x', totalWidth/8)
                    .attr('y', yPos)
                    .attr('width', 100)
                    .attr('height', 50)
                    .attr('fill', 'none')
                    .attr('stroke', 'black')
                    .attr("fill-opacity", 0.3)
                    .on('mouseover', submitMouseover)
                    .on('mouseout', submitMouseout)
                    .on('click', cancelBox);

  var cancelRect = insideRect.append('rect')
                    .attr('class', 'backgroundBox')
                    .attr('id', 'cancelBtn')
                    .attr('x', totalWidth/4)
                    .attr('y', yPos)
                    .attr('width', 100)
                    .attr('height', 50)
                    .attr('fill', 'none')
                    .attr('stroke', 'black')
                    .attr("fill-opacity", 0.3)
                    .on('mouseover', cancelMouseover)
                    .on('mouseout', cancelMouseout)
                    .on('click', cancelBox);;

  yPos += interval;

  var submitText = insideRect.append('text')
                .attr('class', 'backgroundBox')
                .attr('id', 'submitText')
                .attr('x', totalWidth/8 + 20)
                .attr('y', yPos)
                .attr("font-size", fontSize)
                .attr("fill", "black")
                .text("Submit")
                .on('mouseover', submitMouseover)
                .on('mouseout', submitMouseout)
                .on('click', cancelBox);;

  var cancelText = insideRect.append('text')
                .attr('class', 'backgroundBox')
                .attr('id', 'cancelText')
                .attr('x', totalWidth/4 + 20)
                .attr('y', yPos)
                .attr("font-size", fontSize)
                .attr("fill", "black")
                .text("Cancel")
                .on('mouseover', cancelMouseover)
                .on('mouseout', cancelMouseout)
                .on('click', cancelBox);;
}

function addText(xPos, yPos, str, pos) {
  return insideRect.append('text')
                .attr('class', 'backgroundBox')
                .attr('x', xPos)
                .attr('y', yPos)
                .attr("font-size", fontSize)
                .attr("text-anchor", pos)
                .attr("fill", "black")
                .text(str);  
}

function submitMouseover(d, i) {
  d3.selectAll("#submitBtn").attr('fill', 'green');
}

function submitMouseout(d, i) {
  d3.selectAll("#submitBtn").attr('fill', 'none');
}

function cancelMouseover(d, i) {
  d3.selectAll("#cancelBtn").attr('fill', 'red');
}

function cancelMouseout(d, i) {
  d3.selectAll("#cancelBtn").attr('fill', 'none');
}

function cancelBox(d, i){
  d3.selectAll(".backgroundBox").remove();
}

function rectOver(d, i){
  overall.select("#switchRect"+i).attr("fill", "red");
}

function rectOut(d, i){
overall.select("#switchRect"+i).attr("fill", "none");
}

// didn't use
function drawLegend() {
  legend = overall.append("g")
      .attr("opacity", 1);
  
    //background
    legend.append("rect")
      .attr("width", 2*margin.left+20)
      .attr("height", 90)
      .attr("fill", 'white')
      .attr("stroke", "black");
    
    legend.append("text")
      .attr("x", 4)
      .attr("y", 15)
      .attr("font-size", 11.5)
      .attr("fill", color("ph"))
      .text("PH value");
  
    legend.append("text")
      .attr("x", 4)
      .attr("y", 30)
      .attr("font-size", 11.5)
      .attr("fill", color("waterTemp"))
      .text("Water Temp");
  
    legend.append("text")
      .attr("x", 4)
      .attr("y", 45)
      .attr("font-size", 11.5)
      .attr("fill", color("nitrogen"))
      .text("nitrogen");
    
    legend.append("text")
      .attr("x", 4)
      .attr("y", 60)
      .attr("font-size", 11.5)
      .attr("fill", color("airTemp"))
      .text("Air Temp");
    
    legend.append("text")
      .attr("x", 4)
      .attr("y", 75)
      .attr("font-size", 11.5)
      .attr("fill", color("dissolvedOxygen"))
      .text("Dissolved Oxygen");
    
    legend.attr("transform", "translate(" + (width-2*margin.left) + "," + (50) + ")");

}

function drawButton() {
  var d = [{name:"PH", colorName:"ph"},{name:"Water Temperature", colorName:"waterTemp"},{name:"Nitrogen", colorName:"nitrogen"},{name:"Air Temperature", colorName:"airTemp"},{name:"Dissolved Oxygen", colorName:"dissolvedOxygen"}];
  overall.selectAll("sortText")
          .data(d)
          .enter()
          .append("text")
          .attr("class", "sortText")
          .attr("id", function (d, i) { return "text" + i; })
          .attr("x", function (d, i) { return i*160 + 50; })
          .attr("y", 100)
          .attr("text-anchor", "middle")
          .text(function (d) { return d.name; })  
          .attr("font-size", 20)
          .attr("fill", function(d) {return color(d.colorName);})
          .on("mouseover", mouseOver)
          .on("mouseout", mouseOut)
          .on("click", function (d, i) {
            if (clickName == d.colorName && isClick) {
              isClick = false;
              highLightInvert(d, i);
            } else {
              isClick = true;
              clickName = d.colorName;
              highLight(d, i);
            }
          });
}

function mouseOver(d, i){
  overall.select("#text" + i).attr("font-size", 25);
}

function mouseOut(d, i) {
  overall.select("#text" + i).attr("font-size", 20);
}

function highLight(d, i){
var dName = d.colorName;
highlighted = dName;
  focus.select(".phLine").style("stroke",grey).attr("stroke-width", 1);
  focus.select(".wtLine").style("stroke",grey).attr("stroke-width", 1);
  focus.select(".nitrogenLine").style("stroke",grey).attr("stroke-width", 1);
  focus.select(".airTempLine").style("stroke",grey).attr("stroke-width", 1);
  focus.select(".dissolvedOxygenLine").style("stroke",grey).attr("stroke-width", 1);
points.selectAll(".dot").attr("fill", grey).attr('r', dotR);

points.selectAll("#dot"+dName).attr('r', 10).attr('fill', color(dName));
  
  if (dName == p) {
    focus.select(".phLine")
        .attr("stroke-width", 5)//function (d) {console.log(d.values); return x(d.date) >= 0 ? 5 : 0;})
        .style("stroke",function(d) {return color(dName);});
  } else if (dName == wt) {
    focus.select(".wtLine")
        .attr("stroke-width", 5)
        .style("stroke",function(d) {return color(dName);});
  } else if (dName == n) {
    focus.select(".nitrogenLine")
        .attr("stroke-width", 5)
        .style("stroke",function(d) {return color(dName);});
  } else if (dName == at) {
    focus.select(".airTempLine")
        .attr("stroke-width", 5)
        .style("stroke",function(d) {return color(dName);});
  } else if (dName == diso) {
      focus.select(".dissolvedOxygenLine")
        .attr("stroke-width", 5)
        .style("stroke",function(d) {return color(dName);});
  }
}

function highLightInvert(d, i) {
  
  focus.select(".phLine").style("stroke", color(p)).attr("stroke-width", lineStrokeWidth);
  focus.select(".wtLine").style("stroke", color(wt)).attr("stroke-width", lineStrokeWidth);
  focus.select(".nitrogenLine").style("stroke",color(n)).attr("stroke-width", lineStrokeWidth);
  focus.select(".airTempLine").style("stroke",color(at)).attr("stroke-width", lineStrokeWidth);
  focus.select(".dissolvedOxygenLine").style("stroke",color(diso)).attr("stroke-width", lineStrokeWidth);

  points.selectAll("#dot"+p).attr("fill", color(p)).attr('r', dotR);
  points.selectAll("#dot"+wt).attr("fill", color(wt)).attr('r', dotR);
  points.selectAll("#dot"+n).attr("fill", color(n)).attr('r', dotR);
  points.selectAll("#dot"+at).attr("fill", color(at)).attr('r', dotR);
  points.selectAll("#dot"+diso).attr("fill", color(diso)).attr('r', dotR);
}

function drawPoints() {
  yDot.domain(y.domain());
  x.domain([date1, date2]); // show limited
  brushPoint();
}

function brushPoint() {
  var d = [];
  for (var i = 0; i < paramVals.length; i++){
  var c = color(paramVals[i].name);
  for (var j=0; j < paramVals[i].values.length; j++){
    var data = paramVals[i];
    var obj = paramVals[i].values[j];

    if (x(obj.date) > 0) {
      var name,num, dName = data.name;

      if (dName == p) {
        num = invert(phMin, phLow, obj.levelVal);
        name = "PH value";
      } else if (dName == wt) {
        num = invert(wtMin, wtLow, obj.levelVal);
        name = "Water Temperature";
      } else if (dName == n) {
        num = invert(nMin, nLow, obj.levelVal);
        name = "Nitrogen";
      } else if (dName == at) {
        num = invert(atMin, atLow, obj.levelVal);
        name = "Air Temperature";
      } else if (dName == diso) {
        num = invert(disoMin, disoLow, obj.levelVal);
        name = "Dissolved Oxygen";
      }

      d.push([x(obj.date),yDot(obj.levelVal),c,name, num, dName, obj.levelVal]);
    }
    }
}

points.selectAll(".dot")
          .data(d)
          .enter()
          .append("circle")
          .attr('class', 'dot')
          .attr('id', function(d, i) {return "dot" + d[5];})
          .attr('cx', function(d) { return d[0];})
          .attr('cy', function(d) { checkIfOutOfZone(d[0], d[1], d[5], d[2]); return d[1];})
          .attr('r', function(d) {return highlighted == d[5] && isClick ? 10 : dotR;})
          .attr('fill', function(d) { return highlighted == null || highlighted == d[5] || !isClick ? d[2] : grey;})
          .on("mouseover", function(d, i) {
            var val = Math.round(d[4]);
            getColor(d[6]);
            tip.html("<strong><span style='color:"+d[2]+"'>" + d[3]+ ": " + Math.round(d[4]) + "</span></strong>");
            tip.show(d);
          })
          .on("mouseout", function(d, i) {
            tip.hide(d);
          });
}

function checkIfOutOfZone(x, val, dName, color) {
  var low = y(tempLow),
      high = y(tempHigh)
      offset = -50,
      rectLen = 25;

      if (val <= low && val >= high) {
        return;
      }
      if (val > low) {
        offset = -1*offset - rectLen;
      }
      points.append("rect")
            .attr('class', 'dot')
            .attr('id', 'dot' + dName)
            .attr('x', x - rectLen/2)
            .attr('y', val + offset)
            .attr('width', rectLen)
            .attr('height', rectLen)
            .attr('fill', color)
            .attr('fill-opacity', 0.5)
            .attr("stroke", "YELLOW")
            .attr("stroke-width", 2);
      points.append('text')
            .attr('class', 'dot')
            .attr('id', 'dot' + dName)
            .attr('x', x )
            .attr('y', val + offset + rectLen - 5)
            .attr("font-size", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "RED")
            .text("!")
}
// background color for the tooltip, depends on the alert
function getColor(val) {
  tip.style({"background": "rgba(0, 0, 0, 0.8)"});
  if (val < tempLow || val > tempHigh) {
    tip.style({"background": "rgba(255, 255, 0, 0.8)"});
  } 
}

// first time when show it to user
function firstBrush() {
  x.domain([date1, date2]);
  svg.select(".brush").call(brush.extent([date1, date2]));
  focus.select(".phLine").attr("d", function(d) {  return line(paramVals[0].values);} );
  focus.select(".wtLine").attr("d", function(d) { return line(paramVals[1].values);} );
  focus.select(".nitrogenLine").attr("d", function(d) {  return line(paramVals[2].values);} );
  focus.select(".airTempLine").attr("d", function(d) { return line(paramVals[3].values);} );
  focus.select(".dissolvedOxygenLine").attr("d", function(d) {  return line(paramVals[4].values);} );
  focus.select(".x.axis").call(xAxis);
}

function brushed() {
  if (brush.empty()){
    svg.select(".brush").call(brush.extent(x.domain()));
    // disable the click feature
    return;
  } else {
    // x.domain(brush.empty() ? [date1, date2] : brush.extent()); 
    x.domain(brush.extent()); 
  }
  points.selectAll(".dot").remove();
  brushPoint();
  focus.select(".phLine").attr("d", function(d) {  return line(paramVals[0].values);} );
  focus.select(".wtLine").attr("d", function(d) { return line(paramVals[1].values);} );
  focus.select(".nitrogenLine").attr("d", function(d) {  return line(paramVals[2].values);} );
  focus.select(".airTempLine").attr("d", function(d) { return line(paramVals[3].values);} );
  focus.select(".dissolvedOxygenLine").attr("d", function(d) {  return line(paramVals[4].values);} );
  focus.select(".x.axis").call(xAxis);
}
