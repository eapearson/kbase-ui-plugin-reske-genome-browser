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
            ring: ring
        };
    }

    function viewModelx(params) {
        var ring = params.ring;

        var innerRadius = ring.radius;
        var outerRadius = ring.radius + ring.width;
        var startAngle = 0;
        // var endAngle = startAngle;

        // inner radius starting
        var xBeginInner = ring.x + innerRadius * Math.cos(startAngle * 2 * Math.PI);
        var yBeginInner = ring.y + innerRadius * Math.sin(startAngle * 2 * Math.PI);

        var xBeginOuter = ring.x + outerRadius * Math.cos(startAngle * 2 * Math.PI);
        var yBeginOuter = ring.y + outerRadius * Math.sin(startAngle * 2 * Math.PI);


        // Second radius vector
        // var xEndInner = ring.x + innerRadius * Math.cos(endAngle * 2 * Math.PI);
        // var yEndInner = ring.y + innerRadius * Math.sin(endAngle * 2 * Math.PI);

        // var xEndOuter = ring.x + outerRadius * Math.cos(endAngle * 2 * Math.PI);
        // var yEndOuter = ring.y + outerRadius * Math.sin(endAngle * 2 * Math.PI);


        var largeArc;
        if (ring.theta > 0.5) {
            largeArc = 1;
        } else {
            largeArc = 0;
        }

        var pathParts = [
            // 'M', ring.x, ring.y, // place in center
            'M', xBeginOuter, yBeginOuter, // move to inner ring without drawing.
            'A', outerRadius, outerRadius, 0, largeArc, 1, xBeginOuter, yBeginOuter, // outside arc
            'L', xBeginInner, yBeginInner, // left side line           
            'A', innerRadius, innerRadius, 0, largeArc, 0, xBeginInner, yBeginInner, // draw outer arc
            // 'L', xBeginOuter, yBeginOuter, // draw line for the right side of the arc segment.
            // 'A', outerRadius, outerRadius, 0, largeArc, 1, xBeginOuter, yBeginOuter, // outside arc
            // 'A', innerRadius, innerRadius, 0, largeArc, 0, xBeginInner, yBeginInner
        ];

        console.log('path parts', pathParts);

        return {
            pathParts: pathParts.join(' '),
            ring: ring
        };
    }

    function template() {
        return path({
            dataBind: {
                attr: {
                    // fill: 'ring.color',
                    // fill: 'white',
                    d: 'pathParts'
                }
            },
            fill: 'white',
            stroke: 'silver',
            strokeWidth: '1'
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