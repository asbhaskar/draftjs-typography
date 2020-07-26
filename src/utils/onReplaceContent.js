import { findWithRegex } from './findWithRegex';
import { Modifier, ContentState, SelectionState } from 'draft-js';

export const onReplaceContent = (oldValue, newValue, oldEditorState) => {
    const regex = new RegExp(oldValue, 'g');
    const { editorState } = oldEditorState;
    const selectionsToReplace = [];
    const blockMap = editorState.getCurrentContent().getBlockMap();
    blockMap.forEach((contentBlock) => (
        //Call findWithRegex util to find start and endpoints for replacing and push to array, selectionsToReplace
        findWithRegex(regex, contentBlock, (start, end) => {
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

    //For each instance of the old word, replace values in the contentState
    selectionsToReplace.forEach(selectionState => {
        contentState = Modifier.replaceText(
            contentState,
            selectionState,
            newValue,
        )
    });
    
    //Return the contentState with replaced values
    return contentState;
}