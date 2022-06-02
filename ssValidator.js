const MEDIA_NODE_NAMES = ['MediaContainer', 'Audio', 'Video'];
const FORM_NODES_NAMES = ['TextInput', 'Button'];
const CLASSIFICATIONS = {
    UNKNOWN: 'UNKNOWN',
    MEDIA: 'MEDIA',
    FORM: 'FORM',
    MIXED: 'MIXED'
}

function getSSComponentsFromDom() { return (
    [...$('#entity-viewer > ul > li')]
        .map(sceneComponentInDom => ({
            type: sceneComponentInDom.children[0].innerText,
            properties: sceneComponentInDom.children[1]?.children && [...sceneComponentInDom.children[1].children].reduce((agg, curr) => {
                const result = curr.innerText.match(/([\d\w]+): (.*)/);
                if (result !== null) {
                    const [, propName, propVal] = result;
                    agg[propName] = propVal;
                }
                return agg;
            }, {})
        }))
    );
}
function getSSNameFromDom() { return $('#entity-viewer > h4 > a')[0].innerText }
function getSSFromDOMAsObj(SSComponentsFromDOM) { 
    const ssObjs = [];

    if (SSComponentsFromDOM.length < 1) {
        console.log('⚠️⚠️⚠️ No nodes detected. Did you highlight a SS node?');
    }

    SSComponentsFromDOM.forEach(({ type: text, ...rest }) => {
        if (text.toLowerCase() === "scene") {
            ssObjs.push({});
        } else {
            const ssRef = ssObjs[ssObjs.length - 1];
            ssRef[text] = { ...rest };
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
function validateSSObjsForMediaValidity(classifiedSsObjs) {
    const errors = [];

    const classificationSet = new Set();
    classifiedSsObjs.forEach(ssObj => classificationSet.add(ssObj.classification));
    const hasMixed = classificationSet.has(CLASSIFICATIONS.MIXED)
    const hasForm = classificationSet.has(CLASSIFICATIONS.FORM);
    const hasMedia = classificationSet.has(CLASSIFICATIONS.MEDIA);

    console.log({
        hasMixed,
        hasForm,
        hasMedia,
    })

    if (hasMedia && hasMixed) {
        errors.push('❌ [⏯🙈] Scene Set has both Media and Mixed nodes');
    }

    return errors;
}

function validateSSObjsForImageActionValidity(classifiedSsObjs) {
    return classifiedSsObjs.map(ssObj => (
        ssObj.classification === CLASSIFICATIONS.MEDIA
            && (ssObj?.Image?.properties?.action?.indexOf('next') > -1)
            && '❌ [📸⏭] Image Action is set to `next` but should be empty ('
                + `${ssObj?.Image?.properties?.sourceProps?.match(/'reference': '([^']+)'/)[1]})`
    ))
    .filter(val => val !== false);
}

function ssMediaHidableValidator(classifiedSsObjs) {
    const ssObjsMediaHidableErrors = validateSSObjsForMediaValidity(classifiedSsObjs);

    if (ssObjsMediaHidableErrors.length < 1) {
        console.log(`✅ [⏯🙈] Media Hidable Valid (${getSSNameFromDom()})`);
    } else {
        console.log(`❌ [⏯🙈] Media Hidable INVALID (${getSSNameFromDom()})`, ssObjsMediaHidableErrors);
    }

    return ssObjsMediaHidableErrors;
}

function ssImageActionValidator(classifiedSsObjs) {
    const ssObjsImageActionErrors = validateSSObjsForImageActionValidity(classifiedSsObjs);

    if (ssObjsImageActionErrors.length < 1) {
        console.log(`✅ [📸⏭] Image Action Valid (${getSSNameFromDom()})`);
    } else {
        console.log(`❌ [📸⏭] Image Action INVALID (${getSSNameFromDom()})`, ssObjsImageActionErrors);
    }

    return ssObjsImageActionErrors;
}

function ssValidator() {
    const ssObjs = getSSFromDOMAsObj(getSSComponentsFromDom());
    const classifiedSsObjs = addClassificationsToSSObjs(ssObjs);

    console.log('classifiedSsObjs', classifiedSsObjs);

    // returns array of errors
    return { errors: [
        ...ssMediaHidableValidator(classifiedSsObjs),
        ...ssImageActionValidator(classifiedSsObjs),
    ]}
}

/**
 * Press `v` to run the validation test
 * 
 * jenky, but at least it'll be quicker to run again
 */
document.onkeypress = function (e) {
    e = e || window.event;
    
    if (e.keyCode === 118) {
        ssValidator();
    }
};

/**
 * alternatively, just run the validator directly
 */
ssValidator();