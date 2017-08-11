import React from 'react';

const BLOCK_TAGS = {
    P: 'paragraph',
    ul: 'bulleted-list',
    ol: 'numbered-list',
    li: 'list-item',
    h3: 'heading-three',

};

const INLINE_TAGS = {
    a: 'link'
};

// Add a dictionary of mark tags.
const MARK_TAGS = {
    em: 'italic',
    strong: 'bold',
    u: 'underlined',
};

const rules = [
    {
        deserialize: function(el, next) {
            const type = BLOCK_TAGS[el.tagName];
            //console.log(el);
            if (!type) { return; }
            return {
                kind: 'block',
                type: type,
                nodes: next(el.childNodes)
            };
        },
        serialize: function(object, children) {
            if (object.kind !== 'block') { return; }
            //console.log(object);
            switch (object.type) {
                case 'numbered-list':
                    return <ol>{children}</ol>;
                case 'bulleted-list':
                    return <ul>{children}</ul>;
                case 'list-item':
                    return <li>{children}</li>;
                case 'paragraph':
                    return <p>{children}</p>;
                case 'heading-three':
                    return <h3>{children}</h3>;
                case 'link':
                    return <a>{children}</a>;
                // no default
            }
        }
    },
    // Add a new rule that handles marks...
    {
        deserialize: function(el, next) {
            const type = MARK_TAGS[el.tagName];
            if (!type) { return; }
            return {
                kind: 'mark',
                type: type,
                nodes: next(el.childNodes)
            };
        },
        serialize: function(object, children) {
            if (object.kind !== 'mark') { return; }
            switch (object.type) {
                case 'bold':
                    return <strong>{children}</strong>;
                case 'italic':
                    return <em>{children}</em>;
                case 'underline':
                    return <u>{children}</u>;
                // no default
            }
        }
    },
    {
        deserialize: function (el, next) {
            if (el.tagName !== 'a') { return; }
            const type = INLINE_TAGS[el.tagName];

            if (!type) {
                return;
            }
            return {
                kind: 'inline',
                type: type,
                nodes: next(el.childNodes),
                data: {
                    href: el.attrs.find(({name}) => name === 'href').value
                }
            };
        },
        serialize: function (object, children) {

            if (object.kind !== 'inline') {
                return;
            }

            switch (object.type) {
                case 'link':
                    return <a href={object.data.get('href')}>{children}</a>;
                // no default
            }
        }
    },
];

export default rules;