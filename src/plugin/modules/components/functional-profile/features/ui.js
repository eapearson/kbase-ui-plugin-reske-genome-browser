/*
    Overall UI for the RESKE Narrative Search
*/
define([
    'bluebird',
    'numeral',
    'knockout-plus',
    'kb_common/html',
    'kb_common/jsonRpc/dynamicServiceClient'
], function (
    Promise,
    numeral,
    ko,
    html,
    DynamicServiceClient
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function viewModel(params, componentInfo) {
        var runtime = params.runtime;

        // SEARCH INPUTS
        var selectedGenome = params.selectedGenome;
        var searchInput = ko.observable().extend({
            throttle: 200,
            notifyWhenChangesStop: true
        });
        var page = ko.observable(0);
        // var pageSize = ko.observable(10);

        var layout = {
            rowHeight: 50 // need to reflect this in the actual browser too
        };

        var availableRowHeight = ko.observable();
        availableRowHeight(600);

        var pageSize = ko.pureComputed(function () {
            var totalHeight = availableRowHeight();

            var rows = Math.floor(totalHeight / layout.rowHeight);
            return rows;
        });


        // SEARCH OUTPUTS
        var features = ko.observableArray();
        var totalCount = ko.observable();
        var firstItem = ko.observable();
        var lastItem = ko.observable();
        var isSearching = ko.observable();

        // OUTPUT TO PARENT
        var fetchingFeatures = params.fetchingFeatures;
        var selectedFeature = params.selectedFeature;

        var dsClient = new DynamicServiceClient({
            url: runtime.config('services.service_wizard.url'),
            token: runtime.service('session').getAuthToken(),
            module: 'GeneOntologyDecorator'
        });


        // SEARCH IMPLEMENTATION
        // simply caching...
        var cachedFeatures;

        function fetchFeatures() {
            return Promise.try(function () {
                    if (cachedFeatures) {
                        return cachedFeatures;
                    }
                    return dsClient.callFunc('listFeatures', [{
                            genome_ref: selectedGenome().ref
                        }])
                        .spread(function (featuresList) {
                            cachedFeatures = featuresList.map(function (item, index) {
                                item.rowNumber = index;
                                return item;
                            });
                            totalCount(cachedFeatures.length);
                            return cachedFeatures;
                        });
                })
                .then(function (features) {
                    // Fake filtering.
                    var filter = searchInput();
                    if (filter) {
                        isSearching(true);
                        // any substring.
                        var filterRe = new RegExp('.*' + filter + '.*', 'i');
                        features = features.filter(function (feature) {
                            return (filterRe.exec(feature.name) ||
                                filterRe.exec(feature.reference_term_name) ||
                                filterRe.exec(feature.kbase_term_name) |
                                filterRe.exec(feature.reference_term_guid) ||
                                filterRe.exec(feature.kbase_term_guid)
                            );
                        });
                    }

                    totalCount(features.length);
                    isSearching(false);

                    // Fake paging.
                    var start = page() * parseInt(pageSize());
                    var end = Math.min(start + parseInt(pageSize()), totalCount());

                    firstItem(start + 1);
                    lastItem(end);

                    return features.slice(start, end);
                });
        }

        function updateFeatures() {
            fetchingFeatures(true);
            isSearching(true);
            fetchFeatures()
                .then(function (foundFeatures) {
                    features.removeAll();
                    foundFeatures.forEach(function (feature) {
                        features.push(feature);
                    });
                    fetchingFeatures(false);
                    isSearching(false);
                });
        }

        function start() {
            return Promise.all([
                    updateFeatures()
                ])
                .spread(function () {})
                .error(function (err) {
                    console.error('ERROR syncing data', err);
                });
        }

        start();

        // TODO: should not need to do this here.
        // How to best wire this together?
        // TODO: at least unsubscribe.
        page.subscribe(function (newValue) {
            updateFeatures();
        });
        pageSize.subscribe(function (newValue) {
            updateFeatures();
        });

        searchInput.subscribe(function (newValue) {
            updateFeatures();
        });

        // New: get actual metrics from the viewport


        return {
            // search inputs
            searchVM: {
                // these need to match the generic controls
                searchInput: searchInput,
                page: page,
                pageSize: pageSize,
                totalCount: totalCount,
                firstItem: firstItem,
                lastItem: lastItem,
                // this needs to match the results template
                features: features,
                // For ui feedback
                isSearching: isSearching,
                // This is from the parent environment.
                selectedFeature: selectedFeature,

                availableRowHeight: availableRowHeight
            },
            searchResultsTemplate: 'reske/functional-profile/features/browser'
        };
    }

    function template() {
        return div({
            class: 'component-reske-gene-prediction-features-browser',
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            div({
                dataBind: {
                    component: {
                        name: '"reske/functional-profile/features/controls"',
                        params: {
                            searchVM: 'searchVM',
                            searchResultsTemplate: 'searchResultsTemplate'
                        }
                    }
                },
                class: 'component_reske_functional-profile_features_controls',
                style: {
                    // border: '1px silver solid',
                    flex: '0 0 25px',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }),
            div({
                dataBind: {
                    component: {
                        name: '"reske/functional-profile/features/browser"',
                        params: {
                            searchVM: 'searchVM',
                            searchResultsTemplate: 'searchResultsTemplate'
                        }
                    }
                },
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden'
                }
            })
        ]);

        //     div([
        //         div({
        //             dataBind: {
        //                 component: {
        //                     name: '"reske/functional-profile/features/controls"',
        //                     params: {
        //                         searchVM: 'searchVM',
        //                         searchResultsTemplate: 'searchResultsTemplate'
        //                     }
        //                 }
        //             }
        //         })
        //     ]),
        //     div([
        //         div({
        //             dataBind: {
        //                 component: {
        //                     name: '"reske/functional-profile/features/browser"',
        //                     params: {
        //                         searchVM: 'searchVM',
        //                         searchResultsTemplate: 'searchResultsTemplate'
        //                     }
        //                 }
        //             },
        //             name: 'reske/functional-profile/features/browser'
        //         })
        //     ])
        // ]);
    }

    function component() {
        return {
            viewModel: {
                createViewModel: viewModel
            },
            template: template()
        };
    }
    return component;
});