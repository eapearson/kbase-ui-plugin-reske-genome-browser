/*
search results browser
Simply through mainpulation of the paging variables (pageStart, pageSize) provides an
interface for paging through search results.
Incoming params:
searchVM - must include pageStart, pageSize, totalCount, and the search results to be 
  passed to the search results template
searchResultsTemplate - a string indicating the knockout component to display a page of
  search results; it must take a paramter named 'searchVM'.
*/
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
        span = t('span'),
        button = t('button'),
        label = t('label'),
        select = t('select');

    function viewModel(params) {

        // View (which way to view the results)
        // var views = [{
        //         name: 'list',
        //         label: 'List'
        //     },
        //     {
        //         name: 'detail',
        //         label: 'Detail'
        //     }
        // ];

        // var view = ko.observable('list');

        // function doSelectView(newView) {
        //     view(newView);
        // }

        // Paging through results
        var page = params.searchVM.page;
        var pageSize = params.searchVM.pageSize;
        var totalCount = params.searchVM.totalCount;

        var pageStart = ko.pureComputed(function () {
            var p = page();
            if (typeof p !== 'number') {
                console.error('page needs to be a number!', p);
            }
            return p * parseInt(pageSize());
        });

        var lastPage = ko.pureComputed(function () {
            return Math.floor(totalCount() / parseInt(pageSize()));
        });


        // For paging controls, which manipulate the paging variables
        // imported from the searchVM.
        var pageEnd = ko.pureComputed(function () {
            return Math.min(pageStart() + parseInt(pageSize()), totalCount()) - 1;
        });

        function doFirst() {
            page(0);
        }

        function disableFirst() {
            return (page() === 0);
        }

        function doLast() {
            page(lastPage());
        }

        function disableLast() {
            if (typeof totalCount() !== 'number') {
                return true;
            }
            return page() === lastPage();
        }

        function doPrevPage() {
            if (page() > 0) {
                page(page() - 1);
            }
        }

        function disablePrevPage() {
            return (page() === 0);
        }

        function doNextPage() {
            if (page() < lastPage()) {
                page(page() + 1);
            }
        }

        function disableNextPage() {
            if (typeof totalCount() !== 'number') {
                return true;
            }
            return (page() === lastPage());
        }

        var pageSizes = [5, 10, 20, 50, 100].map(function (value) {
            return {
                label: String(value),
                value: String(value)
            };
        });

        return {
            searchVM: params.searchVM,
            // View
            // views: views,
            // view: view,
            // doSelectView: doSelectView,
            // Paging
            totalCount: totalCount,
            page: page,
            pageStart: pageStart,
            pageEnd: pageEnd,
            pageSize: pageSize,
            lastPage: lastPage,

            doFirst: doFirst,
            doLast: doLast,
            doPrevPage: doPrevPage,
            doNextPage: doNextPage,
            disableFirst: disableFirst,
            disableLast: disableLast,
            disablePrevPage: disablePrevPage,
            disableNextPage: disableNextPage,
            pageSizes: pageSizes,

            searchResultsTemplate: params.searchResultsTemplate

        };
    }

    function icon(type) {
        return span({
            class: 'fa fa-' + type
        });
    }

    function buildButton(iconClass, name, tooltip) {
        return button({
            dataBind: {
                click: 'do' + name,
                disable: 'disable' + name + '()'
            },
            class: 'btn btn-default'
        }, icon(iconClass));
    }


    function buildPagingControl() {
        return div({
            class: 'btn-toolbar',
            style: {
                display: 'inline-block',
                textAlign: 'left'
            }
        }, [
            div({
                class: 'btn-group form-inline',
                style: {
                    width: '350px'
                }
            }, [
                buildButton('step-backward', 'First', 'Go to first page of search results'),
                buildButton('backward', 'PrevPage'),
                buildButton('forward', 'NextPage'),
                buildButton('step-forward', 'Last'),
                span({
                    style: {
                        // why not work??
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        margin: '6px 0 0 4px'
                    }
                }, [
                    span({
                        dataBind: {
                            text: 'pageStart() + 1'
                        }
                    }),
                    ' to ',
                    span({
                        dataBind: {
                            text: 'pageEnd() + 1'
                        }
                    }),
                    ' of ',
                    span({
                        dataBind: {
                            text: 'totalCount()'
                        },
                        style: {
                            marginRight: '10px',
                            verticalAlign: 'middle'
                        }
                    })
                ])
            ])
        ]);
    }

    function buildPageSizeControl() {
        return div({
            class: 'btn-toolbar',
            style: {
                display: 'inline-block',
                textAlign: 'left'
            }
        }, [
            div({ class: 'btn-group form-inline' }, [
                label({
                    style: {
                        // for bootstrap
                        marginBottom: '0'
                    }
                }, [
                    select({
                        dataBind: {
                            value: 'pageSize',
                            options: 'pageSizes',
                            optionsText: '"label"',
                            optionsValue: '"value"'
                        },
                        class: 'form-control'
                    }),
                    ' items per page'
                ])
            ])
        ]);
    }

    // function buildViewControl() {
    //     return div({
    //         style: {
    //             display: 'inline-block'
    //         }
    //     }, [
    //         'view:',
    //         button({
    //             class: 'btn btn-default',
    //             dataBind: {
    //                 click: 'function () {doSelectView("list");}',
    //                 css: {
    //                     active: '$component.view() === "list"'
    //                 }
    //             }
    //         }, span({
    //             class: 'fa fa-list-ol'
    //         })),
    //         button({
    //             class: 'btn btn-default',
    //             dataBind: {
    //                 click: 'function () {doSelectView("detail");}',
    //                 css: {
    //                     active: '$component.view() === "detail"'
    //                 }
    //             }
    //         }, span({
    //             class: 'fa fa-list-alt'
    //         })),
    //     ]);
    // }

    function template() {
        return div([
            div({
                class: 'row',
                style: {
                    marginTop: '14px'
                }
            }, [
                // div({
                //     class: 'col col-sm-4',
                //     style: {
                //         textAlign: 'center'
                //     }
                // }, buildViewControl()),
                div({
                    class: 'col col-sm-6',
                    style: {
                        textAlign: 'left'
                    }
                }, buildPagingControl()),
                div({
                    class: 'col col-sm-6',
                    style: {
                        textAlign: 'right'
                    }
                }, buildPageSizeControl())
            ]),
            div({
                dataBind: {
                    component: {
                        name: 'searchResultsTemplate',
                        params: {
                            searchVM: 'searchVM'
                        }
                    }
                }
            })
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