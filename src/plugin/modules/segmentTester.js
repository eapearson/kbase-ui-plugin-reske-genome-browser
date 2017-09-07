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
        circle = t('circle'),
        line = t('line'),
        text = t('text'),
        path = t('path'),
        table = t('table'),
        tr = t('tr'),
        td = t('td'),
        th = t('th'),
        input = t('input'),
        label = t('label');

    // COMPONENTS

    function Sector() {
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

        return {
            viewModel: viewModel,
            template: {
                svg: template()
            }
        };
    }
    ko.components.register('reske/svg/sector', Sector());

    function Circle() {
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
        return {
            viewModel: viewModel,
            template: {
                svg: template()
            }
        };
    }
    ko.components.register('reske/svg/circle', Circle());

    function Radial() {
        function viewModel(params) {
            var x2 = config.x + config.radialLength * Math.cos(arg.angle * 2 * Math.PI);
            var y2 = config.y + config.radialLength * Math.sin(arg.angle * 2 * Math.PI);
            var yLabel;
            if (arg.angle >= 0.5) {
                yLabel = y2 - config.fontSize / 2;
            } else {
                yLabel = y2 + config.fontSize;
            }
            var label = arg.label +
                ' (' +
                numeral(arg.angle).format('0.00') +
                ')';
            return {
                x1: config.x,
                y1: config.y,
                x2: x2,
                y2: y2,
                stroke: arg.color,
                strokeWidth: 4,
                label: label,
                xLabel: x2,
                yLabel: yLabel,
                fontFamily: config.fontFamily,
                fontSize: config.fontSize + 'px',
                value: arg.angle
            };
        }

        function template() {
            return [
                line({
                    dataBind: {
                        attr: {
                            x1: 'x1',
                            y1: 'y1',
                            x2: 'x2',
                            y2: 'y2',
                            stroke: 'stroke',
                            strokeWidth: 'strokeWidth'
                        }
                    }
                }),
                text({
                    dataBind: {
                        attr: {
                            x: 'xLabel',
                            y: 'yLabel',
                            fontFamily: 'fontFamily',
                            fontSize: 'fontSize',
                            textAnchor: '"middle"'
                        },
                        text: 'label'
                    }
                }),
            ];
        }
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    ko.components.register('reske/svg/radial', Radial());

    /*
    A sector is two radius vectors connected by an arc.
    */
    // function buildSector(arg) {
    //     // First radius vector
    //     var xBegin = arg.x + arg.radius * Math.cos(arg.sector.start * 2 * Math.PI);
    //     var yBegin = arg.y + arg.radius * Math.sin(arg.sector.start * 2 * Math.PI);

    //     var endAngle = arg.sector.start + arg.sector.theta;

    //     // Second radius vector
    //     var xEnd = arg.x + arg.radius * Math.cos(endAngle * 2 * Math.PI);
    //     var yEnd = arg.y + arg.radius * Math.sin(endAngle * 2 * Math.PI);

    //     // Text label is the mid point
    //     var midAngle = arg.sector.start + arg.sector.theta / 2;
    //     var xText = arg.x + arg.radius * 0.7 * Math.cos(midAngle * 2 * Math.PI);
    //     var yText = arg.y + arg.radius * 0.7 * Math.sin(midAngle * 2 * Math.PI);

    //     var largeArc;
    //     if (arg.sector.theta > 0.5) {
    //         largeArc = 1;
    //     } else {
    //         largeArc = 0;
    //     }

    //     var pathParts = [
    //         'M', arg.x, arg.y,
    //         'L', xBegin, yBegin,
    //         'A', arg.radius, arg.radius, 0, largeArc, 1, xEnd, yEnd,
    //         'L', arg.x, arg.y
    //     ];

    //     var p = path({
    //         d: pathParts.join(' '),
    //         // fill: arg.color,
    //         fill: 'silver',
    //         stroke: 'gray',
    //         strokeWidth: 2
    //     });

    //     var t = text({
    //         x: xText,
    //         y: yText,
    //         textAnchor: 'middle'
    //     }, arg.label);

    //     return [
    //         p,
    //         t
    //     ];
    // }

    function makeRadial(arg, config) {
        // TODO: need to align term_position to angle.
        var x2 = config.x + config.radialLength * Math.cos(arg.angle * 2 * Math.PI);
        var y2 = config.y + config.radialLength * Math.sin(arg.angle * 2 * Math.PI);
        var yLabel;
        if (arg.angle >= 0.5) {
            yLabel = y2 - config.fontSize / 2;
        } else {
            yLabel = y2 + config.fontSize;
        }
        var label = arg.label +
            ' (' +
            numeral(arg.angle).format('0.00') +
            ')';
        return {
            x1: config.x,
            y1: config.y,
            x2: x2,
            y2: y2,
            stroke: arg.color,
            strokeWidth: 4,
            label: label,
            xLabel: x2,
            yLabel: yLabel,
            fontFamily: config.fontFamily,
            fontSize: config.fontSize + 'px',
            value: arg.angle
        };
    }

    // function buildRadial(arg) {
    //     return [
    //         line({
    //             x1: arg.x1,
    //             y1: arg.y1,
    //             x2: arg.x2,
    //             y2: arg.y2,
    //             stroke: arg.stroke,
    //             strokeWidth: arg.strokeWidth
    //         }),
    //         text({
    //             x: arg.xLabel,
    //             y: arg.yLabel,
    //             fontFamily: arg.fontFamily,
    //             fontSize: arg.fontSize,
    //             textAnchor: 'middle'
    //         }, arg.label),
    //     ];
    // }

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function(key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }

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
                radialLength: 100,
                sectorCount: ko.observable(5)
            };

            var sectors = ko.observableArray();

            function updateSectors() {
                var sectorCount = config.sectorCount();
                var sectorSize = 1 / sectorCount;
                for (var i = 0; i < sectorCount; i += 1) {
                    // var sectors = ['red', 'green', 'blue', 'orange', 'silver'].map(function(color, index) {
                    var label = String(i);
                    sectors.push({
                        sector: {
                            x: config.x,
                            y: config.y,
                            radius: config.radius,
                            // color: color,
                            // the start of the sector - the location in the circle to start it
                            // 0 -> 1
                            start: i * sectorSize,
                            // the central angle of the sector
                            // 0 -> 1
                            theta: sectorSize,
                            label: label
                        }
                    });
                }
            }
            updateSectors();

            config.sectorCount.subscribe(function(newValue) {
                updateSectors();
            });

            return {
                config: config,
                sectors: sectors,
                radials: {
                    kbase: {
                        x: config.x,
                        y: config.y,
                        angle: 0.23,
                        radialLength: 80,
                        fontFamily: config.fontFamily,
                        fontSize: config.fontSize,
                        label: 'Radial One',
                        color: 'orange'
                    },
                    community: {
                        x: config.x,
                        y: config.y,
                        angle: 0.37,
                        radialLength: 80,
                        fontFamily: config.fontFamily,
                        fontSize: config.fontSize,
                        label: 'Radial Two',
                        color: 'blue'
                    }
                },
                center: {
                    x: config.x,
                    y: config.y,
                    radius: 6,
                    color: 'black'
                }
            };
        }

        function render() {
            // Make a big frickin' structure...
            var vm = viewModel();

            var w = svg({
                id: 'mysvg',
                width: 300,
                height: 300,
                style: {
                    outline: '1px silver solid',
                    margin: '10px'
                }
            }, [
                '<!-- ko foreach: sectors -->',
                // vm.sectors.map(function(sector) { return buildSector(sector); }),
                komponent({
                    name: 'reske/svg/sector',
                    params: {
                        sector: 'sector'
                    }
                }),
                '<!-- /ko -->',
                '<!-- ko with: radials.kbase -->',
                komponent({
                    name: 'reske/svg/radial',
                    params: {
                        radial: 'radial'
                    }
                }),
                '<!-- /ko -->',
                '<!-- ko with: radials.community -->',
                komponent({
                    name: 'reske/svg/radial',
                    params: {
                        radial: 'radial'
                    }
                }),
                '<!-- /ko -->',
                // buildRadial(vm.radials.kbase, vm.config),
                // buildRadial(vm.radials.community, vm.config),
                komponent({
                    name: 'reske/svg/circle',
                    params: {
                        x: 'center.x',
                        y: 'center.y',
                        radius: 'center.radius',
                        color: 'center.color'
                    }
                })
            ]);

            container.innerHTML = div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6'
                    }, w),
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