import React, { Component } from "react";
import {Editor, EditorState, RichUtils, Modifier, ContentState, SelectionState} from 'draft-js';
//import './Editor.css';
import css from './RichTextEditor.css';

class RichTextEditor extends Component{
    
  constructor(props) {
    super(props);
    let content=this.props.content;
    if (this.props.content !== ""){
      console.log('content')
      this.state = {editorState: EditorState.createWithContent(stateFromHTML(this.props.content))}
    } else if (this.props.editContent !== ""){
      console.log(this.props.editContent)
      this.state = {editorState: EditorState.createWithContent(this.props.editContent)}
    } else {
      this.state = {editorState: EditorState.createEmpty()}
    }
    console.log(this.props.content)
    console.log(this.state.editorState)
    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      this.setState({editorState})
      this.props.update(this.state);
    };
    this.handleKeyCommand = (command) => this._handleKeyCommand(command);
    this.toggleBlockType = (type) => this._toggleBlockType(type);
    this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    this.onChangeContent = (oldValue, newValue) => this._onChangeContent(oldValue, newValue)
    this.onGetState = () => this._onGetState()
  }
  _onGetState = () => {
    console.log(this.state.editorState.getCurrentContent())
    return this.state.editorState.getCurrentContent()
  }

  findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr, start, end;
    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index;
      end = start + matchArr[0].length;
      callback(start, end);
    }
  };

  _onChangeContent = (oldValue, newValue) =>{
    console.log(oldValue);
    console.log(newValue);
    const regex = new RegExp(oldValue, 'g');
    const { editorState } = this.state;
    const selectionsToReplace = [];
    const blockMap = editorState.getCurrentContent().getBlockMap();
    console.log(regex)
    blockMap.forEach((contentBlock) => (
      this.findWithRegex(regex, contentBlock, (start, end) => {
        const blockKey = contentBlock.getKey();
        const blockSelection = SelectionState
          .createEmpty(blockKey)
          .merge({
            anchorOffset: start,
            focusOffset: end,
          });
        selectionsToReplace.push(blockSelection)
        console.log(selectionsToReplace)
      })
    ));

    let contentState = editorState.getCurrentContent();

    selectionsToReplace.forEach(selectionState => {
      contentState = Modifier.replaceText(
        contentState,
        selectionState,
        newValue,
      )
    });
    this.setState({
    editorState: EditorState.push(
      editorState,
      contentState,
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

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
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
    console.log( editorState)
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div>
        { this.props.readOnly == true ? 
          <div className="RichEditor-root">
              <Editor
                blockStyleFn={getBlockStyle}
                customStyleMap={styleMap}
                handleKeyCommand={this.handleKeyCommand}
                placeholder={this.props.content}
                ref="editor"
                spellCheck={true}
                editorState={editorState}
                onChange={this.onChange}
              />
          </div>: 
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
                placeholder={this.props.content}
                ref="editor"
                spellCheck={true}
                editorState={editorState} 
                onChange={this.onChange}
              />
            </div> 
          </div>}
        </div>);
    }
}

export default RichTextEditor;


// Custom overrides for "code" style.
const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
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
    {label: 'bullet', style: 'unordered-list-item'},
    {label: 'numberlist'  , style: 'ordered-list-item'},
    {label: 'alignleft', style: 'ALIGNLEFT'}
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
  
  var INLINE_STYLES = [
    {label: 'nold', style: 'BOLD'},
    {label: 'italic', style: 'ITALIC'},
    {label: 'underline', style: 'UNDERLINE'},
    {label: 'st', style: 'STRIKETHROUGH'},
    {label: 'highlight', style: 'HIGHLIGHT'}
  ];
  
  const InlineStyleControls = (props) => {
    var currentStyle = props.editorState.getCurrentInlineStyle();
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