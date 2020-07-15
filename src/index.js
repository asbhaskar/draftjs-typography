import React from "react";
import ReactDOM from "react-dom";
import Textbox from "./Textbox.js";
import RichTextEditor from "./components/RichTextEditor.js";

const wrapper = document.getElementById("container");
ReactDOM.render(
    <div>
        <Textbox />
        <RichTextEditor />
    </div>
    , wrapper)