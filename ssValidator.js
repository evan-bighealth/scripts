// 'Scene',
//     'MediaContainer',
//     'Audio',
//     'Modal',
//     'TextInput',
//     'Button',
// 'Scene',
//     'MediaContainer',
//     'Video',
// 'Scene',
//     'Modal',
//     'Text',
//     'Button',
// 'Scene',
//     'MediaContainer',
//     'Video',
// 'Scene',
//     'MediaContainer',
//     'Audio',
//     'Modal',
//     'TextInput',
//     'Button'

const MEDIA_NODE_NAMES = ['MediaContainer', 'Audio', 'Video'];
const FORM_NODES_NAMES = ['TextInput', 'Button'];
const CLASSIFICATIONS = {
    UNKNOWN: 'UNKNOWN',
    MEDIA: 'MEDIA',
    FORM: 'FORM',
    MIXED: 'MIXED'
}

function getSSComponentsFromDom() { return [...$('#entity-viewer strong')].map(i => i.innerText); }
function getSSNameFromDom() { return $('#entity-viewer > h4 > a')[0].innerText }
function getSSFromDOMAsObj(SSComponentsFromDOM) { 
    const ssObjs = [];

    if (SSComponentsFromDOM.length < 1) {
        console.log('⚠️⚠️⚠️ No nodes detected. Did you highlight a SS node?');
    }

    SSComponentsFromDOM.forEach(text => {
        if (text.toLowerCase() === "scene") {
            ssObjs.push({});
        } else {
            const ssRef = ssObjs[ssObjs.length - 1];
            ssRef[text] = true;
        }
    });
    return ssObjs;
}
function addClassificationsToSSObjs(ssObjs) {
    return ssObjs.map(ssObj => {
        let hasMedia = false;
        let hasForm = false;
        // if any media element
        if (MEDIA_NODE_NAMES.some(mediaKey => !!ssObj[mediaKey])) { hasMedia = true; }
        if (FORM_NODES_NAMES.some(mediaKey => !!ssObj[mediaKey])) { hasForm = true; }
        
        return {
            ...ssObj,
            classification: hasMedia && hasForm ? CLASSIFICATIONS.MIXED : (
                hasMedia ? CLASSIFICATIONS.MEDIA : CLASSIFICATIONS.FORM
            )
        };
    });
}
function validateSSObjsForMediaValidity(classifiedSSObjs) {
    const errors = [];

    console.log('classifiedSSObjs', classifiedSSObjs);

    // optimization: use sets to reduce to unique values
    const classificationSet = new Set();
    classifiedSSObjs.forEach(ssObj => classificationSet.add(ssObj.classification));
    const hasMixed = classificationSet.has(CLASSIFICATIONS.MIXED)
    const hasForm = classificationSet.has(CLASSIFICATIONS.FORM);
    const hasMedia = classificationSet.has(CLASSIFICATIONS.MEDIA);

    console.log({
        hasMixed,
        hasForm,
        hasMedia,
    })

    if (hasMedia && hasMixed) {
        errors.push('❌ - Scene Set has both Media and Mixed nodes');
    }

    return errors;
}

function ssMediaHidableValidator() {
    const ssObjs = getSSFromDOMAsObj(getSSComponentsFromDom());
    const ssObjsMediaHidableErrors = validateSSObjsForMediaValidity(addClassificationsToSSObjs(ssObjs));

    if (ssObjsMediaHidableErrors.length < 1) {
        console.log(`✅ Media Hidable Valid (${getSSNameFromDom()})`);
    } else {
        console.log(`❌ Media Hidable INVALID (${getSSNameFromDom()})`, ssObjsMediaHidableErrors);
    }

    return ssObjsMediaHidableErrors;
}

ssMediaHidableValidator();
