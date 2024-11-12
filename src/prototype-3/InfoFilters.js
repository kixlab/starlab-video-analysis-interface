import React, { useEffect, useState } from 'react';

import { useSession } from '../contexts/SessionContext';
import '../styles/InfoFilters.css';

import { HOOK_LINKS_TAGS, HOOK_LINKS_TYPES } from '../scripts/constants';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';


function FilterType({ relation }) {
    const {
        unselectedHookTags,
        setUnselectedHookTags,
    } = useSession();

    const type = relation.type;

    const [isSelected, setIsSelected] = useState(true);

    const handleTagSelect = () => {
        if (unselectedHookTags.find((t) => t === type)) {
            setUnselectedHookTags(unselectedHookTags.filter((t) => t !== type));
        } else {
            setUnselectedHookTags([...unselectedHookTags, type]);
        }
    }

    useEffect(() => {
        if (unselectedHookTags.find((t) => t === type)) {
            setIsSelected(false);
        } else {
            setIsSelected(true);
        }
    }, [
        unselectedHookTags,
        type,
    ]);

    return (<div
        className={`info-filter-type`}
        onClick={() => handleTagSelect()}
        style={{
            backgroundColor: relation.backgroundColor,
            color: relation.color,
        }}
    >
        <div className={`info-filter-type-button`}>
            {
                isSelected ? (
                    <FaCheckCircle/>
                ) : (
                    <FaRegCircle/>
                )
            }
        </div>
        <div className="info-filter-type-title">
            {relation.label}
        </div>
    </div>)
}

function FilterTag({ tag }) {
    const {
        unselectedHookTags,
        setUnselectedHookTags,
    } = useSession();

    const [isSelected, setIsSelected] = useState(true);

    const handleTagSelect = () => {
        if (unselectedHookTags.find((t) => t === tag.type)) {
            setUnselectedHookTags(unselectedHookTags.filter((t) => t !== tag.type));
        } else {
            setUnselectedHookTags([...unselectedHookTags, tag.type]);
        }
    }

    useEffect(() => {
        if (unselectedHookTags.find((t) => t === tag.type)) {
            setIsSelected(false);
        } else {
            setIsSelected(true);
        }
    }, [
        unselectedHookTags,
        tag,
    ]);

    return (<div
        className={`info-filter-tag`}
        status={isSelected ? "selected" : "unselected"}
        onClick={() => handleTagSelect()}
    >
        {tag.label}
    </div>)
}

function InfoFilters() {
    const [isExpanded, setIsExpanded] = useState(true);

    return (<div className="info-filters">
        <div
            className="info-filters-title"
            onClick={() => setIsExpanded(!isExpanded)}
            status={isExpanded ? "expanded" : "collapsed"}
        >
            Filter information by
        </div>
        { isExpanded && (<div className="info-filters-segment">
            <div className='info-filters-column'>
                <div className="info-filters-segment-title">
                    Aspects:
                </div>
                <div className="info-filters-tags">
                    {
                        HOOK_LINKS_TAGS.map((tag) => {
                            if (tag.category === "input" || tag.category === "output") {
                                return (<FilterTag key={tag.type} tag={tag} />)
                            }
                            return null;
                        })
                    }
                </div>
                <div className="info-filters-tags">
                    {
                        HOOK_LINKS_TAGS.map((tag) => {
                            if (tag.category === "approach-main") {
                                return (<FilterTag key={tag.type} tag={tag} />)
                            }
                            return null;
                        })
                    }
                </div>
                <div className="info-filters-tags">
                    {
                        HOOK_LINKS_TAGS.map((tag) => {
                            if (tag.category === "approach-sub") {
                                return (<FilterTag key={tag.type} tag={tag} />)
                            }
                            return null;
                        })
                    }
                </div>
            </div>
            <div className='info-filters-column'>
                <div className="info-filters-segment-title">
                    Type:
                </div>
                <div className="info-filters-segment">
                    <div className="info-filters-types">
                        {
                            HOOK_LINKS_TYPES.map((relation) => <FilterType key={relation.type} relation={relation} />)
                        }
                    </div>
                </div>
            </div>
        </div>)}
    </div>
    );
}

export default InfoFilters;