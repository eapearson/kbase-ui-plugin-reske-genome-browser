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
        svg = t('svg');

    // UTILS

    function getProp(obj, path, defaultValue) {
        function getter(obj, path) {
            if (path.length === 0) {
                return obj;
            }
            var k = path.shift();
            var v = obj[k];
            if (v === undefined) {
                return defaultValue;
            }
            return getter(v, path, defaultValue);
        }
        return getter(obj, path.split('.'));
    }

    function makeColor(rgbColor, alpha) {
        return 'rgba(' + rgbColor.join(',') + ',' + alpha + ')';
    }

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function (key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }

    // STRUCTURE MAKERS

    function makeRadial(config, data, uiVm, path) {
        var typeData = getProp(data, path).best_term;
        var typeConfig = getProp(config.goConfig, path);
        if (!typeData) {
            return;
        }
        var color = makeColor(typeConfig.color, 1);
        var showTooltip = ko.observable(false);
        // The data to show in the tooltip when needed.
        var tooltipData = {
            type: typeConfig.label,
            term: typeData,
        };
        showTooltip.subscribe(function () {
            if (showTooltip()) {
                uiVm.tooltip({
                    data: tooltipData
                });
            } else {
                uiVm.tooltip(null);
            }
        });
        var radial = {
            // for the radial 
            x: config.x,
            y: config.y,
            angle: typeData.term_position - (config.offset || 0),
            length: typeConfig.radial.length,
            width: typeConfig.radial.width || config.radialWidth,
            color: color,
            // for the label 
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
            label: ko.observable(typeConfig.label),
            // for toolip / mouseover
            description: typeConfig.description + ' (' + numeral(typeData.term_position).format('0.00') + ')',
            showTooltip: showTooltip
        };
        return radial;
    }

    function makeTypeRing(config, data, path, index) {
        // var typeData = getProp(data, path);
        // var typeConfig = getProp(config.goConfig, path);
        var radius = config.minRadius + config.ringWidth * index;
        // var typeDef = types[type];

        // Note, rings don't even use data.
        return {
            ring: {
                x: config.x,
                y: config.y,
                radius: radius,
                width: config.ringWidth,
                border: {
                    color: 'silver',
                    width: 1
                }
                // color: typeConfig.color
            }
        };
    }

    function makeTypeTicks(config, data, uiVm, path, index) {
        var typeData = getProp(data, path);
        var typeConfig = getProp(config.goConfig, path);


        return typeData.terms.map(function (termData) {
            var radius = config.minRadius + config.ringWidth * index;
            // try thihs...
            var theta = (config.tickLength / (2 * Math.PI * radius));
            var showTooltip = ko.observable(false);
            var tooltipData = {
                type: typeConfig.label,
                term: termData,
            };
            showTooltip.subscribe(function () {
                if (showTooltip()) {
                    uiVm.tooltip({
                        data: tooltipData
                    });
                } else {
                    uiVm.tooltip(null);
                }
            });
            var tick = {
                x: config.x,
                y: config.y,
                start: termData.term_position - (config.offset || 0) - (theta / 2),
                // theta: config.tickTheta,
                theta: theta,
                radius: radius,
                width: config.ringWidth,
                color: termData.color,
                showTooltip: showTooltip
            };
            return {
                tick: tick
            };
        });
    }

    // VIEWMODEL

    function viewModel(params) {
        var config = params.config;

        var vm = ko.pureComputed(function () {
            var data = params.vm.termRelations();
            // Normally everything is aligned to an axis with 0 to the right. We have
            // already re-aligned so that 0 as at the top.
            // Now we need to rotate the axis so that the "ref" needle as at the top.
            // We do that in one place so that we can easily undo it.
            if (!data.reference.best_term) {
                return {
                    display: false
                };
            }
            var rotation = data.reference.best_term.term_position;
            config.offset = rotation;
            // var tooltipData = ko.observable(null);
            var uiVm = {
                tooltip: params.tooltipVm.tooltip
            };
            return {
                display: true,
                config: config,
                radials: {
                    kbase: {
                        radial: makeRadial(config, data, uiVm, 'kbase')
                    },
                    community: {
                        radial: makeRadial(config, data, uiVm, 'reference')
                    }
                },
                rings: config.ringLayout.reduce(function (accum, type, index) {
                    var rings = makeTypeRing(config, data, type, index);
                    return accum.concat(rings);
                }, []),
                ticks: config.ringLayout.reduce(function (accum, type, index) {
                    var rings = makeTypeTicks(config, data, uiVm, type, index);
                    return accum.concat(rings);
                }, []),
                center: {
                    x: config.x,
                    y: config.y,
                    radius: 6,
                    color: 'black'
                }
                // info: {
                //     x: 0,
                //     y: config.height - 25,
                //     width: config.width,
                //     height: 25,
                //     text: selectedPath,
                //     font: {
                //         family: 'sans-serif',
                //         size: '12px'
                //     }
                // }
            };
        });

        return {
            vm: vm
        };
    }

    function buildWidget() {
        return svg({
            dataBind: {
                style: {
                    width: 'config.width',
                    height: 'config.height',
                },
            },
            // style: {
            //     outline: '1px silver solid',
            //     margin: '10px'
            // }
        }, [
            '<!-- ko foreach: rings -->',
            komponent({
                name: 'reske/widget/ring',
                params: {
                    ring: 'ring'
                }
            }),
            '<!-- /ko -->',
            '<!-- ko foreach: ticks -->',
            komponent({
                name: 'reske/widget/ringTick',
                params: {
                    tick: 'tick'
                }
            }),
            '<!-- /ko -->',
            '<!-- ko with: radials.kbase -->',
            komponent({
                name: 'reske/widget/radial',
                params: {
                    radial: 'radial'
                }
            }),
            '<!-- /ko -->',
            '<!-- ko with: radials.community -->',
            komponent({
                name: 'reske/widget/radial',
                params: {
                    radial: 'radial'
                }
            }),
            '<!-- /ko -->',
            komponent({
                name: 'reske/widget/circle',
                params: {
                    x: 'center.x',
                    y: 'center.y',
                    radius: 'center.radius',
                    color: 'center.color'
                }
            }),
            // '<!-- ko if: info.text() -->',
            // text({
            //     dataBind: {
            //         attr: {
            //             x: 'info.x',
            //             y: 'info.y',
            //             'font-family': 'info.font.family',
            //             'font-size': 'info.font.size'
            //         },
            //         text: 'info.text',
            //         // visible: 'info.text() && info.text().length > 0'
            //     }
            // }),
            // '<!-- /ko -->',
            // '<!-- ko ifnot: info.text() -->',
            // text({
            //     dataBind: {
            //         attr: {
            //             x: 'info.x',
            //             y: 'info.y',
            //             'font-family': 'info.font.family',
            //             'font-size': 'info.font.size'
            //         },
            //     },
            //     style: {
            //         fontStyle: 'italic'
            //     }
            // }, 'Hover over an element above to see more about it.'),
            // '<!-- /ko -->'
        ]);
    }

    function template() {
        return [
            '<!-- ko with: vm -->',
            '<!-- ko ifnot: display -->',
            'Cannot display',
            '<!-- /ko -->',
            '<!-- ko if: display -->',
            buildWidget(),
            '<!-- /ko -->',
            '<!-- /ko -->'
        ].join('\n');
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