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
        circle = t('circle');

    function viewModel(params) {
        return {
            cx: params.x,
            cy: params.y,
            r: params.radius,
            fill: params.color
        };
    }

    function template() {
        return circle({
            dataBind: {
                attr: {
                    cx: 'cx',
                    cy: 'cy',
                    r: 'r',
                    fill: 'fill'
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