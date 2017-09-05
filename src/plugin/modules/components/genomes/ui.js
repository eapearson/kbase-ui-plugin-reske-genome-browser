/*
    Overall UI for the RESKE Narrative Search
*/
define([
    'bluebird',
    'knockout-plus',
    'kb_common/html',
    'kb_common/jsonRpc/genericClient'
], function(
    Promise,
    ko,
    html,
    GenericClient
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function viewModel(params) {
        var runtime = params.runtime;

        // SEARCH INPUTS
        var searchInput = ko.observable();
        var page = ko.observable(0);
        var pageSize = ko.observable(10);

        // SEARCH OUTPUTS
        var genomes = ko.observableArray();
        var totalCount = ko.observable();
        var isSearching = ko.observable();

        // OUTPUT TO PARENT
        var fetchingGenomes = params.fetchingGenomes;
        var selectedGenome = params.selectedGenome;


        // SEARCH IMPLEMENTATION
        function fetchGenomes(arg) {
            var client = new GenericClient({
                url: runtime.config('services.reske.url'),
                module: 'KBaseRelationEngine',
                token: runtime.service('session').getAuthToken()
            });

            var startItem = arg.page * arg.pageSize;
            var pageSize = arg.pageSize;

            var filter = {
                object_type: 'genome',
                match_filter: {},
                pagination: {
                    start: startItem,
                    count: pageSize
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
                    with_public: 1,
                },
                // sorting_rules: sortingRules()
            };

            function guidToRef(guid) {
                var m = /^WS:(.*)$/.exec(guid);
                if (m) {
                    return m[1];
                }
            }

            return client.callFunc('search_objects', [filter])
                .spread(function(hits) {

                    // Here we modify each object result, essentially normalizing 
                    // some properties and adding ui-specific properties.
                    hits.objects.forEach(function(object, index) {
                        object.rowNumber = index + startItem;
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

        function updateGenomes() {
            fetchingGenomes(true);
            isSearching(true);
            return fetchGenomes({
                    page: page(),
                    pageSize: pageSize()
                })
                .then(function(genomeSearchResults) {
                    totalCount(genomeSearchResults.total);
                    genomes.removeAll();
                    genomeSearchResults.objects.forEach(function(genomeSearchResult) {
                        genomes.push(genomeSearchResult);
                    });
                    isSearching(false);
                    fetchingGenomes(false);
                });
        }

        function start() {
            return Promise.all([
                    updateGenomes()
                ])
                .spread(function() {})
                .error(function(err) {
                    console.error('ERROR syncing data', err);
                });
        }

        start();

        // TODO: should not need to do this here.
        // How to best wire this together?
        // TODO: at least unsubscribe.
        page.subscribe(function(newValue) {
            updateGenomes();
        });
        pageSize.subscribe(function(newValue) {
            updateGenomes();
        });

        return {
            // search inputs
            searchVM: {
                // these need to match the generic controls
                searchInput: searchInput,
                page: page,
                pageSize: pageSize,
                totalCount: totalCount,
                // this needs to match the results template
                genomes: genomes,
                // For ui feedback
                isSearching: isSearching,
                // This is from the parent environment.
                selectedGenome: selectedGenome
            },
            searchResultsTemplate: 'reske/genome-browser/genomes/browser'
        };
    }

    function template() {
        return div({}, [
            // div([
            //     div({
            //         dataBind: {
            //             component: {
            //                 name: '"reske/genome-browser/search/controls"',
            //                 params: {
            //                     searchVM: 'searchVM',
            //                     searchResultsTemplate: 'searchResultsTemplate'
            //                 }
            //             }
            //         }
            //     })
            // ]),
            div([
                div({
                    dataBind: {
                        component: {
                            name: '"reske/genome-browser/search/browser"',
                            params: {
                                searchVM: 'searchVM',
                                searchResultsTemplate: 'searchResultsTemplate'
                            }
                        }
                    }
                })
            ])
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});