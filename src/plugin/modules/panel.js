define([
    'bluebird',
    'kb_common/html',
    'knockout-plus',
    'numeral',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/dynamicServiceClient',
    'kb_service/utils'
], function(
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
        h3 = t('h3'),
        a = t('a'),
        button = t('button'),
        p = t('p'),
        table = t('table'),
        tr = t('tr'),
        th = t('th'),
        td = t('td');

    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;

        var vm;

        var dsClient = new DynamicServiceClient({
            url: runtime.config('services.service_wizard.url'),
            token: runtime.service('session').getAuthToken(),
            module: 'GeneOntologyDecorator'
        });

        // var workspaceClient = new GenericClient({
        //     url: runtime.config('services.workspace.url'),
        //     token: runtime.service('session').getAuthToken(),
        //     module: 'Workspace'
        // });



        function viewModel() {

            // CORE DATA FETCHING 




            // function fetchGenomes() {
            //     return workspaceClient.callFunc('list_workspace_info', [{
            //             excludeGlobal: 1
            //         }])
            //         .spread(function(workspaces) {
            //             var workspaceIds = workspaces.map(function(wsInfo) {
            //                 return wsInfo[0];
            //             });
            //             return workspaceClient.callFunc('list_objects', [{
            //                 ids: workspaceIds,
            //                 type: 'KBaseGenomes.Genome',
            //                 includeMetadata: 1,
            //                 excludeGlobal: 1
            //             }]);
            //         })
            //         .spread(function(genomeObjects) {
            //             return genomeObjects;
            //         });
            // }



            function fetchFeatures() {
                return dsClient.callFunc('listFeatures', [{
                        genome_ref: selectedGenome().ref
                    }])
                    .spread(function(featuresList) {
                        return featuresList.slice(0, 10);
                    });
            }

            function fetchTermRelations() {
                return dsClient.callFunc('getTermRelations', [{
                        feature_id: selectedFeature().feature_id
                    }])
                    .spread(function(result) {
                        return result;
                    });
            }

            function fetchTermRelationTypes() {

            }

            // VIEW MODEL UPDATING FROM FETCHES

            // Genomes
            var selectedGenome = ko.observable();
            var fetchingGenomes = ko.observable();



            function doUnselectGenome() {
                selectedGenome(null);
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
                    .then(function(foundFeatures) {
                        features.removeAll();

                        foundFeatures.forEach(function(feature) {
                            feature.formatted = {
                                distance: numeral(feature.distance).format('0.00'),
                            };
                            features.push(feature);
                        });
                        fetchingFeatures(false);
                    });
            }

            // Term Relations
            var termRelations = ko.observable();
            var fetchingTermRelations = ko.observable(false);

            function updateTermRelations() {
                fetchingTermRelations(true);
                fetchTermRelations()
                    .then(function(fetchedTermRelations) {
                        termRelations(fetchedTermRelations);
                    });
            }


            // Subscriptions

            selectedGenome.subscribe(function(newValue) {
                if (newValue) {
                    updateFeatures();
                }
            });

            selectedFeature.subscribe(function(newFeature) {
                if (newFeature) {
                    updateTermRelations();
                }
            });

            // Layout control

            var layout = {
                genomes: {
                    collapsed: ko.observable(false),
                    active: ko.observable(true),
                    width: ko.observable()
                },
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

            function toggleGenomesColumn() {
                layout.genomes.collapsed(layout.genomes.collapsed() ? false : true);
            }

            function toggleFeaturesColumn() {
                layout.features.collapsed(layout.features.collapsed() ? false : true);
            }

            selectedGenome.subscribe(function(newValue) {
                selectedFeature(null);
                if (newValue) {
                    layout.genomes.collapsed(true);
                    layout.features.collapsed(false);
                    layout.relations.collapsed(true);
                }
            });

            selectedFeature.subscribe(function(newValue) {
                if (newValue) {
                    layout.features.collapsed(true);
                    layout.genomes.collapsed(true);
                    layout.relations.collapsed(false);
                }
            });

            // Main entry point



            return {
                runtime: runtime,

                fetchingGenomes: fetchingGenomes,
                selectedGenome: selectedGenome,
                fetchingFeatures: fetchingFeatures,
                features: features,
                selectedFeature: selectedFeature,
                fetchingTermRelations: fetchingTermRelations,
                termRelations: termRelations,
                layout: layout,
                toggleGenomesColumn: toggleGenomesColumn,
                toggleFeaturesColumn: toggleFeaturesColumn,

                // ACTIONS
                doUnselectGenome: doUnselectGenome,
                doUnselectFeature: doUnselectFeature
            };
        }

        function render() {
            container.innerHTML = div({
                class: 'container-fluid'
            }, [
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-6'
                    }, [
                        // p([
                        //     'The genome viewer prototyping tool will go here.'
                        // ]),
                        // p([
                        //     'You can also check out the old ',
                        //     a({
                        //         href: '#reske/gene-term-tester'
                        //     }, 'widget testing page'),
                        //     ' testing page. This never fleshed out '
                        // ])
                        // p([
                        //     'Genome, gene, and predictions browser. ',
                        //     'You will need to stretch your browser wide as you can go. ',
                        //     'Not sure of the shape of the final demo, but the next idea to try is to horizontally collapse the genomes and features ',
                        //     'columns after an item is selected, providing a toggle to open them up for selection. ',
                        //     'The main point of this version of this page is to generate data to test out the widget prototype.'
                        // ]),
                        // p([
                        //     'Genomes are pulled from RESKE search, so you need to have at least one genome indexed for this to work. ',
                        //     'Selecting a genome triggers the features (genes) to appear. The features are not related to the genome (yet.)'
                        // ]),
                        // p([
                        //     'The features are pulled via the RESKE listFeatures method. The display is just a quick implementation of the first 10 items. ',
                        //     'Just enough to be able to trigger the next step. In the next day or so this will be fleshed out into paging table, and show all the columns. At some point after that the service will support paging (at present the front end pulls in 4000+'
                        // ])
                    ]),
                    div({
                        class: 'col-sm-6'
                    }),
                ]),
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-3',
                    }, [
                        div({
                            class: 'well',
                        }, [
                            '<!-- ko if: vm.selectedGenome() -->',
                            div({
                                dataBind: {
                                    with: 'vm.selectedGenome'
                                }
                            }, [
                                div({
                                    style: {
                                        fontWeight: 'bold',
                                        color: '#FFF',
                                        backgroundColor: '#777',
                                        padding: '4px',
                                        marginBottom: '4px',
                                        textAlign: 'center'
                                    }
                                }, [
                                    'Selected Genome'
                                ]),
                                div([
                                    span({
                                        dataBind: {
                                            text: 'data.domain'
                                        }
                                    })
                                ]),
                                div([
                                    span({
                                        dataBind: {
                                            text: 'data.scientific_name'
                                        },
                                        style: {
                                            fontStyle: 'italic'
                                        }
                                    })
                                ]),
                                table({
                                    class: 'table',
                                    style: {
                                        marginTop: '6px'
                                    }
                                }, [
                                    tr([
                                        th('ID'),
                                        td({
                                            dataBind: {
                                                text: 'data.id'
                                            }
                                        })
                                    ]),
                                    tr([
                                        th('# Features'),
                                        td({
                                            dataBind: {
                                                text: 'data.features'
                                            }
                                        })
                                    ])
                                ]),
                                button({
                                    class: 'btn btn-default',
                                    dataBind: {
                                        click: '$root.vm.doUnselectGenome'
                                    }
                                }, 'Clear &amp; Select Genome')
                            ]),
                            '<!-- /ko -->',
                            '<!-- ko if: !vm.selectedGenome() -->',
                            'select a genome',
                            '<!-- /ko -->'
                        ]),
                        div({
                            class: 'well',
                        }, [
                            '<!-- ko if: vm.selectedFeature() -->',
                            div({
                                dataBind: {
                                    with: 'vm.selectedFeature'
                                }
                            }, [
                                div({
                                    style: {
                                        fontWeight: 'bold',
                                        color: '#FFF',
                                        backgroundColor: '#777',
                                        padding: '4px',
                                        marginBottom: '4px',
                                        textAlign: 'center'
                                    }
                                }, [
                                    'Selected Feature'
                                ]),
                                table({
                                    class: 'table'
                                }, [
                                    tr([
                                        th('Id'),
                                        td({
                                            dataBind: {
                                                text: 'feature_id'
                                            }
                                        })
                                    ]),
                                    tr([
                                        th('Name'),
                                        td({
                                            dataBind: {
                                                text: 'feature_name'
                                            }
                                        })
                                    ]),
                                    tr([
                                        th('Distance'),
                                        td({
                                            dataBind: {
                                                text: 'formatted.distance'
                                            }
                                        })
                                    ]),
                                    tr([
                                        th('Community'),
                                        td([
                                            div({
                                                dataBind: {
                                                    text: 'community_term_name'
                                                }
                                            }),
                                            div({
                                                dataBind: {
                                                    text: 'community_term_id'
                                                },
                                                style: {
                                                    fontStyle: 'italic'
                                                }
                                            })
                                        ])
                                    ]),
                                    tr([
                                        th('KBase'),
                                        td([
                                            div({
                                                dataBind: {
                                                    text: 'kbase_term_name'
                                                }
                                            }),
                                            div({
                                                dataBind: {
                                                    text: 'kbase_term_id'
                                                },
                                                style: {
                                                    fontStyle: 'italic'
                                                }
                                            })
                                        ])
                                    ])
                                ]),
                                button({
                                    class: 'btn btn-default',
                                    dataBind: {
                                        click: '$root.vm.doUnselectFeature'
                                    }
                                }, 'Clear &amp; Select Feature')
                            ]),
                            '<!-- /ko -->',
                            '<!-- ko if: vm.selectedGenome() && !vm.selectedFeature() -->',
                            'select a feature',
                            '<!-- /ko -->'
                        ]),
                    ]),
                    '<!-- ko if: !vm.selectedGenome() -->',
                    div({
                        class: 'col-sm-9',
                        // dataBind: {
                        //     style: {
                        //         width: 'vm.layout.genomes.collapsed() ? "50px" : null ',
                        //         'overflow-x': 'vm.layout.genomes.collapsed() ? "hidden" : null'
                        //     }
                        // }
                    }, [
                        h3('Genomes'),
                        p([
                            'Select a genome to explore.'
                        ]),

                        div({
                            dataBind: {
                                component: {
                                    name: '"reske/genome-browser/genomes/ui"',
                                    params: {
                                        runtime: 'vm.runtime',
                                        selectedGenome: 'vm.selectedGenome',
                                        fetchingGenomes: 'vm.fetchingGenomes'
                                    }
                                }
                            }
                        })
                    ]),
                    '<!-- /ko -->',
                    '<!-- ko if: vm.selectedGenome() && !vm.selectedFeature()-->',
                    div({
                        class: 'col-sm-9'
                    }, [
                        h3('List Features'),
                        p('Select a feature'),
                        div({
                            dataBind: {
                                component: {
                                    name: '"reske/genome-browser/features/ui"',
                                    params: {
                                        runtime: 'vm.runtime',
                                        selectedGenome: 'vm.selectedGenome',
                                        selectedFeature: 'vm.selectedFeature',
                                        fetchingFeatures: 'vm.fetchingFeatures'
                                    }
                                }
                            }
                        })
                    ]),
                    '<!-- /ko -->',
                    '<!-- ko if: vm.selectedGenome() && vm.selectedFeature()-->',
                    div({
                        class: 'col-sm-4',
                        dataBind: {
                            style: {
                                width: 'vm.layout.relations.collapsed() ? "50px" : null ',
                                'overflow-x': 'vm.layout.relations.collapsed() ? "hidden" : null'
                            }
                        }
                    }, [
                        h3('Term Relations'),
                        div({
                            dataBind: {
                                component: {
                                    name: '"reske/gene-term/term-relations-viewer"',
                                    params: {
                                        vm: 'vm'
                                    }
                                }
                            }
                        })
                    ]), div({
                        class: 'col-sm-5',
                        dataBind: {
                            style: {
                                width: 'vm.layout.relations.collapsed() ? "50px" : null ',
                                'overflow-x': 'vm.layout.relations.collapsed() ? "hidden" : null'
                            }
                        }
                    }, [
                        h3('Widget'),
                        '<!-- ko if: vm.termRelations() && vm.termRelations().length > 0 -->',
                        div({
                            dataBind: {
                                component: {
                                    name: '"reske/gene-term/term-comparison-viewer"',
                                    params: {
                                        vm: 'vm'
                                    }
                                }
                            }
                        }),
                        '<!-- /ko -->',
                        '<!-- ko if: !(vm.termRelations() && vm.termRelations().length > 0) -->',
                        'choose a term to show the viewer',
                        '<!-- /ko -->'
                    ]),
                    '<!-- /ko -->'
                ])
            ]);
            ko.applyBindings({ vm: vm }, container);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
            runtime.send('ui', 'setTitle', 'RESKE Gene Function Comparison Tool');
            vm = viewModel();
            render();
        }

        function stop() {

        }

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