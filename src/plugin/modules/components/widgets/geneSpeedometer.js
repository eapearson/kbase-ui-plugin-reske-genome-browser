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
        div = t('div'),
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

    function makeSemiRadial(config, data, ui, path) {
        var typeData = getProp(data, path).best_term;
        var typeConfig = getProp(config.goConfig, path);
        if (!typeData) {
            return;
        }
        var color = makeColor(typeConfig.color, typeConfig.alpha || 1);
        var showTooltip = ko.observable(false);
        // The data to show in the tooltip when needed.
        var tooltipData = {
            type: typeConfig.label,
            term: typeData,
        };
        showTooltip.subscribe(function () {
            if (showTooltip()) {
                ui.tooltip({
                    data: tooltipData
                });
            } else {
                ui.tooltip(null);
            }
        });
        var radial = {
            // for the radial 
            x: config.x,
            y: config.y,
            // scale to 1/2 for semicircle, offset 1/4 to move to left.
            angle: 0.5 * typeData.term_position - (config.offset || 0) - 0.25,
            length: typeConfig.radial.length,
            width: typeConfig.radial.width || config.radialWidth,
            color: color,
            // for the label 
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
            // label: ko.observable(typeConfig.label),
            // for toolip / mouseover
            description: typeConfig.description + ' (' + numeral(typeData.term_position).format('0.00') + ')',
            showTooltip: showTooltip
        };
        return radial;
    }

    function makeTypeSemiRing(config, data, path, index) {
        var radius = config.minRadius + config.ringWidth * index;

        // Note, rings don't even use data.
        // Note: this design, building rings purely on the position of the 
        // ring in the configuration, implies that we build rings even if there
        // is no data for the ring, which we don't discover here because we
        // don't inspect the data at all.
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
            }
        };
    }

    function makeTypeSemiTicks(config, data, ui, path, index) {
        var typeData = getProp(data, path);
        var typeConfig = getProp(config.goConfig, path);

        if (!typeData) {
            return [];
        }

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
                    ui.tooltip({
                        data: tooltipData
                    });
                } else {
                    ui.tooltip(null);
                }
            });
            var tick = {
                x: config.x,
                y: config.y,
                start: 0.5 * termData.term_position - (config.offset || 0) - (theta / 2) - 0.25,
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

    // text({
    //     dataBind: {
    //         attr: {
    //             x: 'xLabel',
    //             y: 'yLabel',
    //             'font-family': 'fontFamily',
    //             'font-size': 'fontSize',
    //             'text-anchor': '"middle"',
    //             transform: 'textFilter'
    //         },
    //         text: 'label'
    //     }

    function makeDialTicks(config, it) {
        var ticks = [0, 0.25, 0.5, 0.75, 1];
        var theta = 0.005;

        return ticks.map(function (tick) {
            return {
                tick: {
                    x: config.x,
                    y: config.y,
                    start: 0.5 * tick - (theta / 2) - 0.25,
                    theta: theta,
                    radius: config.minRadius + it.rings.length * config.ringWidth,
                    width: 5,
                    color: 'black'
                },
                label: {
                    offset: 10,
                    fontFamily: config.fontFamily,
                    fontSize: config.fontSize,
                    textAnchor: 'middle',
                    label: String(tick)
                }
            };
        });
    }

    function makeBase(config, it) {
        // console.log('base', config.minRadius, it.rings.length, config.ringWidth);
        var x1 = config.x - config.minRadius - it.rings.length * config.ringWidth;
        var y1 = config.y;
        var x2 = config.x + config.minRadius + it.rings.length * config.ringWidth;
        var y2 = config.y;
        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            width: 1,
            color: 'silver'
        };
    }

    // VIEWMODEL

    function viewModel(params) {
        var config = params.config;

        var vm = ko.pureComputed(function () {
            var data = params.vm.termRelations();
            var error = ko.observable();
            // Normally everything is aligned to an axis with 0 to the right. We have
            // already re-aligned so that 0 as at the top.
            // Now we need to rotate the axis so that the "ref" needle as at the top.
            // We do that in one place so that we can easily undo it.
            if (!data.reference.best_term) {
                error({
                    message: 'Cannot display graph - no reference term for the gene'
                });
                return {
                    error: error
                };
            }
            var rotation = data.reference.best_term.term_position;
            config.offset = rotation;
            // var tooltipData = ko.observable(null);
            var ui = {
                tooltip: params.ui.tooltip
            };
            var it = {
                error: error,
                config: config,
                radials: {
                    kbase: {
                        radial: makeSemiRadial(config, data, ui, 'kbase')
                    },
                    community: {
                        radial: makeSemiRadial(config, data, ui, 'reference')
                    }
                },
                rings: config.ringLayout
                    .reduce(function (accum, type, index) {
                        return accum.concat(makeTypeSemiRing(config, data, type, index));
                    }, [])
                    .filter(function (ring) {
                        return ring ? true : false;
                    }),
                ticks: config.ringLayout
                    .reduce(function (accum, type, index) {
                        return accum.concat(makeTypeSemiTicks(config, data, ui, type, index));
                    }, [])
                    .filter(function (ticks) {
                        return ticks ? true : false;
                    }),

                center: {
                    x: config.x,
                    y: config.y,
                    radius: 6,
                    color: 'silver'
                },

                label: {
                    text: {
                        x: config.x,
                        y: config.y - 15,
                        fontFamily: config.fontfamily,
                        fontSize: '7.5px',
                        textAnchor: 'middle',
                        text: 'Distance from User Term'
                    }
                }
            };
            it.base = makeBase(config, it);
            it.ticks2 = makeDialTicks(config, it);
            return it;
        });

        return {
            vm: vm
        };
    }

    function buildWidget() {
        return svg({
            dataBind: {
                style: {
                    preserveAspectRatio: '"xMidYMid meet"'
                },
                attr: {
                    viewBox: '"0 0 " + config.width + " " + config.height'
                }
            },
            style: {
                width: '100%'
            }
        }, [
            komponent({
                name: 'reske/widget/line',
                params: {
                    line: 'base'
                }
            }),
            '<!-- ko foreach: rings -->',
            komponent({
                name: 'reske/widget/semiRing',
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
            '<!-- ko foreach: ticks2 -->',
            komponent({
                name: 'reske/widget/ringTick',
                params: {
                    tick: 'tick',
                    label: 'label'
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
            '<!-- ko with: label -->',
            komponent({
                name: 'reske/widget/text',
                params: {
                    text: 'text'
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
            })
        ]);
    }

    function buildError() {
        return div({
            class: 'well danger',
            dataBind: {
                text: 'search.error().mesage'
            }
        });
    }

    function template() {
        return [
            '<!-- ko with: vm -->',
            '<!-- ko if: error -->',
            buildError(),
            '<!-- /ko -->',
            '<!-- ko ifnot: error -->',
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