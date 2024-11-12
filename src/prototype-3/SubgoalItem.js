import React, { useEffect, useRef, useState } from 'react';

import '../styles/Notables.css';
import HookItem from './HookItem';
import NotableItem from './NotableItem';

import { useSession } from '../contexts/SessionContext';

import { flattenDict, HOOK_LINKS_TAGS, HOOK_LINKS_TYPES, HOOK_TYPE, NOTABLE_TYPE } from '../scripts/constants';

import { VscTriangleDown, VscTriangleUp } from 'react-icons/vsc';
import { CSSTransition } from 'react-transition-group';

function AspectItem({ aspectTitle, library }) {
    const curTag = HOOK_LINKS_TAGS.find((tag) => tag.type === aspectTitle);
    return (<div
        className="aspect-item"
    >
        <div className="aspect-title">
            {curTag.label}
        </div>
        <div className="aspect-notables">
            {
                library[NOTABLE_TYPE] && library[NOTABLE_TYPE].map((notable, i) => {
                    return (<NotableItem
                        key={i}
                        notable={notable}
                    />)
                })
            }
        </div>
        <div className="aspect-hooks">
            {
                library[HOOK_TYPE] && library[HOOK_TYPE].map((hook, i) => {
                    const parentIndex = library[HOOK_TYPE].reduce((acc, cur, index) => {
                        if (index >= i) {
                            return acc;
                        }
                        return acc + cur.links.length;
                    }, 0);
                    return (<HookItem
                        key={`${aspectTitle}-${i}`}
                        hook={hook}
                        parentIndex={parentIndex}
                    />)
                })
            }
        </div>
        {
            !library[HOOK_TYPE] && !library[NOTABLE_TYPE] && (<div className="notable-item">
                <div className='notable-description'>
                    No interesting moments found.
                </div>
            </div>)
        }
    </div>);
}

function SubgoalItem({ 
    displayTitle,
    curSubgoalTitle,
    library,
}) {
    const {
        subgoalTitle,
        selectedHookLinks,
        unselectedHookTags,
    } = useSession();

    const nodeRef = useRef(null);

    const [expanded, setExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [subgoalSummary, setSubgoalSummary] = useState([]);

    const sortedLibrary = Object.entries(library).sort(([aTitle, aLibrary], [bTitle, bLibrary]) => {
        const a = HOOK_LINKS_TAGS.find((tag) => tag.type === aTitle);
        const b = HOOK_LINKS_TAGS.find((tag) => tag.type === bTitle);
        return a.order - b.order;
    });

    useEffect(() => {
        if (selectedHookLinks !== null) {
            const hasSelected = Object.values(flattenDict(library)).find((informationList) => informationList.find((hook) => (hook.links.length > 0)));
            setExpanded(hasSelected ? true : false);
            return;
        }
        if (typeof subgoalTitle === 'string') {
            const actualSubgoalTitle = subgoalTitle.split('-')[0];
            if (isHovered) {
                setExpanded(true);
                return;
            }
            setExpanded(actualSubgoalTitle === curSubgoalTitle ? true : false);
            return;
        }
    }, [
        isHovered,
        subgoalTitle,
        curSubgoalTitle,
        library,
        selectedHookLinks,
        // JSON.stringify(selectedHookLinks),
        // JSON.stringify(library),
    ]);

    useEffect(() => {
        const defaultSubgoalSummary = HOOK_LINKS_TYPES.reduce((acc, hookLinkType) => {
            if (unselectedHookTags.find((tag) => tag === hookLinkType.type)) {
                return acc;
            }
            return [...acc, {
                count: 0,
                relation: hookLinkType,
            }]
        }, []);
        const newSubgoalSummary = Object.entries(flattenDict(library)).reduce((acc, [key, informationList]) => {
            informationList.forEach((information) => {
                const relation = information?.relation || 'notable';
                for (const accRelation of acc) {
                    if (accRelation.relation.type === relation) {
                        accRelation.count += 1;
                        return;
                    }
                }
            });
            return acc;
        }, defaultSubgoalSummary);
        setSubgoalSummary(newSubgoalSummary);
    }, [
        library,
        unselectedHookTags,
        // JSON.stringify(library),
        // JSON.stringify(unselectedHookTags),
    ]);

    return (<div
        className="subgoal-item"
    >
        <div className="subgoal-header"
            onClick={() => setExpanded(!expanded)}
            status={expanded ? 'expanded' : 'collapsed'}
        >
            <div className='subgoal-button'>
                {
                    expanded ? <VscTriangleUp /> : <VscTriangleDown/>
                }
            </div>

            <div
                className='subgoal-title'
            >
                {displayTitle}
            </div>

            <div
                className='subgoal-summary'
                status={expanded ? 'expanded' : 'collapsed'}
            >
                {
                    subgoalSummary.map((entry) => {
                        const {
                            count,
                            relation,
                        } = entry;
                        
                        return (<div
                            key={relation.type}
                            className='subgoal-summary-item'
                            style={{
                                backgroundColor: relation.backgroundColor,
                                color: relation.color,
                            }}
                        >
                            {count}
                        </div>)
                    })
                }
            </div>
        </div>
        <CSSTransition
            nodeRef={nodeRef}
            in={expanded}
            timeout={100}
            classNames="subgoal-transition"
            unmountOnExit
        >
            <div 
                className="subgoal-body"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {
                    sortedLibrary.length > 0 ? (sortedLibrary.map(([aspectTitle, libraryPerAspect]) => {
                        return (<AspectItem
                            key={aspectTitle}
                            aspectTitle={aspectTitle}
                            library={libraryPerAspect}
                        />)
                    })) : (<div className="notable-item">
                        <div className='notable-description'>
                            No interesting moments found.
                        </div>
                    </div>)
                }
            </div>
        </CSSTransition>
    </div>)
}

export default SubgoalItem;