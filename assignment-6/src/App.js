import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import StackComp from "./Stackcomp.js";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], // Initialized as an empty array
    };
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  };

  render() {
    const { data } = this.state;

    return (
      <div>
        <FileUpload set_data={this.set_data} />
        <div className="parent">
          {/* Render StackComp only if data is not empty */}
          {data.length > 0 && <StackComp csv_data={data} />}
        </div>
      </div>
    );
  }
}

export default App;
