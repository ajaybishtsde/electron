// based on https://github.com/morishitter/postcss-important (MIT)

const IMPORTANT_RE = /\@important/;

module.exports = (options) => {
    options = options || {}
    return (root) => {
        root.walkRules(rule => {
            let important = false;
            rule.each(node => {
                if (node.type === 'comment' && IMPORTANT_RE.test(node.text)) {
                    important = true;
                } else if (node.type === 'decl' && important) {
                    node.important = true;
                }                
            });
        });
    };
}