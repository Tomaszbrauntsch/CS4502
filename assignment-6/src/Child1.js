import React, { Component } from "react";
// import "./child1.css"
import * as d3 from "d3";

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    console.log(this.props.csv_data)
    this.renderChart();
  }

  componentDidUpdate() {
    console.log(this.props.csv_data)
    this.renderChart();
  }

  
  renderChart = () => {
    var data = this.props.csv_data;
    const formatMonth = d3.timeFormat("%b");
    data.forEach(d => {
      d.Date = formatMonth(d.Date);
    })
    const margin = { top: 20, right: 30, bottom: 40, left: 100 },
      width = 800,
      height = 400,
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;
    
    var datakeys = Object.keys(data[0]);
    datakeys.shift();

    const svg = d3.select(this.svgRef.current)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
    .domain(d3.extent(data, (d)=> d.Date))
    .range([0,innerWidth]);

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.Gpt + d.Gemini + d.Palm + d.Claude + d.Llama)])
    .range([innerHeight,0]);

    const colorScale = d3.scaleOrdinal()
    .domain(datakeys)
    .range(d3.schemeCategory10);

    const stack = d3.stack()
    .keys(datakeys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetWiggle);

    const series = stack(data);
    console.log("Stacked Series:", series)

    const area = d3.area()
    .x((d) => xScale(d.data.Date))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]))
    .curve(d3.curveBasis);

    svg
    .selectAll(".layer")
    .data(series)
    .enter()
    .append("path")
    .attr("class", "layer")
    .attr("d", (d) => {
      const path = area(d);
      console.log("Path:", path);
      return path;
    })
    .style("fill", (d) => colorScale(d.key))
    .style("opacity", 0.8);

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale));

  svg.append("g").call(d3.axisLeft(yScale));
  };
  
  render() {

    return (
      <svg ref={this.svgRef}></svg>
        // </div>
      // </div>
      // <div className="child1">
        //<div id="tooltip"></div>
       //<div className="parent">
    );
  };
};

export default Child1;
