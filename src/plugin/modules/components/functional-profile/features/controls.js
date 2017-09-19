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
        button = t('button'),
        h2 = t('h2'),
        label = t('label'),
        span = t('span'),
        input = t('input');

    function viewModel(params) {

        var search = params.searchVM;

        var lastPage = ko.pureComputed(function () {
            return Math.floor(search.totalCount() / parseInt(search.pageSize()));
        });

        // PAGING
        function doFirstPage() {
            search.page(0);
        }

        var disableFirstPage = ko.pureComputed(function () {
            return (search.page() === 0);
        });

        function doLastPage() {
            search.page(lastPage());
        }

        var disableLastPage = ko.pureComputed(function () {
            if (typeof search.totalCount() !== 'number') {
                return true;
            }
            return search.page() === lastPage();
        });

        function doPrevPage() {
            if (search.page() > 0) {
                search.page(search.page() - 1);
            }
        }

        var disablePrevPage = ko.pureComputed(function () {
            return (search.page() === 0);
        });

        function doNextPage() {
            if (search.page() < lastPage()) {
                search.page(search.page() + 1);
            }
        }

        var disableNextPage = ko.pureComputed(function () {
            if (typeof search.totalCount() !== 'number') {
                return true;
            }
            return (search.page() === lastPage());
        });

        function doHelp() {
            alert('help!');
        }
        return {
            // TOP LEVEL VM
            search: search,

            // PAGING
            doFirstPage: doFirstPage,
            disableFirstPage: disableFirstPage,
            doLastPage: doLastPage,
            disableLastPage: disableLastPage,
            doPrevPage: doPrevPage,
            disablePrevPage: disablePrevPage,
            doNextPage: doNextPage,
            disableNextPage: disableNextPage,

            // ACTIONS
            doHelp: doHelp
        };
    }



    // function buildSearchInput() {
    //     return div({
    //         class: 'form'
    //     }, [
    //         div({
    //             class: 'input-group'
    //         }, [
    //             input({
    //                 dataBind: {
    //                     textInput: 'search.searchInput',
    //                     hasFocus: true
    //                 },
    //                 placeholder: 'Search for a gene by name, term name, or term id',
    //                 class: 'form-control'
    //             }),
    //             div({
    //                 class: 'input-group-addon',
    //                 style: {
    //                     cursor: 'pointer'
    //                 },
    //                 dataBind: {
    //                     click: 'search.doSearch'
    //                 }
    //             }, span({
    //                 class: 'fa fa-search',
    //                 style: {
    //                     fontSize: '125%'
    //                 },
    //                 dataBind: {
    //                     style: {
    //                         color: 'search.isSearching() ? "green" : "black"'
    //                     }
    //                 }
    //             })),
    //             div({
    //                 class: 'input-group-addon',
    //                 style: {
    //                     cursor: 'pointer'
    //                 },
    //                 dataBind: {
    //                     click: 'doHelp'
    //                 }
    //             }, span({
    //                 class: 'fa fa-info',
    //                 style: {
    //                     fontSize: '125%'
    //                 }
    //             }))
    //         ])
    //     ]);
    // }

    function buildNav() {
        return div({
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            }
        }, [
            button({
                dataBind: {
                    click: 'doFirstPage',
                    disable: 'disableFirstPage'
                },
                class: '-nav-btn',
                type: 'button'
            }, span({

                class: 'fa fa-step-backward',
                style: {
                    flex: '1 1 0px'
                }
            })),
            button({
                dataBind: {
                    click: 'doPrevPage',
                    disable: 'disablePrevPage'
                },
                class: '-nav-btn',
                type: 'button'
            }, span({

                class: 'fa fa-chevron-circle-left',
                style: {
                    flex: '1 1 0px'
                }
            })),
            button({
                dataBind: {
                    click: 'doNextPage',
                    disable: 'disableNextPage'
                },
                class: '-nav-btn',
                type: 'button'
            }, span({

                class: 'fa fa-chevron-circle-right',
                style: {
                    flex: '1 1 0px'
                }
            })),
            button({
                dataBind: {
                    click: 'doLastPage',
                    disable: 'disableLastPage'
                },
                class: '-nav-btn',
                type: 'button'
            }, span({

                class: 'fa fa-step-forward',
                style: {
                    flex: '1 1 0px'
                }
            })),
            span([
                span({

                }, span({
                    dataBind: {
                        numberText: 'search.firstItem',
                        numberFormat: '"0,0"'
                    }
                })),
                ' to ',
                span({
                    dataBind: {
                        numberText: 'search.lastItem',
                        numberFormat: '"0,0"'
                    }
                }),
                ' of ',
                span({
                    dataBind: {
                        numberText: 'search.totalCount',
                        numberFormat: '"0,0"'
                    }
                })
            ])
        ]);
    }

    function buildSearch() {
        return input({
            // class: 'form-control',
            dataBind: {
                textInput: 'search.searchInput',
                hasFocus: true
            },
            placeholder: 'Filter genes',
            style: {
                width: '100%',
                border: 'none',
                height: '23px'
            },

        });
    }

    function template() {
        return div({
            class: 'component_reske_functional-profile_features_controls',
            style: {
                // border: '1px silver solid',
                flex: '0 0 25px',
                display: 'flex',
                flexDirection: 'row'
            }
        }, [
            div({
                style: {
                    flex: '1 1 0px'
                }
            }, buildNav()),
            div({
                style: {
                    flex: '1 1 0px'
                }
            }, buildSearch()),
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