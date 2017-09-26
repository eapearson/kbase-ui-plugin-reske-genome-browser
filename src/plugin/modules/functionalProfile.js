define([
    'bluebird',
    'kb_common/html',
    'knockout-plus',
    'numeral',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/dynamicServiceClient',
    'kb_service/utils'
], function (
    Promise,
    html,
    ko,
    numeral,
    GenericClient,
    DynamicServiceClient,
    serviceUtils
) {
    'use string';

    var t = html.tag,
        div = t('div'),
        span = t('span'),
        button = t('button'),
        h2 = t('h2'),
        h3 = t('h3');

    function calcScalex(value, scaleMin, scaleMax) {
        // min and max are -ish
        function log(v) {
            // return Math.log(v) / Math.log(4);
            return Math.log10(v);
        }
        var max = Math.abs(log(scaleMin));
        var min = Math.abs(log(scaleMax));
        var range = Math.abs(max - min);
        var val = Math.abs(log(value));
        var val2 = Math.abs(log(scaleMax) - log(value));
        if (val > max) {
            return 1;
        }
        if (val < min) {
            return 0;
        }
        // var scaled = Math.abs(val / max);
        var scaled = (val - min) / range;
        return scaled;
    }

    function calcScale(value) {
        if (value <= 0.0001) {
            return 1;
        }
        if (value <= 0.001) {
            return 0.8;
        }
        if (value <= 0.01) {
            return 0.6;
        }
        if (value <= 0.05) {
            return 0.4;
        }
        return 0.2;
    }

    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;

        var vm;

        var geneOntologyDecorator = new DynamicServiceClient({
            url: runtime.config('services.service_wizard.url'),
            token: runtime.service('session').getAuthToken(),
            module: 'GeneOntologyDecorator'
        });

        var widgetConfig = {
            width: 200,
            height: 110,
            scale: 1.5,
            x: 100,
            y: 100,
            fontFamily: 'sans serif',
            fontSize: 11,
            radius: 50,
            minRadius: 50,
            radialLength: 70,
            ringWidth: 10,
            sectorCount: ko.observable(5),
            tickTheta: 0.05,
            tickLength: 6, // in pixels
            ringLayout: ['kbase', 'fitness', 'expression'],
            leftMargin: 10,
            goConfig: {
                reference: {
                    label: 'Ref',
                    // black
                    color: [0, 0, 0],
                },
                kbase: {
                    label: 'Kbase',
                    // orange
                    color: [249, 124, 0]
                },
                fitness: {
                    label: 'Fitness',
                    // green
                    color: [33, 140, 56]
                },
                expression: {
                    label: 'Expression',
                    // purple
                    color: [130, 61, 142]
                }
            }
        };

        function viewModel(params) {
            // CORE DATA FETCHING 

            function fetchFeatures() {
                return geneOntologyDecorator.callFunc('listFeatures', [{
                        genome_ref: selectedGenome().ref
                    }])
                    .spread(function (featuresList) {
                        return featuresList.slice(0, 10);
                    });
            }

            function fetchTermRelations() {
                return geneOntologyDecorator.callFunc('getTermRelations', [{
                        feature_guid: selectedFeature().feature_guid
                    }])
                    .spread(function (result) {
                        return result;
                    });
            }

            // VIEW MODEL UPDATING FROM FETCHES

            // Genomes
            var selectedGenome = ko.observable({
                ref: params.ref
            });

            var genome = {
                ref: params.ref,
                name: params.genomeInfo.metadata.Name
            };

            function doViewGenome(data) {
                window.open('#dataview/' + data.ref);
            }

            function doUnselectFeature() {
                selectedFeature(null);
            }

            // Features
            var fetchingFeatures = ko.observable(false);
            var features = ko.observableArray();
            var selectedFeature = ko.observable();


            function updateFeatures() {
                fetchingFeatures(true);
                fetchFeatures()
                    .then(function (foundFeatures) {
                        features.removeAll();

                        foundFeatures.forEach(function (feature) {
                            features.push(feature);
                            // We could simply copy the results, but we'll just enhance it with some
                            // controls.

                        });
                        fetchingFeatures(false);
                    });
            }



            // Term Relations
            var termRelations = ko.observable();
            var fetchingTermRelations = ko.observable(false);

            function makeColor(rgbColor, alpha) {
                return 'rgba(' + rgbColor.join(',') + ',' + alpha + ')';
            }

            function updateTermRelations() {
                fetchingTermRelations(true);
                fetchTermRelations()
                    .then(function (fetchedTermRelations) {
                        // console.log('TERMS', fetchedTermRelations);
                        Object.keys(fetchedTermRelations).forEach(function (typeName) {
                            var relationType = fetchedTermRelations[typeName];
                            var typeConfig = widgetConfig.goConfig[typeName];

                            // remove terms for kbase/orthologs -- we don't want to show them amy more.
                            if (typeName === 'kbase') {
                                relationType.terms = relationType.terms.slice(0, 1);
                            }

                            relationType.terms = relationType.terms
                                .map(function (term) {
                                    // filter out bad terms.
                                    if (term.term_position === 'Infinity') {
                                        console.warn('term with infinity position omitted for ' + typeName, term);
                                        return;
                                    }
                                    // if (term.term_position > 1) {
                                    //     console.warn('term with position > 1 truncated to 1 for ' + typeName, term);
                                    //     term.term_position = 1;
                                    // }
                                    term.best = (term.term_guid === relationType.best_term.term_guid);
                                    // var alpha = 1 - Math.pow(term.pvalue, 1 / 5);
                                    //var log = Math.abs(Math.log(term.pvalue) / Math.log(4));
                                    // var alpha = Math.min(log, 10) / 10;
                                    var alpha = calcScale(term.pvalue, 0.0001, 0.1);
                                    term.alpha = alpha;
                                    term.color = makeColor(typeConfig.color, alpha);
                                    return term;
                                })
                                .filter(function (term) {
                                    return term ? true : false;
                                })
                                .sort(function (a, b) {
                                    return a.pvalue - b.pvalue;
                                });

                        });

                        termRelations(fetchedTermRelations);
                    })
                    .catch(function (err) {
                        console.error('ERROR fetching term relations', err);
                        // TODO: handle!
                    })
                    .finally(function () {
                        fetchingTermRelations(false);
                    });
            }

            function clearTermRelations() {
                termRelations(null);
            }

            // Subscriptions

            selectedGenome.subscribe(function (newValue) {
                if (newValue) {
                    updateFeatures();
                }
            });

            selectedFeature.subscribe(function (newFeature) {
                if (newFeature) {
                    updateTermRelations();
                } else {
                    clearTermRelations();
                }
            });

            // Layout control

            var layout = {
                features: {
                    collapsed: ko.observable(true),
                    active: ko.observable(false),
                    width: ko.observable()
                },
                relations: {
                    collapsed: ko.observable(true)
                },
                widget: {
                    collapsed: ko.observable(true)
                }
            };

            selectedGenome.subscribe(function (newValue) {
                selectedFeature(null);
                if (newValue) {
                    layout.features.collapsed(false);
                    layout.relations.collapsed(true);
                }
            });

            selectedFeature.subscribe(function (newValue) {
                if (newValue) {
                    layout.features.collapsed(true);
                    layout.relations.collapsed(false);
                }
            });

            // Main entry point

            return {
                runtime: runtime,

                selectedGenome: selectedGenome,
                fetchingFeatures: fetchingFeatures,
                features: features,
                selectedFeature: selectedFeature,
                fetchingTermRelations: fetchingTermRelations,
                termRelations: termRelations,
                layout: layout,

                genome: genome,
                doViewGenome: doViewGenome,

                // LEGACY, for now
                // But there is some value in the top level vm being passed through as a single
                // property...
                vm: {
                    termRelations: termRelations,
                    fetchingTermRelations: fetchingTermRelations
                },

                // ACTIONS
                doUnselectFeature: doUnselectFeature
            };
        }

        function komponent(componentDef) {
            return '<!-- ko component: {name: "' + componentDef.name +
                '", params: {' +
                Object.keys(componentDef.params).map(function (key) {
                    return key + ':' + componentDef.params[key];
                }).join(',') + '}}--><!-- /ko -->';
        }

        function render() {
            container.innerHTML = div({
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [
                div({
                    style: {
                        flex: '0 0 2em',
                        paddingLeft: '4px'
                    }
                }, [
                    '<!-- ko with: genome -->',
                    h2({
                        dataBind: {
                            text: 'name'
                        },
                        style: {
                            display: 'inline-block'
                        }
                    }),
                    div({
                        style: {
                            display: 'inline-block'
                        }
                    }, button({
                        dataBind: {
                            click: '$parent.doViewGenome'
                        },
                        class: 'btn btn-default btn-flat'
                    }, span({
                        class: 'fa fa-binoculars'
                    }))),
                    '<!-- /ko -->'
                ]),
                div({
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        fiexDirection: 'column'
                    }
                }, [
                    // the genes column
                    div({
                        style: {

                            flex: '1 1 0px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowX: 'hidden'
                        }
                    }, [
                        div({
                            style: {
                                flex: '0 0 50px'
                            }
                        }, h3({
                            style: {
                                textAlign: 'center'
                            }
                        }, 'Genes')),
                        div({
                            style: {
                                flex: '1 1 0px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflowX: 'hidden'
                            }
                        }, komponent({
                            name: 'reske/functional-profile/features/ui',
                            params: {
                                runtime: 'runtime',
                                selectedGenome: 'selectedGenome',
                                selectedFeature: 'selectedFeature',
                                fetchingFeatures: 'fetchingFeatures'
                            }
                        }))

                    ]),
                    // the functional profile column
                    div({
                        style: {
                            flex: '1 1 0px',
                            display: 'flex',
                            flexDirection: 'column'
                        }
                    }, [
                        div({
                            style: {
                                width: '100%',
                                flex: '0 0 50px'
                            }
                        }, h3({
                            style: {
                                textAlign: 'center'
                            }
                        }, 'Functional Profile')),
                        div({
                            style: {
                                width: '100%',
                                flex: '1 1 0px',
                                overflowY: 'auto'
                            }
                        }, komponent({
                            name: 'reske/functional-profile/distance-widget',
                            params: {
                                runtime: 'runtime',
                                vm: 'vm'
                            }
                        }))

                        // div({
                        //     dataBind: {
                        //         component: {
                        //             name: '"reske/functional-profile/distance-widget"',
                        //             params: {
                        //                 runtime: 'runtime',
                        //                 vm: 'vm'
                        //             }
                        //         }
                        //     }
                        // }))
                    ])
                ])
            ]);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.style.flex = '1 1 0px';
            container.style.display = 'flex';
            container.style['flex-direction'] = 'column';
            // container.style['overflow-y'] = 'auto';
        }

        function start(params) {
            runtime.send('ui', 'setTitle', 'Knowledge Engine Functional Profile Viewer');
            var ref = params.ref;
            var client = new GenericClient({
                url: runtime.config('services.workspace.url'),
                token: runtime.service('session').getAuthToken(),
                module: 'Workspace'
            });
            return client.callFunc('get_object_info3', [{
                    objects: [{
                        ref: ref
                    }],
                    includeMetadata: 1,
                    ignoreErrors: 0
                }])
                .spread(function (info) {
                    // console.log('got', info);
                    var objectInfo = serviceUtils.objectInfoToObject(info.infos[0]);
                    // console.log('genome info...', objectInfo);
                    vm = viewModel({
                        ref: ref,
                        genomeInfo: objectInfo
                    });
                    render();
                    ko.applyBindings(vm, container);
                });
        }

        function stop() {

        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});