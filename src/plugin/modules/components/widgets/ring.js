define([
    'knockout-plus',
    'numeral',
    'kb_common/html'
], function(
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

        var pathParts = [
            'm', ring.x, ring.y, // move to center of ring
            'm', 0, outerRadius * -1, // move to top of the ring
            'a', outerRadius, outerRadius, 0, 1, 0, 1, 0, // draw the outer arc
            'z', // use even-odd fill rule
            'm', -1, ring.width, // move to the inner radius.
            'a', innerRadius, innerRadius, 0, 1, 1, -1, 0, // draw inner arc
            'Z' // 
        ];

        pathParts = [
            'M', ring.x, ring.y - outerRadius,
            'A', outerRadius, outerRadius, 0, 1, 0, ring.x, ring.y + outerRadius,
            'A', outerRadius, outerRadius, 0, 1, 0, ring.x, ring.y - outerRadius,
            'Z',
            'M', ring.x, ring.y - innerRadius,
            'A', innerRadius, innerRadius, 0, 1, 1, ring.x, ring.y + innerRadius,
            'A', innerRadius, innerRadius, 0, 1, 1, ring.x, ring.y - innerRadius,
            'Z'
        ];
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