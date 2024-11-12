import React, { useEffect, useRef, useState, useMemo } from 'react';

import '../styles/Notables.css';
import LinkItem from './LinkItem';

import { HOOK_LINKS_TYPES } from '../scripts/constants';

import { CSSTransition } from 'react-transition-group';

function HookItem({ hook, parentIndex }) {
    const nodeRef = useRef(null);

    const hookRelation = HOOK_LINKS_TYPES.find((type) => type.type === hook.relation);

    return (<CSSTransition
        nodeRef={nodeRef}
        in={true}
        timeout={300}
        classNames="hook-item-transition"
    >
        <div
            className="hook-item"
            style={{
                borderLeftColor: hookRelation.color,
                color: hookRelation.color,
            }}
        >
            <div className='hook-title'>
                {hook.title} 
            </div>
            <div className="hook-links">
                {
                    hook.links.map((link, index) => {
                        return (<LinkItem
                            key={link.id}
                            link={link}
                            index={parentIndex + index}
                        />)
                    })
                        
                }
            </div>
        </div>
    </CSSTransition>);
}

export default HookItem;