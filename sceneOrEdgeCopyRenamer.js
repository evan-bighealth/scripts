/**
 * INSTRUCTIONS TO RUN THIS
 * 
 * This is intended to be used when renaming items copied over from one SSG to another.
 * e.g. renmaing TC_rapidpractice_100PercentOffer_copy_e41c8318f321457c864af8099ea3059f to be MDD_TC_rapidpractice_100PercentOffer
 * 
 * 1. Navigate to an SSG and double click on a SceneSet or Edge that has _copy_<hash> in the reference
 * 2. Copy the full contents of the script and paste into Chrome's DevTools
 * 3. Run
 *    - Dry Run Mode: `replaceDummyNameContent()`
 *    - Save Changes: `replaceDummyNameContent(true)`
 */

function getSSDomReference() {
    const el = [...$('#scene-set-editor-form [name=reference]')];
    return el && el[0] ? el[0] : null;
}
function getSsSaveButtonDomReference() {
    const el = [...$('#scene-set-editor-form [type=submit]')];
    return el && el[0] ? el[0] : null;
}
function setReplaceStringForRef(domRef, replaceStr) {
    return domRef.value = replaceStr;
}
async function saveSsOrEdge() { return getSsSaveButtonDomReference().click(); }

const copyHashRegex = new RegExp(/_copy_[\w\d]+/);
const prefix = 'MDD_';
function doesRefContainCopyHashString (domRef) {
    return domRef.value.match(copyHashRegex);
}
function getReplaceStringForRef (domRef) {
    return `${prefix}${domRef.value.replace(copyHashRegex, '')}`;
}

async function replaceDummyNameContent(performDataSave = false) {
    console.log(performDataSave ? '⚠️ Will attempt to save changes' : 'Running in dry run mode')
    const domRef = getSSDomReference();
    if (doesRefContainCopyHashString(domRef)) {
        const replaceStr = getReplaceStringForRef(domRef);
        setReplaceStringForRef(domRef, replaceStr);
        console.log(`String ${domRef.value} is a candidate for replacement with ${replaceStr}`);
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