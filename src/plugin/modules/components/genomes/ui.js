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

    function guidToRef(guid) {
        var m = /^WS:(.*)$/.exec(guid);
        if (m) {
            return m[1];
        }
    }

    function viewModel(params) {
        var runtime = params.runtime;

        // SEARCH INPUTS
        var searchInput = ko.observable().extend({
            throttle: 200,
            notifyWhenChangesStop: true
        });
        var page = ko.observable(0);
        var pageSize = ko.observable('10');
        var withPrivate = ko.observable(true);
        var withPublic = ko.observable(false);
        var sortingRules = ko.observableArray();

        // SEARCH OUTPUTS
        var searchResults = ko.observableArray();
        var totalCount = ko.observable();
        var isSearching = ko.observable();

        // OUTPUT TO PARENT
        var selectedGenome = params.selectedGenome;



        // SEARCH IMPLEMENTATION
        function fetchGenomes(arg) {
            var client = new GenericClient({
                url: runtime.config('services.reske.url'),
                module: 'KBaseRelationEngine',
                token: runtime.service('session').getAuthToken()
            });

            var startItem = arg.page * arg.pageSize;
            // TODO: add numeric conversion to pageSize.
            var pageSize = parseInt(arg.pageSize);

            var filter = {
                object_type: 'genome',
                match_filter: {
                    full_text_in_all: searchInput() || null
                },
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
                    with_private: withPrivate() ? 1 : 0,
                    with_public: withPublic() ? 1 : 0
                },
                sorting_rules: sortingRules()
            };

            console.log('searching with', filter);

            return client.callFunc('search_objects', [filter])
                .spread(function(hits) {
                    console.log('got', hits);
                    // Here we modify each object result, essentially normalizing 
                    // some properties and adding ui-specific properties.
                    // hits.objects.forEach(function(object, index) {
                    //     object.rowNumber = index + startItem;
                    //     object.datestring = new Date(object.timestamp).toLocaleString();
                    //     object.dataList = Object.keys(object.data || {}).map(function(key) {
                    //         return {
                    //             key: key,
                    //             type: typeof object.data[key],
                    //             value: object.data[key]
                    //         };
                    //     });
                    //     object.parentDataList = Object.keys(object.parent_data || {}).map(function(key) {
                    //         return {
                    //             key: key,
                    //             type: typeof object.data[key],
                    //             value: object.data[key]
                    //         };
                    //     });
                    //     object.keyList = Object.keys(object.key_props || {}).map(function(key) {
                    //         return {
                    //             key: key,
                    //             type: typeof object.key_props[key],
                    //             value: object.key_props[key]
                    //         };
                    //     });
                    //     object.ref = guidToRef(object.guid);
                    // });
                    return hits;
                });
        }

        function updateGenomes(source) {
            console.log('updating genoms from', source)
            isSearching(true);
            return fetchGenomes({
                    page: page(),
                    pageSize: pageSize()
                })
                .then(function(genomeSearchResult) {
                    totalCount(genomeSearchResult.total);
                    // console.log('got ', genomeSearchResult);
                    searchResults.removeAll();
                    genomeSearchResult.objects.forEach(function(hitObject, index) {
                        // normalize each result item. We omit anything we dont' need, and 
                        // ensure normalized names and values here.
                        var item = {
                            rowNumber: index + genomeSearchResult.pagination.start + 1,
                            domain: hitObject.data.domain,
                            scientificName: hitObject.data.scientific_name,
                            id: hitObject.data.id,
                            features: hitObject.data.features,
                            ref: guidToRef(hitObject.guid)
                        };

                        searchResults.push(item);
                    });
                    isSearching(false);
                });
        }

        function start() {
            return Promise.all([
                    updateGenomes('start')
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
        page.subscribe(function() {
            updateGenomes('page');
        });
        pageSize.subscribe(function() {
            updateGenomes('pageSize');
        });
        withPublic.subscribe(function() {
            updateGenomes('withPublic');
        });
        withPrivate.subscribe(function() {
            updateGenomes('withPrivate');
        });
        searchInput.subscribe(function() {
            updateGenomes('searchInput');
        });
        sortingRules.subscribe(function() {
            updateGenomes('sortingRules');
        });

        return {
            // search inputs
            searchVM: {
                // these need to match the generic controls
                searchInput: searchInput,
                page: page,
                pageSize: pageSize,
                totalCount: totalCount,
                withPrivate: withPrivate,
                withPublic: withPublic,
                // this needs to match the results template
                searchResults: searchResults,
                sortingRules: sortingRules,
                // For ui feedback
                isSearching: isSearching,
                // This is from the parent environment.
                selectedGenome: selectedGenome
            },
            searchResultsTemplate: 'reske/genome-browser/genomes/table'
        };
    }

    function template() {
        return div({
            class: 'component-reske-gene-prediction-genome-browser'
        }, [
            div([
                div({
                    dataBind: {
                        component: {
                            name: '"reske/genome-browser/genomes/controls"',
                            params: {
                                searchVM: 'searchVM',
                                searchResultsTemplate: 'searchResultsTemplate'
                            }
                        }
                    }
                })
            ]),
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