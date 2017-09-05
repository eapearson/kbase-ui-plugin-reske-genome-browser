/*
    Overall UI for the RESKE Narrative Search
*/
define([
    'bluebird',
    'numeral',
    'knockout-plus',
    'kb_common/html',
    'kb_common/jsonRpc/dynamicServiceClient'
], function(
    Promise,
    numeral,
    ko,
    html,
    DynamicServiceClient
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    function viewModel(params) {
        var runtime = params.runtime;

        // SEARCH INPUTS
        var selectedGenome = params.selectedGenome;
        var searchInput = ko.observable();
        var page = ko.observable(0);
        var pageSize = ko.observable(10);

        // SEARCH OUTPUTS
        var features = ko.observableArray();
        var totalCount = ko.observable();
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
            return Promise.try(function() {
                    if (cachedFeatures) {
                        return cachedFeatures;
                    }
                    return dsClient.callFunc('listFeatures', [{
                            genome_ref: selectedGenome().ref
                        }])
                        .spread(function(featuresList) {
                            cachedFeatures = featuresList.map(function(item, index) {
                                item.rowNumber = index;
                                return item;
                            });
                            totalCount(cachedFeatures.length);
                            return cachedFeatures;
                        });
                })
                .then(function(features) {
                    var start = page() * parseInt(pageSize());
                    var end = Math.min(start + parseInt(pageSize()), totalCount());
                    return features.slice(start, end);
                });
        }

        function updateFeatures() {
            fetchingFeatures(true);
            isSearching(true);
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

        function start() {
            return Promise.all([
                    updateFeatures()
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
            updateFeatures();
        });
        pageSize.subscribe(function(newValue) {
            updateFeatures();
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
                features: features,
                // For ui feedback
                isSearching: isSearching,
                // This is from the parent environment.
                selectedFeature: selectedFeature
            },
            searchResultsTemplate: 'reske/genome-browser/features/browser'
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