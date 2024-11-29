import React, { Component } from "react";
import "./App.css";
// import stockData from './stockData.csv';
import FileUpload from "./FileUpload";
// import Child1 from "./Child1";
import StackComp from "./Stackcomp.js";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data : [{}]
    };
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  }

  render() {
    var mychild;
    if (this.state.data.length === 0) {
      mychild = null;
    }
    else {
      mychild = <StackComp csv_data={this.state.data}></StackComp>
    }
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          {mychild}
        </div>
      </div>
    );
  }
}

export default App;
