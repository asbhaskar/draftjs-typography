import React, { Component } from "react";
import { Editor, EditorState, RichUtils } from 'draft-js';
import { onReplaceContent } from '../../utils/onReplaceContent'
import css from './RichTextEditor.css';

class RichTextEditor extends Component{
    
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()}
    this.onChange = (editorState) => {
      this.setState({editorState})
      this.props.update(this.state);
    };

    //Set up helper functions
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.onReplaceContent = (oldValue, newValue) => this._onReplaceContent(oldValue, newValue)

  }

  _onReplaceContent = () =>{
    //Find both the old and new values
    let oldValue = document.getElementById('old-word').value;
    let newValue = document.getElementById('new-word').value;
    //Call a util to help find the new Content State
    let newContentState = onReplaceContent(oldValue, newValue, this.state)
    const { editorState } = this.state;
    //Set the new state
    this.setState({
    editorState: EditorState.push(
      editorState,
      newContentState,
      )
    })
  }

  _handleKeyCommand(command) {
    const {editorState} = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    //const { editorState, onChange } = this.props;
    const editorState = this.state.editorState;
    let className = 'RichEditor-editor';
    let contentState = editorState.getCurrentContent();
    

    return (
      <div>
        <div className="RichEditor-root">
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              handleKeyCommand={this.handleKeyCommand}
              placeholder=""
              ref="editor"
              spellCheck={true}
              editorState={editorState} 
              onChange={this.onChange}
            />
          </div> 
        </div>
        <div className="search-and-replace">
          <input placeholder="Old Word" id="old-word"></input>
          <input placeholder="New Word" id="new-word"></input>
          <button 
              className ="btn-primary btn fill-template-button"
              onClick={this.onReplaceContent}>Replace </button>
        </div>
      </div>);
    }
}

export default RichTextEditor;


// Custom overrides for "code" style.
const styleMap = {
    STRIKETHROUGH: {
      textDecoration: 'line-through',
    },
    HIGHLIGHT:{
      backgroundColor: '#faed27'
    }
  };
  
  function getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      default: return null;
    }
  }
  
  class StyleButton extends React.Component {
    constructor() {
      super();
      this.onToggle = (e) => {
        e.preventDefault();
        this.props.onToggle(this.props.style);
      };
    }
  
    render() {
      let className = 'RichEditor-styleButton';
      if (this.props.active) {
        className += ' RichEditor-activeButton';
      }
  
      return (
        <span className={className} onMouseDown={this.onToggle}>
          {this.props.label}
        </span>
      );
    }
  }
  
  const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'Bullet', style: 'unordered-list-item'},
    {label: 'Numbered'  , style: 'ordered-list-item'}
  ];
  
  const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  
    return (
      <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type,index) =>
          <StyleButton
            key={type.label + index}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };
  
  let INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Strike-Through', style: 'STRIKETHROUGH'},
    {label: 'Highlight', style: 'HIGHLIGHT'}
  ];
  
  const InlineStyleControls = (props) => {
    let currentStyle = props.editorState.getCurrentInlineStyle();
    return (
      <div className="RichEditor-controls">
        {INLINE_STYLES.map((type,index) =>
          <StyleButton
            key={type.label + index}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  };