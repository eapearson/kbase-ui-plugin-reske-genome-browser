define(['knockout-plus', 'numeral', 'kb_common/html'], function (
    ko,
    numeral,
    html
) {
    'use strict';

    var t = html.tag,
        text = t('text'),
        title = t('title'),
        line = t('line');

    var unwrap = ko.utils.unwrapObservable;

    function viewModel(params) {
        var radial = params.radial;
        // This points the zero angle at the top

        var it = ko.pureComputed(function () {
            // effects
            if (!radial) {
                return;
            }
            var filters = [];
            if (radial.dropShadow) {
                // var offsets = radial.dropShadow.map(function(x) {
                //     return x + 'px';
                // }).join(' ');
                var offsets =
                    radial.dropShadow.offsetX + 'px ' + radial.dropShadow.offsetY + 'px';
                if (radial.dropShadow.blurRadius) {
                    offsets += ' ' + radial.dropShadow.blurRadius + 'px';
                }
                radial.dropShadow.blurRadius + 'px';
                filters.push(
                    'drop-shadow(' + offsets + ' ' + radial.dropShadow.color ||
                    'gray' + ')'
                );
            }
            var filter = filters.join(' ');

            // the radial
            var angle = unwrap(radial.angle) - 0.25;
            var x2 = radial.x + radial.length * Math.cos(angle * 2 * Math.PI);
            var y2 = radial.y + radial.length * Math.sin(angle * 2 * Math.PI);

            // THe label
            var label = unwrap(radial.label);
            if (label !== undefined && label.length > 0) {
                var xLabel, yLabel, textFilter;
                switch (radial.labelStyle) {
                case 'radial':
                    // This effectively, hopefully, centers the text on the radial by bumping
                    // it down (or up) by textAdjust angle. The 0.3 ratio of the font size
                    // is purely by tria and error.
                    var textAdjust =
                        0.3 * radial.fontSize / (2 * Math.PI * radial.length);

                    var textAngle;
                    if (angle >= 0.25 && angle <= 0.75) {
                        textAngle = angle - 0.5;
                        textAdjust = textAdjust * -1;
                    } else {
                        textAngle = angle;
                    }
                    xLabel =
                        radial.x +
                        (radial.length + radial.fontSize) *
                        Math.cos((angle + textAdjust) * 2 * Math.PI);
                    yLabel =
                        radial.y +
                        (radial.length + radial.fontSize) *
                        Math.sin((angle + textAdjust) * 2 * Math.PI);
                    var rotateAngle = 360 * textAngle;
                    // label = label + ' - ' + rotateAngle;
                    textFilter =
                        'rotate(' + [rotateAngle, xLabel, yLabel].join(' ') + ')';
                    break;
                default:
                    xLabel = x2;
                    if (angle >= 0 && angle <= 0.5) {
                        yLabel = y2 + radial.fontSize;
                    } else if (angle > -1 && angle <= -0.5) {
                        yLabel = y2 + radial.fontSize;
                    } else {
                        yLabel = y2 - radial.fontSize / 2;
                    }
                }
            }

            var labelShowing = ko.observable(false);

            function doMouseOver() {
                radial.showTooltip(true);
            }

            function doMouseOut() {
                radial.showTooltip(false);
            }

            // var stroke;
            // var strokeWidth;
            // if (params.highlight) {
            //     stroke = 'red';
            //     strokeWidth = 1;
            // } else {
            var stroke = radial.color;
            var strokeWidth = radial.width;
            // }



            // var label = radial.label +
            //     ' (' +
            //     numeral(angle + 0.25).format('0.00') +
            //     ')';
            return {
                x1: radial.x,
                y1: radial.y,
                x2: x2,
                y2: y2,
                stroke: stroke,
                strokeWidth: strokeWidth,
                label: radial.label,
                xLabel: xLabel,
                yLabel: yLabel,
                fontFamily: radial.fontFamily,
                fontSize: radial.fontSize + 'px',
                textFilter: textFilter,
                value: radial.angle,
                filter: filter,
                showTooltip: radial.showTooltip,

                labelShowing: labelShowing,
                doMouseOver: doMouseOver,
                doMouseOut: doMouseOut
            };
        });

        return {
            radial: it
        };
    }

    function template() {
        return [
            '<!-- ko if: radial -->',
            '<!-- ko with: radial -->',
            line({
                dataBind: {
                    attr: {
                        x1: 'x1',
                        y1: 'y1',
                        x2: 'x2',
                        y2: 'y2',
                        stroke: 'stroke',
                        'stroke-width': 'strokeWidth',
                        filter: 'filter'
                    },
                    event: {
                        mouseover: 'doMouseOver',
                        mouseout: 'doMouseOut'
                    }
                },
                style: {
                    cursor: 'pointer'
                }
            }),
            '<!-- ko if: label -->',
            text({
                dataBind: {
                    attr: {
                        x: 'xLabel',
                        y: 'yLabel',
                        'font-family': 'fontFamily',
                        'font-size': 'fontSize',
                        'text-anchor': '"middle"',
                        transform: 'textFilter'
                    },
                    text: 'label'
                }
            }),
            '<!-- /ko -->',
            '<!-- /ko -->',
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