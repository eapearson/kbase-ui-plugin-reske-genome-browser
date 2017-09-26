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
        text = t('text'),
        path = t('path');

    var unwrap = ko.utils.unwrapObservable;

    function viewModel(params) {
        var tick = params.tick;

        var vm = ko.pureComputed(function () {
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

            var pathParts = [
                // 'M', tick.x, tick.y, // place in center
                'M', xBeginInner, yBeginInner, // move to inner ring without drawing.
                'L', xBeginOuter, yBeginOuter, // draw line for the right side of the arc segment.
                'A', outerRadius, outerRadius, 0, largeArc, 1, xEndOuter, yEndOuter, // outside arc
                'L', xEndInner, yEndInner, // left side line
                'A', innerRadius, innerRadius, 0, largeArc, 0, xBeginInner, yBeginInner
            ].join(' ');

            var labelOffset = 5;

            var label;
            // console.log('label?', params);
            if (params.label) {
                // console.log('label', label);
                var xLabel = tick.x + (outerRadius + params.label.offset) * Math.cos(startAngle * 2 * Math.PI);
                var yLabel = tick.y + (outerRadius + params.label.offset) * Math.sin(startAngle * 2 * Math.PI);
                label = {
                    x: xLabel,
                    y: yLabel,
                    fontFamily: params.label.fontFamily,
                    fontSize: params.label.fontSize,
                    textAnchor: 'middle',
                    label: params.label.label
                };
            }

            return {
                pathParts: pathParts,
                tick: tick,
                label: label
            };
        });

        // var label = ko.pureComputed(function () {

        // });

        // text({
        //     '<!-- ko if: label -->',
        //     text({
        //         dataBind: {
        //             attr: {
        //                 x: 'xLabel',
        //                 y: 'yLabel',
        //                 'font-family': 'fontFamily',
        //                 'font-size': 'fontSize',
        //                 'text-anchor': '"middle"',
        //                 transform: 'textFilter'
        //             },
        //             text: 'label'
        //         }
        //     }),
        //     '<!-- /ko -->',
        // })

        function doMouseOver() {
            if (tick.showTooltip) {
                tick.showTooltip(true);
            }
        }

        function doMouseOut() {
            if (tick.showTooltip) {
                tick.showTooltip(false);
            }
        }

        return {
            vm: vm,
            doMouseOver: doMouseOver,
            doMouseOut: doMouseOut
        };
    }

    function template() {
        return [
            '<!-- ko with: vm -->',
            path({
                dataBind: {
                    attr: {
                        d: 'pathParts',
                        fill: 'tick.color'
                    },
                    // event: {
                    //     mouseover: '$component.doMouseOver',
                    //     mouseout: '$component.doMouseOut'
                    // }
                }
            }),
            '<!-- /ko -->',
            '<!-- ko if: vm().label -->',
            '<!-- ko with: vm().label -->',
            text({
                dataBind: {
                    attr: {
                        x: 'x',
                        y: 'y',
                        'font-family': 'fontFamily',
                        'font-size': 'fontSize',
                        'text-anchor': '"middle"'
                            // transform: 'textFilter'
                    },
                    text: 'label'
                }
            }),
            '<!-- /ko -->',
            '<!-- /ko -->',
        ];
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