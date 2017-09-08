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
        text = t('text'),
        line = t('line');

    function viewModel(params) {
        var radial = params.radial;
        // This points the zero angle at the top

        var it = ko.pureComputed(function() {
            var angle = ko.utils.unwrapObservable(radial.angle) - 0.25;
            var x2 = radial.x + radial.length * Math.cos(angle * 2 * Math.PI);
            var y2 = radial.y + radial.length * Math.sin(angle * 2 * Math.PI);
            var yLabel;
            if (angle >= 0.75 || angle <= 0.25) {
                yLabel = y2 - radial.fontSize / 2;
            } else {
                yLabel = y2 + radial.fontSize;
            }
            var label = radial.label +
                ' (' +
                numeral(angle + 0.25).format('0.00') +
                ')';
            return {
                x1: radial.x,
                y1: radial.y,
                x2: x2,
                y2: y2,
                stroke: radial.color,
                strokeWidth: radial.width,
                label: label,
                xLabel: x2,
                yLabel: yLabel,
                fontFamily: radial.fontFamily,
                fontSize: radial.fontSize + 'px',
                value: radial.angle
            };
        });

        return {
            radial: it
        };

    }

    function template() {
        return [
            '<!-- ko with: radial -->',
            line({
                dataBind: {
                    attr: {
                        x1: 'x1',
                        y1: 'y1',
                        x2: 'x2',
                        y2: 'y2',
                        stroke: 'stroke',
                        'stroke-width': 'strokeWidth'
                    }
                }
            }),
            text({
                dataBind: {
                    attr: {
                        x: 'xLabel',
                        y: 'yLabel',
                        'font-amily': 'fontFamily',
                        'font-size': 'fontSize',
                        'text-anchor': '"middle"'
                    },
                    text: 'label'
                }
            }),
            '<!-- /ko -->'
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