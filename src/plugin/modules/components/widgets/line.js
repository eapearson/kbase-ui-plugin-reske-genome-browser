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
        line = t('line');

    function viewModel(params) {
        var line = {
            x1: params.line.x1,
            y1: params.line.y1,
            x2: params.line.x2,
            y2: params.line.y2,
            strokeWidth: params.line.width,
            stroke: params.line.color
        };
        // console.log('line', line);
        return line;
    }

    function template() {
        return line({
            dataBind: {
                attr: {
                    x1: 'x1',
                    y1: 'y1',
                    x2: 'x2',
                    y2: 'y2',
                    'stroke-width': 'strokeWidth',
                    stroke: 'stroke'
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