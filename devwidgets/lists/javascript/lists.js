/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

require(["jquery", "sakai/sakai.api.core", "/devwidgets/lists/listsconfig.js"], function($, sakai) {

    /**
     * @name sakai.lists
     *
     * @class lists
     *
     * @description
     * Initialize the lists widget
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.lists = function(tuid, showSettings) {

        // Dom identifiers
        var $rootel = $("#" + tuid);
        var $listsSettings = $("#lists_settings", $rootel);
        var $listsMain = $("#lists_main", $rootel);

        var $listsSaveSettingsButton = $("#lists_save", $rootel);
        var $listsCancelSettingsButton = $("#lists_cancel", $rootel);

        var $listsOfLists = $("#lists_list_of_lists", $rootel);
        var $listsTemplate = $("#lists_list_edit_template", $rootel);
        var $listsDisplayTemplate = $("#lists_list_display_template", $rootel);

        var $listSelect = $(".list_select", $rootel);
        var $listTitle = $("#lists_title", $rootel);

        var widgetData = {};
        var thisList = {};

        ////////////////////
        // Main functions //
        ////////////////////

        var loadWidget = function(callback) {
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    widgetData = data;
                }
                if ($.isFunction(callback)) {
                    callback();
                }
            });
        };

        var showLists = function() {
            $listsMain.show();
            if (widgetData.title) { // change the title of the widget
                if (!sakai.api.Widgets.isOnDashboard(tuid)) {
                    $listTitle.show();
                    $listTitle.find("h1").text(widgetData.title);
                    $(".lists_widget", $rootel).addClass("on_page");
                } else {
                    sakai.api.Widgets.changeWidgetTitle(tuid, widgetData.title);
                }
            }
            if (widgetData.selections) {
                sakai.api.Util.TemplateRenderer($listsDisplayTemplate, {"data": widgetData.selections, "newtab": widgetData.newtab}, $listsMain);
            }
        };

        var getSaveData = function() {
            if (($("select.list_final", $rootel).length > 0 && $("select.list_final option:selected", $rootel).length > 0) ||
                 $(".lists_multi input[type=checkbox]:checked", $rootel).length > 0) {

                widgetData.selections = [];
                widgetData.parents = [];
                $(".list_final", $rootel).parents(".list_container", $rootel).each(function(i,val) {
                    if (i === 0) {
                        widgetData.title = unescape($(val).attr("id"));
                        var list = getList(thisList, unescape($(val).attr("id")));
                        if (list.newtab) {
                            widgetData.newtab = list.newtab;
                        }
                    }
                    widgetData.parents[i] = unescape($(val).attr("id"));
                });
                if ($("select.list_final option:selected", $rootel).length > 0) {
                    $("select.list_final option:selected", $rootel).each(function(i,val){
                        var obj = {"title": unescape($(this).val())};
                        if ($(this).attr("title")) {
                            obj.loc = $(this).attr("title");
                        }
                        widgetData.selections.push(obj);
                    });
                } else {
                    $(".lists_multi input[type=checkbox]:checked", $rootel).each(function(i,val){
                        var obj = {"title": unescape($(this).val())};
                        if ($(this).attr("title")) {
                            obj.loc = $(this).attr("title");
                        }
                        widgetData.selections.push(obj);
                    });
                }
                return true;
            } else {
                alert("Please make a selection before saving");
                return false;
            }
        };

        ////////////////////////
        // Settings functions //
        ////////////////////////

        var renderInitialLists = function() {
            setSelected();
            $listsOfLists.html(sakai.api.Util.TemplateRenderer($listsTemplate, {"data":thisList, "hasLists": true, "parentLabel": "", "editParents": widgetData.editParents === "false" ? false : true}));
            $(".list_select:not(.triggered):has(option:selected)", $rootel).addClass("triggered").trigger("change");
        };

        var setSelected = function() {
            if (widgetData && widgetData.parents) {
                // select the parents
                for (var i=widgetData.parents.length-1, j=-1; i>j; i--) {
                    var thisLabel = widgetData.parents[i];
                    doSetSelectedRecursive(thisList, widgetData.parents, thisLabel);
                }
                // select the selections
                $(widgetData.selections).each(function(i,val) {
                    doSetSelectedRecursive(thisList, widgetData.parents, val.title);
                });
            }
        };

        var doSetSelectedRecursive = function(lists, parents, label) {
            $(lists).each(function(i,val) {
                if (label === val.Label || (val.title && label === val.title) || label === val) {
                    if (label === val) {
                        var tmp = val;
                        val = {};
                        val.title = tmp;
                    }
                    val.selected = true;
                    lists[i] = val;
                }
            });
            $(lists).each(function(i,val) {
                if (val.list && $.inArray(val.Label, parents) !== -1) {
                    doSetSelectedRecursive(val.list, parents, label);
                }
            });
        };

        /**
         * getList
         * Given a label, find the list associated with it inside of the current list
         * Performs a breadth-first recursive search for the node
         *
         * @param {Object} lists The lists to start the search from
         * @param {String} label The label to serach the lists for
         */
        var getList = function(lists, label) {
            var ret = false;
            $(lists).each(function(i,val) {
                if (val.Label === label) {
                    ret = val;
                }
            });
            if (ret) {
                return ret;
            }
            $(lists).each(function(i,val) {
                if (val.list) {
                    ret = getList(val.list, label);
                }
            });
            if (ret) {
                return ret;
            }
            return false;
        };

        ////////////////////
        // Event Handlers //
        ////////////////////
        $listSelect.die("change");
        $listSelect.live("change", function(e){
            var id = $(this).attr("id").split("list_select_")[1];
            var $parentDiv = $(this).parent("div");
            var list = getList(thisList, unescape($(this).find("option:selected").val()));
            if (list) {
                if ($(".list_parent_" + id, $rootel).length) {
                    // replace the current list display
                    $(".list_parent_" + id, $rootel).replaceWith(sakai.api.Util.TemplateRenderer($listsTemplate, {"data":list, "parentLabel": unescape(id), "hasLists": list.list[0].list ? true : false, "editParents": widgetData.editParents === "false" ? false : true}));
                } else {
                    // append to the parent div for easy hiding
                    $parentDiv.append(sakai.api.Util.TemplateRenderer($listsTemplate, {"data":list, "parentLabel": unescape(id), "hasLists": list.list[0].list ? true : false, "editParents": widgetData.editParents === "false" ? false : true}));
                    $(".list_select:not(.triggered):has(option:selected)", $rootel).addClass("triggered").trigger("change"); // trigger change if there are more
                    if ($(".list_select.list_final", $rootel).length) { // if the final list is available, select the selections
                        $(widgetData.selections).each(function(i,val) {
                            $(".list_final", $rootel).find("option[value='" + escape(val) + "']").attr("selected", "selected");
                        });
                    }
                }
            } else {
                // remove the children
                $(".list_parent_" + id, $rootel).remove();
            }
        });

        /** Binds the lists save button*/
        $listsSaveSettingsButton.bind("click", function(e) {
            if (getSaveData()) {
                sakai.api.Widgets.saveWidgetData(tuid, widgetData, function(success, data){
                    sakai.api.Widgets.Container.informFinish(tuid, "lists");
                });
            }
        });

        $listsCancelSettingsButton.bind("click", function(e) {
            sakai.api.Widgets.Container.informFinish(tuid, "lists");
        });


        var doInit = function(){
            thisList = $.extend(true, {}, sakai_global.Lists);
            loadWidget(function() {
                if (showSettings) {
                    renderInitialLists();
                    var title = widgetData.title || "Lists";
                    sakai.api.Widgets.changeWidgetTitle(tuid, title);
                    $listsSettings.show();
                } else {
                    showLists();
                }
            });
        };
        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("lists");
});
