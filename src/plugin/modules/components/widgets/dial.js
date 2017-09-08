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
        div = t('div'),
        svg = t('svg'),
        defs = t('defs'),
        mask = t('mask'),
        circle = t('circle'),
        rect = t('rect'),
        line = t('line'),
        text = t('text');


    function buildRadial(term) {
        return [
            '<!-- ko with: arg2.radials.' + term + ' -->',
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
                        fontFamily: 'fontFamily',
                        fontSize: 'fontSize'
                    },
                    text: 'label'
                },
                textAnchor: 'middle'
            }),
            '<!-- /ko -->'
        ];
    }

    /*
    buildRingAndTick
    expects the data prepared by makeRingAndTick
    tick
        begin
            x
            y
        end
            x
            y
        color
    ring
        x
        y
        radius
        width

    
    */
    function buildRingAndTick(termType) {
        var id = html.genId();
        var theCircle = circle({
            dataBind: {
                attr: {
                    cx: 'ring.x',
                    cy: 'ring.y',
                    r: 'ring.radius + ring.width',
                    fill: 'ring.color'
                }
            },
            mask: 'url(#' + id + ')'
        });
        var theTick = line({
            dataBind: {
                attr: {
                    x1: 'tick.begin.x',
                    y1: 'tick.begin.y',
                    x2: 'tick.end.x',
                    y2: 'tick.end.y',
                    stroke: 'tick.color'
                }
            },
            strokeWidth: 4
        });
        var m = mask({
            id: id,
        }, [
            rect({
                width: '100%',
                height: '100%',
                fill: 'white'
            }),
            circle({
                dataBind: {
                    attr: {
                        cx: 'ring.x',
                        cy: 'ring.y',
                        r: 'ring.radius'
                    }
                },
                fill: 'black'
            })
        ]);
        return [
            '<!-- ko with: arg2.termTypes["' + termType + '"] -->',
            theCircle,
            theTick,
            defs(m),
            '<!-- /ko -->'
        ];
    }

    function GeneViewer(arg) {
        var rings = ['community', 'kbase', 'expression', 'fitness'].map(function(termType, index) {
            return buildRingAndTick(termType, index);
        });

        var radialCommunity = buildRadial('community');

        var radialKBase = buildRadial('kbase');

        var center = circle({
            dataBind: {
                attr: {
                    cx: 'config.x',
                    cy: 'config.y',
                    r: 'config.centerRadius',
                }
            },
            stroke: 'black'
        });

        var legend = buildLegend();

        return svg({
            dataBind: {
                attr: {
                    width: 'config.width',
                    height: 'config.height',
                    x: 'config.x',
                    y: 'config.y'
                }
            },
            style: {
                outline: '1px silver solid',
                margin: '10px'
            }
        }, [rings, radialKBase, radialCommunity, center, legend]);
    }



    function buildLegend() {
        var box = rect({
            dataBind: {
                attr: {
                    x: 'config.x',
                    y: 'config.y',
                    width: 'config.width',
                    height: 'config.height'
                }
            },
            fill: 'white',
            // stroke: 'silver',
            // strokeWidth: 4
        });

        var lines = ['community', 'kbase', 'expression', 'fitness'].map(function(termType, index) {
            return [
                '<!-- ko with: termRelations.' + termType + '-->',
                rect({
                    dataBind: {
                        attr: {
                            x: 'swatch.x',
                            y: 'swatch.y',
                            fill: 'swatch.color',
                            width: '$parent.config.swatchSize',
                            height: '$parent.config.swatchSize'
                        },
                    },
                    stroke: 'gray',
                    strokeWidth: 2
                }),
                '<!-- ko foreach: labels -->',
                text({
                    dataBind: {
                        attr: {
                            x: 'x',
                            y: 'y',
                            'font-weight': '$data.fontWeight || "normal"'
                        },
                        text: 'text'
                    },
                    fontSize: '12px'
                }),
                '<!-- /ko -->',
                '<!-- /ko -->'
            ];
        });

        return [
            '<!-- ko with: legend -->',
            box,
            lines,
            '<!-- /ko -->'
        ];
    }

    function buildTermComparison() {
        var arg = {
            config: {
                width: 300,
                height: 600,
                x: 150,
                y: 150,
                predictions: {
                    a: {
                        bandColor: '#CCC',
                        tickColor: 'red'
                    },
                    b: {
                        bandColor: '#AAA',
                        tickColor: 'red'
                    },
                    c: {
                        bandColor: '#666',
                        tickColor: 'red'
                    }
                },
                ringWidth: 10,
                minRadius: 30,
                radialLength: 90,
                fontSize: 11,
                fontFamily: 'sans-serif',
                centerRadius: 5
            },
            data: {
                community: {
                    value: 0.5,
                    color: 'black',
                    label: 'Community'
                },
                kbase: {
                    value: 0.3,
                    color: 'orange',
                    label: 'KBase'
                },
                predictions: {
                    a: {
                        value: 0.2
                    },
                    b: {
                        value: 0.1
                    },
                    c: {
                        value: 0.7
                    }
                }
            }
        };

        return GeneViewer(arg);
    }

    function viewModel(params) {
        var termRelationsMap = ko.observable();
        var config = {
            width: 300,
            height: 550,
            x: 150,
            y: 150,
            ringWidth: 10,
            minRadius: 30,
            radialLength: 90,
            fontSize: 11,
            fontFamily: 'sans-serif',
            centerRadius: 5,
            termRelations: {
                community: {
                    color: 'black',
                    tickColor: 'silver',
                    label: 'Community'
                },
                kbase: {
                    color: 'orange',
                    tickColor: 'yellow',
                    label: 'KBase'
                },
                expression: {
                    color: 'green',
                    tickColor: 'lime',
                    label: 'Expression'
                },
                fitness: {
                    color: 'gray',
                    tickColor: 'silver',
                    label: 'Fitness'
                }
            }
        };

        function updateMap() {
            var temp = {};
            params.vm.termRelations().forEach(function(relation) {
                temp[relation.relation_type] = relation;
            });
            termRelationsMap(temp);
        }
        updateMap();

        // Make all the data required for a radial -- hand on the dial :) 
        function makeRadial(term) {
            // TODO: need to align term_position to angle.
            var termRelation = termRelationsMap()[term];
            var x2 = config.x + config.radialLength * Math.cos(termRelation.term_position * 2 * Math.PI);
            var y2 = config.y + config.radialLength * Math.sin(termRelation.term_position * 2 * Math.PI);
            var yLabel;
            if (termRelation.term_position >= 0.5) {
                yLabel = y2 - config.fontSize / 2;
            } else {
                yLabel = y2 + config.fontSize;
            }
            var label = config.termRelations[term].label +
                ' (' +
                numeral(termRelation.term_position).format('0.00') +
                ')';
            return {
                x1: config.x,
                y1: config.y,
                x2: x2,
                y2: y2,
                stroke: config.termRelations[term].color,
                strokeWidth: 4,
                label: label,
                xLabel: x2,
                yLabel: yLabel,
                fontFamily: config.fontFamily,
                fontSize: config.fontSize,
                value: termRelation.term_position
            };
        }

        function makeRingWithTick(term, ringNumber) {
            // TODO: need to align term_position to angle.
            var termRelation = termRelationsMap()[term];
            var termConfig = config.termRelations[term];

            var radius = config.minRadius + ringNumber * config.ringWidth;
            var length = config.ringWidth;

            var angle = termRelation.term_position;
            var xBegin = config.x + radius * Math.cos(angle * 2 * Math.PI);
            var yBegin = config.y + radius * Math.sin(angle * 2 * Math.PI);

            var xEnd = config.x + (radius + length) * Math.cos(angle * 2 * Math.PI);
            var yEnd = config.y + (radius + length) * Math.sin(angle * 2 * Math.PI);
            var x = {
                ring: {
                    x: config.x,
                    y: config.y,
                    radius: radius,
                    width: config.ringWidth,
                    color: termConfig.color
                },
                tick: {
                    begin: {
                        x: xBegin,
                        y: yBegin
                    },
                    end: {
                        x: xEnd,
                        y: yEnd
                    },
                    color: termConfig.tickColor
                }
            };
            return x;
        }

        function makeLegend() {

            var xLegend = 10;
            var yLegend = 300;
            var itemHeight = 50;
            var legendBoxLeftPadding = 10;
            var legendBoxTopPadding = 10;

            var vm = {
                config: {
                    x: xLegend,
                    y: yLegend,
                    width: 200,
                    height: 250,
                    swatchSize: 20
                },
                termRelations: {}
            };

            ['community', 'kbase', 'expression', 'fitness'].map(function(termType, index) {
                var termRelation = termRelationsMap()[termType];
                var termConfig = config.termRelations[termType];
                var xBase = xLegend + legendBoxLeftPadding;
                var yBase = yLegend + index * itemHeight + legendBoxTopPadding;
                vm.termRelations[termType] = {
                    swatch: {
                        x: xBase,
                        y: yBase,
                        color: termConfig.color
                    },
                    labels: [{
                        x: xBase + 30 + 10,
                        y: yBase + 12,
                        text: termType,
                        fontWeight: 'bold'
                    }, {
                        x: xBase + 30 + 10 + 70,
                        y: yBase + 12,
                        text: numeral(termRelation.term_position).format('0.00')
                    }, {
                        x: xBase + 30 + 10,
                        y: yBase + 29,
                        text: termRelation.term_name
                    }]
                };
            });

            return vm;
        }

        var arg2 = {
            radials: {
                community: ko.observable(makeRadial('community')),
                kbase: ko.observable(makeRadial('kbase'))
            },
            termTypes: {
                community: ko.observable(makeRingWithTick('community', 0)),
                kbase: ko.observable(makeRingWithTick('kbase', 1)),
                expression: ko.observable(makeRingWithTick('expression', 2)),
                fitness: ko.observable(makeRingWithTick('fitness', 3))
            }
        };

        var legend = ko.observable(makeLegend());

        params.vm.termRelations.subscribe(function() {
            updateMap();
            arg2.radials.community(makeRadial('community'));
            arg2.radials.kbase(makeRadial('kbase'));
            ['community', 'kbase', 'expression', 'fitness'].forEach(function(termType, index) {
                arg2.termTypes[termType](makeRingWithTick(termType, index));
            });
            legend(makeLegend());
        });
        return {
            config: config,
            enabled: true,
            vm: params.vm,
            legend: legend,
            arg2: arg2
        };
    }

    function template() {
        return div({
            dataBind: {
                if: 'vm.termRelations'
            }
        }, buildTermComparison());
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