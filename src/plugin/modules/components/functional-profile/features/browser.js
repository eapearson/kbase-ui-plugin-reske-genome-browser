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
        span = t('span');

    function viewModel(params, componentInfo) {

        var vm = params.searchVM;

        var height = ko.observable();
        height.subscribe(function (newValue) {
            vm.availableRowHeight(newValue);
        });

        var resizerTimeout = 200;
        var resizerTimer = null;

        function resizer() {
            if (resizerTimer) {
                return;
            }
            window.setTimeout(function () {
                resizerTimer = null;
                height(componentInfo.element.querySelector('[name="features"]').clientHeight);
            }, resizerTimeout);
        }
        window.addEventListener('resize', resizer, false);
        // height(componentInfo.element.querySelector('[name="features"]').clientHeight);
        resizer();

        function doSelectFeature(data) {
            params.searchVM.selectedFeature(data);
        }
        var selectedFeatureGuid = ko.pureComputed(function () {
            if (!vm.selectedFeature()) {
                return null;
            }
            return vm.selectedFeature().feature_guid;
        });
        return {
            doSelectFeature: doSelectFeature,
            selectedFeatureGuid: selectedFeatureGuid,
            vm: vm
        };
    }

    function buildHeader() {
        return div({
            style: {
                borderBottom: '1px gray solid',
                height: '25px',
                // flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: 'silver',
                // color: 'white'
            }
        }, [
            div({
                style: {
                    flex: '3 3 30%',
                    // textAlign: 'center',
                    fontWeight: 'bold'
                }
            }, 'gene name'),
            div({
                style: {
                    flex: '1 1 10%',
                    // textAlign: 'center',
                    fontWeight: 'bold'
                }
            }, 'dist.'),
            div({
                style: {
                    flex: '3 3 30%',
                    // textAlign: 'center',
                    fontWeight: 'bold'
                }
            }, 'ref term'),
            div({
                style: {
                    flex: '3 3 30%',
                    // textAlign: 'center',
                    fontWeight: 'bold'
                }
            }, 'kbase term'),
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
            class: '-row',
            style: {
                borderBottom: '1px gray solid',
                height: '50px',
                // flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'row',
                overflowX: 'hidden',
                minWidth: '0'
            }
        }, [
            div({
                dataBind: {
                    text: 'feature_name'
                },
                style: {
                    flex: '3 3 30%'
                },
            }),
            div({
                dataBind: {
                    numberText: 'distance',
                    numberFormat: '"0.00"'
                },
                style: {
                    flex: '1 1 10%'
                }
            }),
            div({
                style: {
                    flex: '3 3 30%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    minWidth: '0'
                }
            }, [
                div({
                    style: {
                        flex: '1 1 auto',
                        height: '25px',
                        overflowX: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }
                }, span({
                    dataBind: {
                        text: 'reference_term_name'
                    }
                })),
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
                style: {
                    flex: '3 3 30%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowX: 'hidden',
                    minWidth: '0'
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

    function template() {
        return div({
            class: 'reske_functional-profile_features_browser',
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            buildHeader(),
            div({
                dataBind: {
                    foreach: 'vm.features'
                },
                style: {
                    flex: '1 1 0px',
                    display: 'flex',
                    flexDirection: 'column'
                },
                name: 'features'
            }, buildRow())
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