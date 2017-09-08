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
        path = t('path');

    function viewModel(params) {
        var sector = params.sector;
        var xBegin = sector.x + sector.radius * Math.cos(sector.start * 2 * Math.PI);
        var yBegin = sector.y + sector.radius * Math.sin(sector.start * 2 * Math.PI);

        var endAngle = sector.start + sector.theta;

        // Second radius vector
        var xEnd = sector.x + sector.radius * Math.cos(endAngle * 2 * Math.PI);
        var yEnd = sector.y + sector.radius * Math.sin(endAngle * 2 * Math.PI);

        // Text label is the mid point
        var midAngle = sector.start + sector.theta / 2;
        var xText = sector.x + sector.radius * 0.7 * Math.cos(midAngle * 2 * Math.PI);
        var yText = sector.y + sector.radius * 0.7 * Math.sin(midAngle * 2 * Math.PI);

        var largeArc;
        if (sector.theta > 0.5) {
            largeArc = 1;
        } else {
            largeArc = 0;
        }

        var pathParts = [
            'M', sector.x, sector.y,
            'L', xBegin, yBegin,
            'A', sector.radius, sector.radius, 0, largeArc, 1, xEnd, yEnd,
            'L', sector.x, sector.y
        ];

        return {
            pathParts: pathParts.join(' '),
            text: {
                x: xText,
                y: yText,
                label: sector.label
            }
        };
    }

    function template() {
        var p = path({
            dataBind: {
                attr: {
                    d: 'pathParts'
                }
            },
            // fill: arg.color,
            fill: 'silver',
            stroke: 'gray',
            strokeWidth: 2
        });

        var t = text({
            dataBind: {
                attr: {
                    x: 'text.x',
                    y: 'text.y'
                },
                text: 'text.label'
            },
            textAnchor: 'middle'
        });

        return [
            p,
            t
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