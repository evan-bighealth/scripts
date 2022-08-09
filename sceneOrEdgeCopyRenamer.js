/**
 * INSTRUCTIONS TO RUN THIS
 * 
 * This is intended to be used when renaming items copied over from one SSG to another.
 * e.g. renmaing TC_rapidpractice_100PercentOffer_copy_e41c8318f321457c864af8099ea3059f to be MDD_TC_rapidpractice_100PercentOffer
 * 
 * NOTE: for Edges, you have to manually press Save. Could use some refactoring
 * 
 * 1. Navigate to an SSG and double click on a SceneSet or Edge that has _copy_<hash> in the reference
 * 2. Copy the full contents of the script and paste into Chrome's DevTools
 * 3. Run
 *    - Dry Run Mode: `replaceDummyNameContent()`
 *    - Save Changes: `replaceDummyNameContent(true)`
 */

const ssType = 'SceneSet';
const edgeType = 'Edge';
const ssFormId = '#scene-set-editor-form';
const edgeFormId = '#form-condition-editor';

function getFormType () {
    if ([...$(ssFormId)]?.length) {
        return ssType;
    } else if ([...$(edgeFormId)]?.length) {
        return edgeType;
    }
}

function getDomReference() {
    switch (getFormType()) {
        case ssType:
            return getSSDomReference();
        case edgeType:
            return getEdgeDomReference();
    }
}
function getSSDomReference() {
    const el = [...$(`${ssFormId} [name=reference]`)];
    return el && el[0] ? el[0] : null;
}
function getEdgeDomReference() {
    const el = [...$(`${edgeFormId} [name=reference]`)];
    return el && el[0] ? el[0] : null;
}
function getSsSaveButtonDomReference() {
    let formId;
    switch (getFormType()) {
        case ssType:
            formId = ssFormId;
            break;
        case edgeType:
            formId = edgeFormId;
            break;
    }
    const el = [...$(`${formId} [type=submit][value="Save"]`)];
    return el && el[0] ? el[0] : null;
}
function getEdgeValidateButtonDomReference() {

}
function getValueOfDomRef(domRef) {
    return domRef.value;
}
function setReplaceStringForRef(domRef, replaceStr) {
    return domRef.value = replaceStr;
}
async function saveSsOrEdge() { 
    if (getFormType() === edgeType) {
        // click on Advanced
        const advancedTabButton = [...$(`${edgeFormId} a[href="#tab-advanced-editor"]`)][0];
        console.log('advancedTabButton', advancedTabButton);
        await advancedTabButton.click();
        // wait 3 seconds
        console.log('waiting for tab transition')
        const pausePromise = new Promise((resolve) => (setTimeout(resolve, 1000)));
        await pausePromise;
        console.log('pressing validate button')
        // press Validate
        const validateButton = [...$(`${edgeFormId} a[data-action="validate"][data-target="advanced"]`)][0];
        console.log('validateButton', validateButton);
        await validateButton.click();
        // press Save (handled next)
        console.log('save will fail for some reason')
        console.log('PRESS SAVE MANUALLY');
    } else {
        await getSsSaveButtonDomReference().click();
    }
}

const copyHashRegex = new RegExp(/_copy_[\w\d]+/);
const prefix = 'MDD_';
function doesRefContainCopyHashString (domRef) {
    return getValueOfDomRef(domRef).match(copyHashRegex);
}
function getReplaceStringForRef (domRef) {
    return `${prefix}${getValueOfDomRef(domRef).replace(copyHashRegex, '')}`;
}

async function replaceDummyNameContent(performDataSave = false) {
    console.log(performDataSave ? '⚠️ Will attempt to save changes' : 'Running in dry run mode')
    const domRef = getDomReference();
    if (doesRefContainCopyHashString(domRef)) {
        const replaceStr = getReplaceStringForRef(domRef);
        setReplaceStringForRef(domRef, replaceStr);
        console.log(`String ${getValueOfDomRef(domRef)} is a candidate for replacement with ${replaceStr}`);
        if (performDataSave) {
            console.log('⚠️ Saving...');
            return saveSsOrEdge()
        } else {
            console.log('Exiting without saving...')
        }
    } else {
        console.log('⏭ nothing to replace');
    }
    return;
}

/**
 * Press `t` to run the name swap in test mode (dry run)
 * 
 * Press `r` to run the name swap
 */
// document.onkeypress = function (e) {
//     e = e || window.event;
    
//     if (e.keyCode === 84) {
//         replaceDummyNameContent();
//     }
//     if (e.keyCode === 82) {
//         replaceDummyNameContent(true);
//     }
// };