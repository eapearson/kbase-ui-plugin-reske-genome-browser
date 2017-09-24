define([
    'knockout-plus',
    'kb_common/html'
], function (
    ko,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        p = t('p');

    function viewModel(params, componentInfo) {

        var search = params.searchVM;

        var height = ko.observable();
        height.subscribe(function (newValue) {
            search.availableRowHeight(newValue);
        });

        var resizerTimeout = 200;
        var resizerTimer = null;

        function calcHeight() {
            var tableHeight = componentInfo.element.querySelector('[name="table"]').clientHeight;
            // TODO: switch to getBoundingClientRect()
            var headerHeight = componentInfo.element.querySelector('[name="header"]').offsetHeight;

            return tableHeight - headerHeight;
        }

        function resizer() {
            if (resizerTimer) {
                return;
            }
            window.setTimeout(function () {
                resizerTimer = null;
                height(calcHeight());
            }, resizerTimeout);
        }
        window.addEventListener('resize', resizer, false);
        height(calcHeight());
        search.fetchingFeatures.subscribe(function (newValue) {
            if (newValue) {
                resizer();
            }
        });

        function doSelectFeature(data) {
            search.selectedFeature(data);
        }
        var selectedFeatureGuid = ko.pureComputed(function () {
            if (!search.selectedFeature()) {
                return null;
            }
            return search.selectedFeature().feature_guid;
        });
        return {
            doSelectFeature: doSelectFeature,
            selectedFeatureGuid: selectedFeatureGuid,
            search: search
        };
    }

    function buildHeader() {
        return div({
            class: 'kb-flex-table-header kb-flex-table-row',
            name: 'header'
        }, [
            div({
                style: {
                    flex: '3 3 30%',
                    fontWeight: 'bold'
                },
                class: 'kb-flex-table-cell'
            }, 'Gene'),
            div({
                style: {
                    flex: '1 1 10%',
                    fontWeight: 'bold'
                },
                class: 'kb-flex-table-cell'
            }, 'Distance'),
            div({
                style: {
                    flex: '3 3 30%',
                    fontWeight: 'bold'
                },
                class: 'kb-flex-table-cell'
            }, 'User term'),
            div({
                style: {
                    flex: '3 3 30%',
                    fontWeight: 'bold'
                },
                class: 'kb-flex-table-cell'
            }, 'Ortholog term'),
        ]);
    }

    function buildRow() {
        return div({
            dataBind: {
                click: '$component.doSelectFeature',
                css: {
                    '-selected': 'feature_guid === $component.selectedFeatureGuid()'
                }
            },
            class: 'kb-flex-table-row'
        }, [
            div({
                dataBind: {
                    text: 'feature_name'
                },
                class: 'kb-flex-table-cell',
                style: {
                    flex: '3 3 30%'
                },
            }),
            div({
                dataBind: {
                    numberText: 'distance',
                    numberFormat: '"0.00"'
                },
                class: 'kb-flex-table-cell',
                style: {
                    flex: '1 1 10%'
                }
            }),
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '3 3 30%'
                }
            }, [
                div({
                    style: {
                        flex: '1 1 0px',
                        height: '25px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    },
                    dataBind: {
                        text: 'reference_term_name'
                    }
                }),
                div({
                    dataBind: {
                        text: 'reference_term_guid'
                    },
                    style: {
                        flex: '1 1 0px',
                        height: '25px'
                    }
                })
            ]),
            div({
                class: 'kb-flex-table-cell',
                style: {
                    flex: '3 3 30%'
                }
            }, [
                div({
                    dataBind: {
                        text: 'kbase_term_name'
                    },
                    style: {
                        flex: '1 1 0px',
                        height: '25px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                }),
                div({
                    dataBind: {
                        text: 'kbase_term_guid'
                    },
                    style: {
                        flex: '1 1 0px',
                        height: '25px'
                    }
                })
            ]),
        ]);
    }

    function buildError() {
        return div({
            class: 'well danger',
            dataBind: {
                text: 'search.error().mesage'
            }
        });
    }

    function buildLoading() {
        return div({
            style: {
                // margin: '1em',
                textAlign: 'center',
                padding: '10px',
                backgroundColor: 'rgba(224, 224, 224, 0.5)',
                border: '1px rgba(224, 224, 224, 0.5) solid'
            }
        }, [
            p([
                'Loading genes...',
                html.loading()
            ])
        ]);
    }

    function template() {
        return div({
            class: 'reske_functional-profile_features_browser',
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            div({
                style: {
                    position: 'absolute',
                    top: '0',
                    right: '0'
                },
                dataBind: {
                    text: 'selectedFeatureGuid'
                }
            }),
            div({
                class: 'kb-flex-table',
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                },
                name: 'table'
            }, [
                buildHeader(),
                '<!-- ko if: search.fetchingFeatures -->',
                buildLoading(),
                '<!-- /ko -->',
                '<!-- ko ifnot: search.fetchingFeatures -->',
                div({
                    dataBind: {
                        foreach: 'search.features'
                    },
                    style: {
                        flex: '1 1 0px',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    name: 'features'
                }, buildRow()),
                '<!-- /ko -->',
                '<!-- ko if: search.error -->',
                buildError(),
                '<!-- /ko -->'
            ])
        ]);
        // var container = document.createElement('div');
        // container.innerHTML = markup;
        // return {
        //     element: container.children[0]
        // };
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