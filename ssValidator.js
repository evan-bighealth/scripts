/**
 * INSTRUCTIONS TO RUN THIS
 * 
 * 1. Navigate to an SSG and click once on a SceneSet
 * 2. Copy the full contents and paste into Chrome's DevTools
 * 3. It will automatically run on the selected SceneSet
 * 4. To run on subsequent SceneSets,
 *    click once on a new SceneSet to select it, then press "v".
 */

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
    const sceneObjs = [];

    if (SSComponentsFromDOM.length < 1) {
        console.log('⚠️⚠️⚠️ No nodes detected. Did you highlight a SS node?');
    }

    SSComponentsFromDOM.forEach(({ type: text, ...rest }) => {
        if (text.toLowerCase() === "scene") {
            sceneObjs.push({});
        } else {
            const ssRef = sceneObjs[sceneObjs.length - 1];
            ssRef[text] = { ...rest };
        }
    });
    return sceneObjs;
}
function addClassificationsToSSObjs(sceneObjs) {
    return sceneObjs.map(sceneObj => {
        let hasMedia = false;
        let hasForm = false;
        // if any media element
        if (MEDIA_NODE_NAMES.some(mediaKey => !!sceneObj[mediaKey])) { hasMedia = true; }
        if (FORM_NODES_NAMES.some(mediaKey => !!sceneObj[mediaKey])) { hasForm = true; }
        
        return {
            ...sceneObj,
            classification: hasMedia && hasForm ? CLASSIFICATIONS.MIXED : (
                hasMedia ? CLASSIFICATIONS.MEDIA : CLASSIFICATIONS.FORM
            )
        };
    });
}
function validateSSObjsForMediaValidity(classifiedSceneObjs) {
    const errors = [];

    const classificationSet = new Set();
    classifiedSceneObjs.forEach(sceneObj => classificationSet.add(sceneObj.classification));
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

function validateSSObjsForImageActionValidity(classifiedSceneObjs) {
    return classifiedSceneObjs.map(sceneObj => (
        sceneObj.classification === CLASSIFICATIONS.MEDIA
            && (sceneObj?.Image?.properties?.action?.indexOf('next') > -1)
            && '❌ [📸⏭] Image Action is set to `next` but should be empty ('
                + `${sceneObj?.Image?.properties?.sourceProps?.match(/'reference': '([^']+)'/)[1]})`
    ))
    .filter(val => val !== false);
}

const jumpToSsMethod = 'jump_to_sceneset_by_id';
function validateSSObjsForJumpToSceneSetAlerter(classifiedSceneObjs) {
    // if any "action" has "jump_to_sceneset_by_id", flag it

    return classifiedSceneObjs.map(sceneObj => (
        // does every component in the scene NOT have jump_to_sceneset_by_id as an action?
        Object.keys(sceneObj).map(sceneComponentKey => (
            sceneObj[sceneComponentKey]?.properties?.action?.indexOf(jumpToSsMethod) > -1
            && '⛳️ [⏭] jump_to_sceneset_by_id (target: '
                + `${sceneObj[sceneComponentKey]?.properties?.action.match(/payload.*(\d{4})/)[1] })`
        )).filter(val => val !== false)
    ))
    .filter(arr => arr.length > 0);
}

function ssMediaHidableValidator(classifiedSceneObjs) {
    const sceneObjsMediaHidableErrors = validateSSObjsForMediaValidity(classifiedSceneObjs);

    if (sceneObjsMediaHidableErrors.length < 1) {
        console.log(`✅ [⏯🙈] Media Hidable Valid (${getSSNameFromDom()})`);
    } else {
        console.log(`❌ [⏯🙈] Media Hidable INVALID (${getSSNameFromDom()})`, sceneObjsMediaHidableErrors);
    }

    return sceneObjsMediaHidableErrors;
}

function ssImageActionValidator(classifiedSceneObjs) {
    const sceneObjsImageActionErrors = validateSSObjsForImageActionValidity(classifiedSceneObjs);

    if (sceneObjsImageActionErrors.length < 1) {
        console.log(`✅ [📸⏭] Image Action Valid (${getSSNameFromDom()})`);
    } else {
        console.log(`❌ [📸⏭] Image Action INVALID (${getSSNameFromDom()})`, sceneObjsImageActionErrors);
    }

    return sceneObjsImageActionErrors;
}

function ssJumpToSceneSetAlerter(classifiedSceneObjs) {
    const sceneObjsImageActionErrors = validateSSObjsForJumpToSceneSetAlerter(classifiedSceneObjs);

    if (sceneObjsImageActionErrors.length < 1) {
        console.log(`✅ [⏭] jump_to_sceneset not used (${getSSNameFromDom()})`);
    } else {
        console.log(`👀 [⏭] jump_to_sceneset used (${getSSNameFromDom()}). Verify the destination SS ID`, sceneObjsImageActionErrors);
    }

    return sceneObjsImageActionErrors;
}

function ssValidator() {
    const sceneObjs = getSSFromDOMAsObj(getSSComponentsFromDom());
    const classifiedSceneObjs = addClassificationsToSSObjs(sceneObjs);

    console.log('classifiedSceneObjs', classifiedSceneObjs);

    // returns array of errors
    return { errors: [
        ...ssMediaHidableValidator(classifiedSceneObjs),
        ...ssImageActionValidator(classifiedSceneObjs),
        ...ssJumpToSceneSetAlerter(classifiedSceneObjs),
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