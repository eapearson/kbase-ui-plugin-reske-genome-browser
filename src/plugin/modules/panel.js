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
        h3 = t('h3'),
        a = t('a'),
        p = t('p');

    function factory(config) {
        var runtime = config.runtime,
            hostNode, container;

        var vm;

        var dsClient = new DynamicServiceClient({
            url: runtime.config('services.service_wizard.url'),
            token: runtime.service('session').getAuthToken(),
            module: 'GeneOntologyDecorator'
        });

        var workspaceClient = new GenericClient({
            url: runtime.config('services.workspace.url'),
            token: runtime.service('session').getAuthToken(),
            module: 'Workspace'
        });

        function viewModel() {

            // CORE DATA FETCHING 
            function guidToRef(guid) {
                var m = /^WS:(.*)$/.exec(guid);
                if (m) {
                    return m[1];
                }
            }

            function fetchGenomes2(param) {
                var client = new GenericClient({
                    url: runtime.config('services.reske.url'),
                    module: 'KBaseRelationEngine',
                    token: runtime.service('session').getAuthToken()
                });

                var filter = {
                    object_type: 'genome',
                    match_filter: {},
                    pagination: {
                        // start: pageStart() || 0,
                        // count: pageSize.parsed
                        start: 0,
                        count: 10
                    },
                    post_processing: {
                        ids_only: 0,
                        skip_info: 0,
                        skip_keys: 0,
                        skip_data: 0
                    },
                    access_filter: {
                        // with_private: searchPrivateData() ? 1 : 0,
                        // with_public: searchPublicData() ? 1 : 0
                        with_private: 1,
                        with_public: 0,
                    },
                    // sorting_rules: sortingRules()
                };


                // var filter = {
                //     object_type: 'genome',
                //     match_filter: {
                //         full_text_in_all: null,
                //         lookupInKeys: {}
                //     }
                // };
                return client.callFunc('search_objects', [filter])
                    .spread(function(hits) {

                        // Here we modify each object result, essentially normalizing 
                        // some properties and adding ui-specific properties.
                        hits.objects.forEach(function(object) {
                            object.datestring = new Date(object.timestamp).toLocaleString();
                            object.dataList = Object.keys(object.data || {}).map(function(key) {
                                return {
                                    key: key,
                                    type: typeof object.data[key],
                                    value: object.data[key]
                                };
                            });
                            object.parentDataList = Object.keys(object.parent_data || {}).map(function(key) {
                                return {
                                    key: key,
                                    type: typeof object.data[key],
                                    value: object.data[key]
                                };
                            });
                            object.keyList = Object.keys(object.key_props || {}).map(function(key) {
                                return {
                                    key: key,
                                    type: typeof object.key_props[key],
                                    value: object.key_props[key]
                                };
                            });
                            object.ref = guidToRef(object.guid);
                        });
                        return hits;
                    });
            }

            function fetchGenomes() {
                return workspaceClient.callFunc('list_workspace_info', [{
                        excludeGlobal: 1
                    }])
                    .spread(function(workspaces) {
                        var workspaceIds = workspaces.map(function(wsInfo) {
                            return wsInfo[0];
                        });
                        return workspaceClient.callFunc('list_objects', [{
                            ids: workspaceIds,
                            type: 'KBaseGenomes.Genome',
                            includeMetadata: 1,
                            excludeGlobal: 1
                        }]);
                    })
                    .spread(function(genomeObjects) {
                        return genomeObjects;
                    });
            }



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
            var fetchingGenomes = ko.observable(false);
            var genomes = ko.observableArray();

            function updateGenomes() {
                fetchingGenomes(true);
                return fetchGenomes2()
                    .then(function(genomeSearchResults) {
                        genomeSearchResults.objects.forEach(function(genomeSearchResult) {
                            genomes.push(genomeSearchResult);
                        });
                        fetchingGenomes(false);
                    });
            }

            // Features
            var selectedGenome = ko.observable();
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
                                distance: numeral(feature.distance).format('0.00')
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
                updateFeatures();
            });

            selectedFeature.subscribe(function(newFeature) {
                updateTermRelations();
            });

            function syncData() {
                return Promise.all([
                        updateGenomes()
                    ])
                    .spread(function() {})
                    .error(function(err) {
                        console.error('ERROR syncing data', err);
                    });

            }

            syncData();

            return {
                fetchingGenomes: fetchingGenomes,
                genomes: genomes,
                selectedGenome: selectedGenome,
                fetchingFeatures: fetchingFeatures,
                features: features,
                selectedFeature: selectedFeature,
                fetchingTermRelations: fetchingTermRelations,
                termRelations: termRelations
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
                        p([
                            'Genome, gene, and predictions browser. ',
                            'You will need to stretch your browser wide as you can go. ',
                            'Not sure of the shape of the final demo, but the next idea to try is to horizontally collapse the genomes and features ',
                            'columns after an item is selected, providing a toggle to open them up for selection. ',
                            'The main point of this version of this page is to generate data to test out the widget prototype.'
                        ]),
                        p([
                            'Genomes are pulled from RESKE search, so you need to have at least one genome indexed for this to work. ',
                            'Selecting a genome triggers the features (genes) to appear. The features are not related to the genome (yet.)'
                        ]),
                        p([
                            'The features are pulled via the RESKE listFeatures method. The display is just a quick implementation of the first 10 items. ',
                            'Just enough to be able to trigger the next step. In the next day or so this will be fleshed out into paging table, and show all the columns. At some point after that the service will support paging (at present the front end pulls in 4000+'
                        ])
                    ]),
                    div({
                        class: 'col-sm-6'
                    }),
                ]),
                div({
                    class: 'row'
                }, [
                    div({
                        class: 'col-sm-2'
                    }, [
                        h3('List Genomes'),
                        div({
                            dataBind: {
                                component: {
                                    name: '"reske/gene-term/genomes-browser"',
                                    params: {
                                        vm: 'vm'
                                    }
                                }
                            }
                        })
                    ]),
                    div({
                        class: 'col-sm-3'
                    }, [
                        h3('List Features'),
                        div({
                            dataBind: {
                                component: {
                                    name: '"reske/gene-term/features-browser"',
                                    params: {
                                        vm: 'vm'
                                    }
                                }
                            }
                        })
                    ]),
                    div({
                        class: 'col-sm-3'
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
                        class: 'col-sm-4'
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
                    ])
                ])
            ]);
            ko.applyBindings({ vm: vm }, container);
        }

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
        }

        function start(params) {
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