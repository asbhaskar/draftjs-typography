import React, { Component } from "react";
import RichTextEditor from "./components/RichTextEditor/RichTextEditor";
import {Editor, EditorState, ContentState, convertToRaw } from 'draft-js';

class Textbox extends Component{
    state = {
        editor: ''
    }

    //Necessary to pass editor state from child to parent
    update = (editorState) => {
        this.setState({editor: editorState})
    }

    render(){
        return(
            <React.Fragment>
                <RichTextEditor
                    editor={EditorState.createEmpty()}
                    key={"Editor"}
                    spellCheck={true} 
                    update={this.update} />
            </React.Fragment>
        );
    }
}

export default Textbox;