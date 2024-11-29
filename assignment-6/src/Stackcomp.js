import React, { Component } from "react";
import * as d3 from "d3";

class StackComp extends Component {
  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  renderChart = () => {
    const data = this.props.csv_data;
    const datakeys = ["Gpt", "Gemini", "Palm", "Claude", "Llama"];

    // Clear existing contents
    d3.select(".container").selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 50 },
          width = 450 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
    const lastDate = d3.max(data, d => new Date(d.Date));
    const xScale = d3.scaleTime()
                      .domain([d3.min(data, d => new Date(d.Date)), d3.timeMonth.offset(lastDate, 1)])
                      .range([0, width]);

    const stack = d3.stack().keys(datakeys).offset(d3.stackOffsetWiggle);
    const stackedSeries = stack(data);

    const minSum = d3.min(stackedSeries.flat(), d => d[0]);
    const maxSum = d3.max(stackedSeries.flat(), d => d[1]);
    const yScale = d3.scaleLinear()
                      .domain([minSum - Math.abs(minSum) * 0.1, maxSum + Math.abs(maxSum) * 0.1])
                      .range([height, 0]);

    const areaGenerator = d3.area()
                            .x(d => xScale(d3.timeMonth.floor(new Date(d.data.Date)))) // Use floor to get the first day of the month
                            .y0(d => yScale(d[0]))
                            .y1(d => yScale(d[1]))
                            .curve(d3.curveCardinal);

    const svg = d3.select(".container")
                  .attr("width", width + margin.left + margin.right + 150)
                  .attr("height", height + margin.top + margin.bottom);

    const chartGroup = svg.append("g")
                          .attr("class", "chart-group")
                          .attr("transform", `translate(${margin.left + 50}, ${margin.top})`); // Shift the streamgraph only

    // Add streamgraph paths
    chartGroup.selectAll("path")
              .data(stackedSeries)
              .join("path")
              .style("fill", (d, i) => colors[i])
              .attr("d", d => areaGenerator(d))
              .on("mouseover", function(event, d) {
                d3.select(this).style("opacity", 0.7);
                showBarChart(d.key);
              })
              .on("mouseout", function(event, d) {
                d3.select(this).style("opacity", 1);
                hideBarChart();
              });

    // Add the x-axis after the streamgraph
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d => d3.timeFormat("%b")(d));

    chartGroup.append("g")
              .attr("class", "x-axis")
              .attr("transform", `translate(-38.5, ${height})`)
              .call(xAxis);

    // Tooltip for interactivity
    const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("background-color", "#eaeaea")
                      .style("border", "1px solid #ccc")
                      .style("padding", "12px")
                      .style("display", "none");

    // Function to show the bar chart for the selected category
    const showBarChart = (category) => {
      const filteredData = data.map(d => ({
        Date: d3.timeMonth.floor(new Date(d.Date)),
        value: d[category],
      }));

      const scaling = 0.70;

      const minDate = d3.timeMonth(new Date(2024, 0, 1));
      const maxDate = d3.timeMonth(new Date(2024, 9, 1));

      const barXScale = d3.scaleTime()
                          .domain([minDate, maxDate])
                          .range([0, width * scaling]);

      const barYScale = d3.scaleLinear()
                          .domain([0, d3.max(filteredData, d => d.value)])
                          .range([(height * 0.5) * scaling, 0]);

      const barChartGroup = tooltip.append("svg")
                                   .attr("width", (width + margin.left + margin.right + 100) * scaling)
                                   .attr("height", (height * 0.5 + margin.bottom) * scaling)
                                   .attr("class", "bar-chart-svg")
                                   .append("g")
                                   .attr("transform", `translate(${margin.left * scaling}, ${margin.top * scaling})`);

      barChartGroup.selectAll(".bar")
                   .data(filteredData)
                   .join("rect")
                   .attr("class", "bar")
                   .attr("x", d => barXScale(d.Date) + 30)
                   .attr("y", d => barYScale(d.value))
                   .attr("width", d => (barXScale(d3.timeMonth.offset(d.Date, 1)) - barXScale(d.Date)) * 0.8)
                   .attr("height", d => (height * 0.5) * scaling - barYScale(d.value))
                   .attr("fill", colors[datakeys.indexOf(category)])
                   .style("opacity", 0)
                   .transition()
                   .duration(200)
                   .style("opacity", 1);

      barChartGroup.append("g")
                   .attr("class", "x-axis")
                   .attr("transform", `translate(0, ${(height * 0.5) * scaling})`)
                   .call(d3.axisBottom(barXScale).tickFormat(d3.timeFormat("%b")).ticks(d3.timeMonth))
                   .selectAll("text")
                   .style("font-size", "10px");

      barChartGroup.append("g")
                   .attr("class", "y-axis")
                   .call(d3.axisLeft(barYScale).ticks(5));

      tooltip.style("display", "block")
             .style("transform", `scale(${scaling})`);
    };

    const hideBarChart = () => {
      tooltip.style("display", "none");
      tooltip.selectAll(".bar-chart-svg").remove();
    };

    chartGroup.on("mousemove", function(event) {
      tooltip.style("left", `${event.pageX - (((width + margin.left + margin.top + 75) * 0.6) / 2)}px`)
             .style("top", `${event.pageY + 10}px`);
    });

    // Add the legend
    const legend = svg.append("g")
                      .attr("class", "legend")
                      .attr("transform", `translate(${width + margin.left}, ${100 + margin.top + margin.bottom})`);

    const legendData = [
      { color: colors[4], label: "LLaMa-3.1" }, 
      { color: colors[3], label: "Claude" },
      { color: colors[2], label: "PaLM-2" },
      { color: colors[1], label: "Gemini" },
      { color: colors[0], label: "GPT-4" }
    ];

    legend.selectAll(".legend-item")
          .data(legendData)
          .join("g")
          .attr("class", "legend-item")
          .attr("transform", (d, i) => `translate(15, ${i * 22.5})`)
          .each(function(d) {
            const legendItem = d3.select(this);

            legendItem.append("rect")
                      .attr("width", 18)
                      .attr("height", 18)
                      .attr("fill", d.color)
                      .attr("x", -10)
                      .attr("y", -10);

            legendItem.append("text")
                      .text(d.label)
                      .attr("x", 10)
                      .attr("y", 2.5)
                      .attr("font-size", "10px")
                      .attr("fill", "#000");
          });
  };

  render() {
    return <svg className="container"></svg>;
  }
}

export default StackComp;
