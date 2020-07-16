import React, { Component } from "react";
import RichTextEditor from "./components/RichTextEditor/RichTextEditor";
import {Editor, EditorState, ContentState, convertToRaw } from 'draft-js';

class Textbox extends Component{
    state = {
        editor: ''
    }

    update = (editorState) => {
        console.log('child editor state change', editorState);
        this.setState({editor: editorState})
      }

    render(){
        return(
            <RichTextEditor
                  content=""
                  editContent=""
                  editor={EditorState.createEmpty()}
                  key={"Editor"}
                  spellCheck={true} 
                  update={this.update}
                />
        );
    }
}

export default Textbox;