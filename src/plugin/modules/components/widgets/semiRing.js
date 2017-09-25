define([
    'knockout-plus',
    'numeral',
    'kb_common/html'
], function (
    ko,
    numeral,
    html
) {
    'use strict';

    var t = html.tag,
        path = t('path');

    function viewModel(params) {
        var ring = params.ring;

        // basic attributes of the resulting shape.
        var fill = ring.color || ring.fill || 'none';
        var attr = {
            fill: fill
        };

        if (ring.border) {
            attr.stroke = ring.border.color || 'silver';
            attr.strokeWidth = ring.border.width || 1;
        } else {
            attr.stroke = 'none';
            attr.strokeWidth = false;
        }

        // The ring shape itself
        var innerRadius = ring.radius;
        var outerRadius = ring.radius + ring.width;

        // var pathParts = [
        //     'm', ring.x, ring.y, // move to center of ring
        //     'm', outerRadius * -1, 0, // move to start of semicircle, on the left outer 
        //     'a', outerRadius, 0, 0, 1, 0, 1, 0, // draw the outer arc
        //     'z', // use even-odd fill rule
        //     'm', -1, ring.width, // move to the inner radius.
        //     'a', innerRadius, innerRadius, 0, 1, 1, -1, 0, // draw inner arc
        //     'Z' // 
        // ];

        var pathParts = [
            'M', ring.x - innerRadius, ring.y, // start at the left inner arch
            // 'L', ring.x + outerRadius, ring.y, // line to the outer arch ++
            'l', -1 * ring.width, 0,
            'A', outerRadius, outerRadius, 0, 1, 1, ring.x + outerRadius, ring.y, // sweep to the right
            // 'A', outerRadius, outerRadius, 0, 1, 0, ring.x, ring.y - outerRadius,
            'l', -1 * ring.width, 0, // a line to the inner arch
            // 'Z', // switch directions -- needed?
            // 'M', ring.x + innerRadius, ring.y,
            // 'A', y, 0, 1, 1, ring.x, ring.y + innerRadius,
            'A', innerRadius, innerRadius, 0, 1, 0, ring.x - innerRadius, ring.y,
            'Z'
        ];
        // console.log('path parts', pathParts);
        return {
            pathParts: pathParts.join(' '),
            attr: attr
        };
    }

    function template() {
        return path({
            dataBind: {
                attr: {
                    // fill: 'ring.color',
                    // fill: 'white',
                    d: 'pathParts',
                    fill: 'attr.fill',
                    stroke: 'attr.stroke',
                    'stroke-width': 'attr.strokeWidth'
                }
            }
        });
    }

    function component() {
        return {
            viewModel: viewModel,
            template: {
                svg: template()
            }
        };
    }
    return component;
});