define([
    'numeral',
    'knockout-plus',
    'kb_common/html'
], function(
    numeral,
    ko,
    html
) {
    'use string';

    var t = html.tag,
        div = t('div'),
        svg = t('svg'),
        table = t('table'),
        tr = t('tr'),
        td = t('td'),
        th = t('th'),
        input = t('input'),
        label = t('label');

    var rect = t('rect'),
        text = t('text');

    // COMPONENTS

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function(key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }


    // Editor for testing...

    function buildEditor() {
        return div([
            div({
                class: 'form'
            }, [
                div({
                    class: 'form-group'
                }, [
                    label('Sectors'),
                    table({
                        class: 'table'
                    }, [
                        tr([
                            th('#'),
                            td(input({
                                dataBind: {
                                    value: 'config.sectorCount'
                                },
                                class: 'form-control'
                            }))
                        ])
                    ])
                ]),
                div({
                    class: 'form-group'
                }, [
                    label('Radial 1'),
                    table({
                        class: 'table'
                    }, [
                        tr([
                            th('Label'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Color'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Value'),
                            td(input({
                                class: 'form-control'
                            }))
                        ])
                    ])
                ]),
                div({
                    class: 'form-group'
                }, [
                    label('Radial 2'),
                    table({
                        class: 'table'
                    }, [
                        tr([
                            th('Label'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Color'),
                            td(input({
                                class: 'form-control'
                            }))
                        ]),
                        tr([
                            th('Value'),
                            td(input({
                                class: 'form-control'
                            }))
                        ])
                    ])
                ])

            ])
        ]);
    }

    // function makeLegend(config, data) {


    //     // Massage into coordinates...
    //     var container = {
    //         x: 10,
    //         y: 300,
    //         width: 290,
    //         height: 300,
    //         color: 'white'
    //     };
    //     var lineHeight = 40;

    //     var top = container.y;
    //     var currentBase = top;

    //     var title = {
    //         text: 'Legend',
    //         x: config.leftMargin,
    //         y: top,
    //     };
    //     // move down to clear this text.
    //     currentBase += 20;

    //     var sections = config.ringLayout.map(function(type) {
    //         // currentBase += 10; // section title height.
    //         // currentBase += 30; // space from whatever was there before.
    //         var typeConfig = getProp(config, 'goConfig.types.' + type);
    //         var typeData = getProp(data, 'types.' + type);
    //         var title = {
    //             text: typeConfig.label,
    //             x: config.leftMargin,
    //             y: currentBase
    //         };
    //         currentBase += 20;


    //         var lines = typeData.goterms.map(function(termData, index) {
    //             // console.log('term data', termData);
    //             var alpha = Math.pow(1 - termData.pValue, 3);
    //             currentBase += lineHeight;
    //             // var lineBase = currentBase + index * lineHeight;
    //             var lineBase = currentBase;
    //             return {
    //                 swatch: {
    //                     color: makeColor(typeConfig.color, alpha),
    //                     x: config.leftMargin,
    //                     y: lineBase - config.legend.swatchSize, // note aligned 
    //                     width: config.legend.swatchSize,
    //                     height: config.legend.swatchSize
    //                 },
    //                 valueText: {
    //                     x: config.leftMargin + 20,
    //                     y: lineBase,
    //                     text: String(termData.location)
    //                 },
    //                 subValueText: {
    //                     x: config.leftMargin + 20,
    //                     y: lineBase + 15,
    //                     text: String(termData.pValue)
    //                 },
    //                 labelText: {
    //                     x: config.leftMargin + 60,
    //                     y: lineBase,
    //                     text: termData.id
    //                 },
    //                 subLabelText: {
    //                     x: config.leftMargin + 60,
    //                     y: lineBase + 15,
    //                     text: termData.name
    //                 }
    //                 // subLabel: {
    //                 //     x: xx,
    //                 //     y: yy,
    //                 //     text: terData.name
    //                 // },

    //             };
    //         });
    //         return {
    //             section: {
    //                 title: title,
    //                 lines: lines
    //             }
    //         };
    //     });

    //     return {
    //         container: container,
    //         title: title,
    //         sections: sections
    //     };
    // }

    function buildText() {
        return text({
            dataBind: {
                attr: {
                    x: 'x',
                    y: 'y',
                    'font-weight': '$data.fontWeight || "normal"'
                },
                text: 'text'
            }
        });
    }

    function buildBox() {
        return rect({
            dataBind: {
                attr: {
                    x: 'x',
                    y: 'y',
                    width: 'width',
                    height: 'height',
                    fill: 'color'
                }
            },

        });
    }

    function koWith(expr, content) {
        return [
            '<!-- ko with: ' + expr + '-->',
            content,
            '<!-- /ko -->'
        ];
    }

    // function buildLegend() {


    //     var container = [
    //         '<!-- ko with: container -->',
    //         buildBox(),
    //         '<!-- /ko -->'
    //     ];

    //     var title = [
    //         '<!-- ko with: title -->',
    //         buildText(),
    //         '<!-- /ko -->'
    //     ];


    //     var lines = [
    //         '<!-- ko foreach: sections -->',
    //         '<!-- ko with: section -->',
    //         '<!-- ko with: title -->',
    //         buildText(),
    //         '<!-- /ko -->',

    //         '<!-- ko foreach: lines -->',

    //         '<!-- ko with: swatch -->',
    //         buildBox(),
    //         '<!-- /ko -->',

    //         '<!-- ko with: valueText -->',
    //         buildText(),
    //         '<!-- /ko -->',

    //         '<!-- ko with: subValueText -->',
    //         buildText(),
    //         '<!-- /ko -->',


    //         '<!-- ko with: labelText -->',
    //         buildText(),
    //         '<!-- /ko -->',

    //         '<!-- ko with: subLabelText -->',
    //         buildText(),
    //         '<!-- /ko -->',


    //         '<!-- /ko -->',

    //         '<!-- /ko -->',
    //         '<!-- /ko -->',
    //     ];

    //     return [
    //         '<!-- ko with: legend -->',
    //         container,
    //         title,
    //         lines,
    //         '<!-- /ko -->'
    //     ];
    // }

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
            Object.keys(componentDef.params).map(function(key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }



    function makeRadial(config, data, path) {
        var typeData = getProp(data, path).best_term;
        var typeConfig = getProp(config.goConfig, path);
        var color = makeColor(typeConfig.color, 1);
        var radial = {
            x: config.x,
            y: config.y,
            angle: typeData.term_position,
            length: config.radialLength,
            width: 4,
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
            label: typeConfig.label,
            color: color
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

    function makeTypeTicks(config, data, path, index) {
        var typeData = getProp(data, path);
        var typeConfig = getProp(config.goConfig, path);
        return typeData.terms.map(function(termData) {
            var radius = config.minRadius + config.ringWidth * index;
            var alpha = Math.pow(1 - termData.pvalue, 3);
            var tick = {
                x: config.x,
                y: config.y,
                start: termData.term_position,
                theta: config.tickTheta,
                radius: radius,
                width: config.ringWidth,
                color: makeColor(typeConfig.color, alpha)
            };
            return {
                tick: tick
            };
        });
    }

    function viewModel(params) {
        var config = params.config;
        var data = params.data;
        return {
            config: config,
            radials: {
                kbase: {
                    radial: makeRadial(config, data, 'kbase')
                },
                community: {
                    radial: makeRadial(config, data, 'reference')
                }
            },
            rings: config.ringLayout.reduce(function(accum, type, index) {
                var rings = makeTypeRing(config, data, type, index);
                return accum.concat(rings);
            }, []),
            ticks: config.ringLayout.reduce(function(accum, type, index) {
                var rings = makeTypeTicks(config, data, type, index);
                return accum.concat(rings);
            }, []),
            center: {
                x: config.x,
                y: config.y,
                radius: 6,
                color: 'black'
            },
            // legend: makeLegend(config, data)
        };
    }

    function template() {
        return svg({
            id: 'mysvg',
            width: 300,
            height: 300,
            style: {
                outline: '1px silver solid',
                margin: '10px'
            }
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
            // buildRadial(vm.radials.kbase, vm.config),
            // buildRadial(vm.radials.community, vm.config),
            komponent({
                name: 'reske/widget/circle',
                params: {
                    x: 'center.x',
                    y: 'center.y',
                    radius: 'center.radius',
                    color: 'center.color'
                }
            }),
            // buildLegend()
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    ko.components.register('reske/gene/test', component());



    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;

        function viewModel() {
            var config = {
                x: 150,
                y: 150,
                fontFamily: 'monspace',
                fontSize: 10,
                radius: 80,
                minRadius: 50,
                radialLength: 100,
                ringWidth: 10,
                sectorCount: ko.observable(5),
                tickTheta: 0.05,
                ringLayout: ['reference', 'kbase', 'fitness', 'expression'],
                leftMargin: 10,
                goConfig: {
                    reference: {
                        label: 'Ref',
                        color: [0, 0, 0],
                    },
                    kbase: {
                        label: 'Kbase',
                        color: [249, 124, 0]
                    },
                    fitness: {
                        label: 'Fitness',
                        color: [33, 140, 56]
                    },
                    expression: {
                        label: 'Expression',
                        color: [25, 49, 135],
                    }
                },
                // legend: {
                //     leftMargin: 10,
                //     top: 300,
                //     swatchSize: 10
                // }
            };

            var data = {
                'kbase': {
                    'best_term': {
                        'term_guid': 'GO:0007544',
                        'term_name': 'toxin activity',
                        'term_position': 0.19045577238621214,
                        'pvalue': 0.01888032575400423
                    },
                    'terms': [{
                        'term_guid': 'GO:0007544',
                        'term_name': 'toxin activity',
                        'term_position': 0.19045577238621214,
                        'pvalue': 0.01888032575400423,
                        'best': true
                    }, {
                        'term_guid': 'GO:0002086',
                        'term_name': 'phosphatase activator activity',
                        'term_position': 0.29193329018401826,
                        'pvalue': 0.04200184084110209,
                        'best': false
                    }]
                },
                'reference': {
                    'best_term': {
                        'term_guid': 'GO:0001060',
                        'term_name': 'phosphatase activator activity',
                        'term_position': 0.9097513451191339,
                        'pvalue': 0.0020650276459798
                    },
                    'terms': [{
                        'term_guid': 'GO:0001060',
                        'term_name': 'phosphatase activator activity',
                        'term_position': 0.9097513451191339,
                        'pvalue': 0.0020650276459798,
                        'best': true
                    }, {
                        'term_guid': 'GO:0007480',
                        'term_name': 'electron carrier activity',
                        'term_position': 0.6607962889167514,
                        'pvalue': 0.004763661262255231,
                        'best': false
                    }, {
                        'term_guid': 'GO:0000507',
                        'term_name': 'electron carrier activity',
                        'term_position': 0.4331851845001753,
                        'pvalue': 0.009077942059503723,
                        'best': false
                    }, {
                        'term_guid': 'GO:0004513',
                        'term_name': 'phosphatase activator activity',
                        'term_position': 0.5039556238101423,
                        'pvalue': 0.0373011286716792,
                        'best': false
                    }]
                },
                'fitness': {
                    'best_term': {
                        'term_guid': 'GO:0000252',
                        'term_name': 'cyclase regulator activity',
                        'term_position': 0.09449050158519567,
                        'pvalue': 0.005194142092375414
                    },
                    'terms': [{
                        'term_guid': 'GO:0000252',
                        'term_name': 'cyclase regulator activity',
                        'term_position': 0.09449050158519567,
                        'pvalue': 0.005194142092375414,
                        'best': true
                    }, {
                        'term_guid': 'GO:0005704',
                        'term_name': 'ADP binding',
                        'term_position': 0.8188066998100656,
                        'pvalue': 0.017633925553846463,
                        'best': false
                    }, {
                        'term_guid': 'GO:0008104',
                        'term_name': 'phosphatase activator activity',
                        'term_position': 0.29067982083483257,
                        'pvalue': 0.029511792923659096,
                        'best': false
                    }, {
                        'term_guid': 'GO:0005224',
                        'term_name': '11-deoxycortisol binding',
                        'term_position': 0.06911337995918077,
                        'pvalue': 0.030511399397602296,
                        'best': false
                    }]
                },
                'expression': {
                    'best_term': {
                        'term_guid': 'GO:0001470',
                        'term_name': 'eukaryotic elongation factor-2 kinase activator activity',
                        'term_position': 0.28836044873037336,
                        'pvalue': 0.029246175866360434
                    },
                    'terms': [{
                        'term_guid': 'GO:0001470',
                        'term_name': 'eukaryotic elongation factor-2 kinase activator activity',
                        'term_position': 0.28836044873037336,
                        'pvalue': 0.029246175866360434,
                        'best': true
                    }, {
                        'term_guid': 'GO:0004522',
                        'term_name': 'electron carrier activity',
                        'term_position': 0.07761305411286368,
                        'pvalue': 0.031140853445243998,
                        'best': false
                    }, {
                        'term_guid': 'GO:0001023',
                        'term_name': 'cyclase regulator activity',
                        'term_position': 0.9568512485505397,
                        'pvalue': 0.033209654384150564,
                        'best': false
                    }]
                }
            };
            return {
                config: config,
                data: data
            };
        }

        function render() {
            // Make a big frickin' structure...
            var vm = viewModel();

            container.innerHTML = div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6'
                    }, div({
                        dataBind: {
                            component: {
                                name: '"reske/gene/test"',
                                params: {
                                    config: 'config',
                                    data: 'data'
                                }
                            }
                        }
                    })),
                    div({
                        class: 'col-sm-6'
                    }, buildEditor())
                ])
            ]);
            ko.applyBindings(vm, container);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
            render();
        }

        function stop() {}

        function detach() {}

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function(config) {
            return factory(config);
        }
    };
});