/* eslint-disable no-param-reassign */
import { category21 } from '../javascripts/modules/colors';
import d3 from 'd3';

d3.sankey = require('d3-sankey').sankey;

require('./sankey_opvizor.css');

function sankeyVis(slice, payload) {
  const div = d3.select(slice.selector);
  const margin = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  };
  const width = slice.width() - margin.left - margin.right;
  const height = slice.height() - margin.top - margin.bottom;

  //const formatNumber = d3.format(',.2f');
    const formatNumber = d3.format( slice.formData.number_format);

  div.selectAll('*').remove();
  const svg = div.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const tooltip = div.append('div')
    .attr('class', 'sankey-tooltip')
    .style('opacity', 0);

  const sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);

  const path = sankey.link();

  let nodes = {};
  // Compute the distinct nodes from the links.
  const links = payload.data.map(function (row) {
    const link = Object.assign({}, row);
    link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
    link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    link.value = Number(link.value);
    return link;
  });
  nodes = d3.values(nodes);

  sankey
    .nodes(nodes)
    .links(links)
    .layout(32);



  function generateObjectInput(number_variable,number_format,prefix,suffix){
      var objectinput={};
      var regfixes = /"(.*?)"/;
      var prefixclean = regfixes.exec(prefix);
      var suffixclean = regfixes.exec(suffix);
      objectinput.numberVariable =number_variable;
               objectinput.numberFormat = number_format;
               objectinput.prefix = prefixclean!=null ? prefixclean[1]:'';
               objectinput.suffix = suffixclean!=null ? suffixclean[1]:'';
               return objectinput;
  }

  function getTooltipHtml(d) {
    let html;

    if (d.sourceLinks) { // is node
      html = d.name + " Value: <span class='emph'>" + formatNumber(d.value) + '</span>';
      return html;
    } else
        {
        const val = formatNumber(d.value);
        const sourcePercent = d3.round((d.value / d.source.value) * 100, 1);
        const targetPercent = d3.round((d.value / d.target.value) * 100, 1);

        var input = payload.form_data['sankey_pathvalue_label'];
        if (!input.isEmpty()) {
            var firstsplit = input.split(";");
            var objectinputArray = [];
            $.each(firstsplit, function (index, value) {

                var regNumber = /{(.*?)}/;
                var sec = value.split(",");
                if (sec.length == 3 && sec != null && regNumber.exec(sec[1]) != null) {
                    var numberObject = regNumber.exec(sec[1]);
                    var number = numberObject[1];
                    var number_format = number.split(":");
                    if (number_format.length == 2) {
                        objectinputArray.push(generateObjectInput(number_format[0], number_format[1], sec[0], sec[2]));
                    }
                }
                else {
                    if (sec.length == 2) {
                        if (sec != null && regNumber.exec(sec[0]) != null) {
                            var numberObject = regNumber.exec(sec[0]);
                            var number = numberObject[1];
                            var number_format = number.split(":");
                            if (number_format.length == 2) {
                                objectinputArray.push(generateObjectInput(number_format[0], number_format[1], '', sec[1]));
                            }
                        }
                        else {
                            if (regNumber.exec(sec[1]) != null) {
                                var numberObject = regNumber.exec(sec[1]);
                                var number = numberObject[1];
                                var number_format = number.split(":");
                                if (number_format.length == 2) {
                                    objectinputArray.push(generateObjectInput(number_format[0], number_format[1], sec[0], ''));
                                }
                            }
                        }
                    }
                }
            });

            var htmlMap = {
                "number1": "<div class=''>{0} <span class='emph'>{1} </span>{2}</div>",
                "number2": "<div class='percents'>" + "{0} <span class='emph'>" + (isFinite(sourcePercent) ? sourcePercent : '100') + '%</span> of ' + d.source.name + ' {1}</div>',
                "number3": "<div class='percents'>" + "{0} <span class='emph'>" + (isFinite(targetPercent) ? targetPercent : '--') + '%</span> of ' + d.target.name + ' {1}' + '</div>'
            };

            var htmlToShow = [];
            $.each(objectinputArray, function (index, value) {
                var htmlLine = htmlMap[value.numberVariable];
                if (htmlLine != undefined) {
                    if (value.numberVariable == "number1") {
                        const numberFormater = d3.format(value.numberFormat);
                        var formatted = numberFormater(d.value);
                        htmlToShow.push(htmlLine.format(value.prefix, formatted, value.suffix));
                    }
                    else {
                        htmlToShow.push(htmlLine.format(value.prefix, value.suffix));
                    }
                }
            });
            html = htmlToShow.join('');
            return html;

        }
        //default version
        else {

            html = [
                "<div class=''>Path Value: <span class='emph'>", val, '</span></div>',
                "<div class='percents'>",
                "<span class='emph'>",
                (isFinite(sourcePercent) ? sourcePercent : '100'),
                '%</span> of ', d.source.name, '<br/>',
                "<span class='emph'>" +
                (isFinite(targetPercent) ? targetPercent : '--') +
                '%</span> of ', d.target.name, 'target',
                '</div>',
            ].join('');
        }
        return html;
    }
  }

  function onmouseover(d) {
    tooltip
      .html(function () { return getTooltipHtml(d); })
     .transition()
      .duration(200)
      .style('left', (d3.event.offsetX + 10) + 'px')
      .style('top', (d3.event.offsetY + 10) + 'px')
      .style('opacity', 0.95);
  }

  function onmousedown(d){

    if(payload.form_data['sankey_variable_export_filter'].replace(/ /g,"").length >0 && payload.form_data['sankey_location_clickevent'] .replace(/ /g,"").length >0) {
                var par = {};
               // par.name = 'issuetitle';
                par.name = payload.form_data['sankey_variable_export_filter'];
                par.value = d.source.name;
                redirect([par],payload.form_data['sankey_location_clickevent']);
            }
  }

  function onmouseout() {
    tooltip.transition()
      .duration(100)
      .style('opacity', 0);
  }

    const redirect = function (d,l) {

        // console.log(d);
        var toEncode = JSON.stringify(makeJsonPreselectFilter(d));
        var encoded = encodeURIComponent(toEncode);
        var link = document.location.origin + l+"?preselect_filters="+encoded;
        window.open(link);
    }

    const makeJsonPreselectFilter = function(d){
        var obj = {};
        for(var i = 0; i< d.length; i++){
            var pair = d[i];
            var inner = {};
            var name  = pair.name;
            var value = pair.value;
            inner[name] = [value];
            obj[i]= inner;
        }
        return obj;
    }

  const link = svg.append('g').selectAll('.link')
    .data(links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', path)
    .style('stroke-width', (d) => Math.max(1, d.dy))
    .sort((a, b) => b.dy - a.dy)
    .on('mouseover', onmouseover)
    .on('mouseout', onmouseout)
    .on('mousedown', onmousedown);

  function dragmove(d) {
    d3.select(this)
      .attr(
        'transform',
        `translate(${d.x},${(d.y = Math.max(0, Math.min(height - d.dy, d3.event.y)))})`
      );
    sankey.relayout();
    link.attr('d', path);
  }

  const node = svg.append('g').selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    })
    .call(d3.behavior.drag()
      .origin(function (d) {
        return d;
      })
      .on('dragstart', function () {
        this.parentNode.appendChild(this);
      })
      .on('drag', dragmove)
    );
  const minRectHeight = 5;
  node.append('rect')
    .attr('height', d => d.dy > minRectHeight ? d.dy : minRectHeight)
    .attr('width', sankey.nodeWidth())
    .style('fill', function (d) {
      const name = d.name || 'N/A';
      d.color = category21(name.replace(/ .*/, ''));
      return d.color;
    })
    .style('stroke', function (d) {
      return d3.rgb(d.color).darker(2);
    })
    .on('mouseover', onmouseover)
    .on('mouseout', onmouseout);

  node.append('text')
    .attr('x', -6)
    .attr('y', function (d) {
      return d.dy / 2;
    })
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(function (d) {
      return d.name;
    })
    .filter(function (d) {
      return d.x < width / 2;
    })
    .attr('x', 6 + sankey.nodeWidth())
    .attr('text-anchor', 'start');

    String.prototype.format = function () {
        var str = this;
        for (var i = 0; i < arguments.length; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            str = str.replace(reg, arguments[i]);
        }
        return str;
    };

    String.prototype.isEmpty = function () {
        return (this.length === 0 || !this.trim());
    };
}

module.exports = sankeyVis;
