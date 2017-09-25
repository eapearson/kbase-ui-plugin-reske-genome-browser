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

    var unwrap = ko.utils.unwrapObservable;

    function viewModel(params) {
        var tick = params.tick;

        var pathParts = ko.pureComputed(function () {
            var innerRadius = tick.radius;
            var outerRadius = tick.radius + tick.width;
            var startAngle = unwrap(tick.start) - 0.25;
            var endAngle = startAngle + tick.theta;

            // inner radius starting
            var xBeginInner = tick.x + innerRadius * Math.cos(startAngle * 2 * Math.PI);
            var yBeginInner = tick.y + innerRadius * Math.sin(startAngle * 2 * Math.PI);

            var xBeginOuter = tick.x + outerRadius * Math.cos(startAngle * 2 * Math.PI);
            var yBeginOuter = tick.y + outerRadius * Math.sin(startAngle * 2 * Math.PI);


            // Second radius vector
            var xEndInner = tick.x + innerRadius * Math.cos(endAngle * 2 * Math.PI);
            var yEndInner = tick.y + innerRadius * Math.sin(endAngle * 2 * Math.PI);

            var xEndOuter = tick.x + outerRadius * Math.cos(endAngle * 2 * Math.PI);
            var yEndOuter = tick.y + outerRadius * Math.sin(endAngle * 2 * Math.PI);


            var largeArc;
            if (tick.theta > 0.5) {
                largeArc = 1;
            } else {
                largeArc = 0;
            }

            return [
                // 'M', tick.x, tick.y, // place in center
                'M', xBeginInner, yBeginInner, // move to inner ring without drawing.
                'L', xBeginOuter, yBeginOuter, // draw line for the right side of the arc segment.
                'A', outerRadius, outerRadius, 0, largeArc, 1, xEndOuter, yEndOuter, // outside arc
                'L', xEndInner, yEndInner, // left side line
                'A', innerRadius, innerRadius, 0, largeArc, 0, xBeginInner, yBeginInner
            ].join(' ');
        });

        function doMouseOver() {
            tick.showTooltip(true);
        }

        function doMouseOut() {
            tick.showTooltip(false);
        }

        return {
            pathParts: pathParts,
            tick: tick,
            doMouseOver: doMouseOver,
            doMouseOut: doMouseOut
        };
    }

    function template() {
        return path({
            dataBind: {
                attr: {
                    d: 'pathParts',
                    fill: 'tick.color'
                },
                event: {
                    mouseover: 'doMouseOver',
                    mouseout: 'doMouseOut'
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