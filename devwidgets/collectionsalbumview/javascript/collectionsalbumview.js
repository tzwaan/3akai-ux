/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

require(["jquery", "sakai/sakai.api.core", "/dev/lib/jquery/plugins/jquery.jeditable.js"], function($, sakai) {

    /**
     * @name sakai.collections
     *
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.collectionsalbumview = function(tuid, showSettings) {

        var rootel = "#" + tuid;
        var $rootel = $("#" + tuid);

        var $widget_title = $("#widget_title", $rootel);

        // Containers
        var $collections_main_container = $("#collections_main_container", $rootel);
        var $collections_settings = $("#collections_settings", $rootel);
        var $collections_header = $("#collections_header", $rootel);
        var $collections_map = $("#collections_map", $rootel);
        var $collections_map_room_edit = $("#collections_map_room_edit", $rootel);
        var $collections_map_room_edit_container = $("#collections_map_room_edit_container", $rootel);
        var $categories_listing_body = $("#categories_listing_body", $rootel);
        var $collections_map_show_room = $("#collections_map_show_room", $rootel);
        var $collections_map_show_room_conatiner = $("#collections_map_show_room_conatiner", $rootel);
        var $collections_map_add_content = $("#collections_map_add_content", $rootel);
        var $collections_map_add_content_container = $("#collections_map_add_content_container", $rootel);
        var $category_dropdown = $("#category_dropdown", $rootel);
        var $collections_map_show_content_item = $("#collections_map_show_content_item", $rootel);
        var $collections_map_show_content_item_container = $("#collections_map_show_content_item_container", $rootel);

        // Templates
        var collectionsMapTemplate = "collections_map_template";
        var collectionsHeaderTemplate = "collections_header_template";
        var collectionsEditRoomTemplate = "collections_map_room_edit_template";
        var categoriesListingBodyTemplate = "collections_map_categories_listing_body_template";
        var collectionsShowRoomTemplate = "collections_map_show_room_template";
        var collectionsAddContentTemplate = "collections_map_add_content_template";
        var collectionsCategoryDropdownTemplate = "category_dropdown_template";
        var collectionsShowContentItemTemplate = "collections_map_show_content_item_template";

        // Buttons
        var $collectionsSettingsSubmit = $("#collections_settings_submit", $rootel);
        var $collectionsSettingsCancel = $("#collections_settings_cancel", $rootel);
        var $addCategoryButton = $("#do_add_category", $rootel);
        var $browseForFilesButton = $(".browse_for_files", $rootel);
        var $browseForContentFileButton = $(".browse_for_content_file", $rootel);

        // Links
        var returnToFloorplanLink = ".return_to_floorplan_link";
        var collectionsRoomCategoryItem = ".room_categories span a";
        var collectionsEditRoomLink = ".edit_this_room_link";
        var collectionsAddContentLink = ".add_content_link";
        var $collectionsReturnToFloorplanFromEdit = $("#return_to_floorplan_from_edit", $rootel);
        var $collectionsReturnToRoomFromEdit = $("#return_to_room_from_edit", $rootel);
        var $collectionsReturnToRoomFromEditContentItem = $("#return_to_room_from_edit_content_item", $rootel);
        var $collectionsReturnToFloorplanFromShow = $("#return_to_floorplan_from_show", $rootel);
        var collectionsViewContentLink = "div.room_categories span a";
        var collectionsEditContentLink = ".edit_this_content_link";
        var $collectionsReturnToContentFromEditLink = $("#return_to_content_from_edit", $rootel);

        // Form
        var $collectionsEditForm = $("#collections_map_room_edit form", $rootel);
        var $collectionsAddContentForm = $("#collections_map_add_content form", $rootel);
        var $addCategoryTextField = $("#add_category", $rootel);

        // Layout Selection
        var $collectionsHeaderSelectLayout = $("#collections_header_select_layout", $rootel);
        var $collectionsHeaderSelectLayoutTemplate = $("#collections_header_select_layout_template", $rootel);

        // Album View
        var $collectionsAlbums = $("#collections_albums", $rootel);
        var $collectionsAlbumsTemplate = $("#collections_albums_template", $rootel);
        var $collectionsAlbumsShowAlbum = $("#collections_albums_show_album", $rootel);
        var $collectionsAlbumsShowAlbumTemplate = $("#collections_albums_show_album_template", $rootel);
        var $collectionsAlbumShowCategory = $("#collections_albums_show_category", $rootel);
        var $collectionsAlbumShowCategoryTemplate = $("#collections_albums_show_category_template", $rootel);
        var $collectionsAlbumsShowItem = $("#collections_albums_show_item", $rootel);
        var $collectionsAlbumsShowItemTemplate = $("#collections_albums_show_item_template", $rootel);

        var settings = {},
            collectionData = {},
            widgetData = {},
            currentCollectionData = {},
            currentContentItemData = {},
            currentCategoryData = {},
            currentItemData = {},
            fromViewRoom = false,
            selectedCollectionID = -1,
            clickedCollectionID = -1,
            clickedCategoryID = -1,
            selectedCategoryID = -1,
            clickedItemID = -1,
            selectedItemID = -1,
            firstRender = true,
            removedEverything = false;


        /**
         * Universal Functions
         */

        var getWidgetData = function() {
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    settings = data.settings;
                    settings.displayStyle = "albumView";
                    collectionData = data.collectionData;
                    if (showSettings) {
                        $widget_title.val(settings.widgetTitle);
                    } else {
                        $collections_header.show();
                        settings.sakai = sakai;
                        sakai.api.Util.TemplateRenderer(collectionsHeaderTemplate, settings, $collections_header);
                        sakai.api.Util.TemplateRenderer($collectionsHeaderSelectLayoutTemplate, settings, $collectionsHeaderSelectLayout);
                        parseState();
                    }
                } else {
                    collectionData = {
                        "collections": []
                    };
                    settings.widgetTitle = "title";
                    settings.displayStyle = "albumView";
                    return;
                }
            });
        };

        var saveWidgetData = function() {
            delete collectionData.sakai;
            widgetData.collectionData = collectionData;
            delete settings.sakai;
            widgetData.settings = settings;
            sakai.api.Widgets.saveWidgetData(tuid, widgetData, function(success, data) {
                if (success) {
                    if (showSettings) {
                        sakai.api.Widgets.Container.informFinish(tuid, "collections");
                    }
                }
            });
        };

        var setupWidgetSettingsForSave = function() {
            settings = {};
            var title = $widget_title.val();
            if ($.trim(title) === "") {
                alert($("collections_title_empty").text());
            }
            settings.widgetTitle = title;
            settings.displayStyle = "albumView";
        };

        var prepareCollectionDataForPost = function() {
            var thisCollectionData = currentCollectionData;
            var collectionExists = false;
            // Put the room's data back into the collectionData object
            for (var i = 0; i < collectionData.collections.length; i++) {
                if (collectionData.collections[i].id == selectedCollectionID) {
                    collectionExists = true;
                    collectionData.collections[i] = thisCollectionData;
                    break;
                }
            }

            // if we're not editing, just push it onto the data stack
            if (!collectionExists) {
                collectionData.collections.push(thisCollectionData);
            }

            return collectionData;
        };

        var saveCollectionData = function() {
            collectionData = prepareCollectionDataForPost();
            saveWidgetData();
        };

        var prepareCategoryDataForPost = function() {
            var thisCategoryData = currentCategoryData;
            var categoryExists = false;
            if (currentCollectionData.categories) {
                for (var i = 0; i < currentCollectionData.categories.length; i++) {
                    if (currentCollectionData.categories[i].id == selectedCategoryID) {
                        categoryExists = true;
                        currentCollectionData.categories[i] = thisCategoryData;
                        break;
                    }
                }
            } else {
                currentCollectionData.categories = [];
            }

            // if we're not editing, just push it onto the data stack
            if (!categoryExists) {
                currentCollectionData.categories.push(thisCategoryData);
            }

        };

        var saveCategoryData = function() {
            prepareCategoryDataForPost();
            saveCollectionData();
        };

        var prepareItemDataForPost = function() {
            var thisItemData = currentItemData;
            var itemExists = false;
            if (currentCategoryData.items) {
                for (var i = 0; i < currentCategoryData.items.length; i++) {
                    if (currentCategoryData.items[i].id == selectedItemID) {
                        itemExists = true;
                        currentCategoryData.items[i] = thisItemData;
                        break;
                    }
                }
            } else {
                currentCategoryData.items = [];
            }

            // if we're not editing, just push it onto the data stack
            if (!itemExists) {
                currentCategoryData.items.push(thisItemData);
            }

        };

        var saveItemData = function() {
            prepareItemDataForPost();
            saveCategoryData();
        };

        var saveWidgetSettings = function() {
            setupWidgetSettingsForSave();
            saveWidgetData();
        };

        var sortCollectionByPosition = function() {
            collectionData.collections.sort(function(a, b) {
                var positionA = a.position;
                var positionB = b.position;
                if (positionA && positionB) {
                    return positionA - positionB;
                } else if (positionA) {
                    return -1;
                } else if (positionB) {
                    return 1;
                } else {
                    return 0;
                }
            });
        };

        var parseState = function() {
            if (removedEverything) {
                removedEverything = false;
                return;
            }
            var collection = $.bbq.getState("collection");
            var mode = $.bbq.getState("mode");
            var pos = $.bbq.getState("pos");
            var category = $.bbq.getState("category");
            var item = $.bbq.getState("item");
            var fromShow = $.bbq.getState("fromShow");
            var view = "albumView";
            if (item) {
                selectedCollectionID = collection;
                setCollectionData();
                if (selectedCategoryID != category) {
                    selectedCategoryID = category;
                    viewCategory();
                }
                selectedItemID = item;
                showItem();
            } else if (category) {
                hideEverything();
                selectedCollectionID = collection;
                setCollectionData();
                selectedCategoryID = category;
                viewCategory();
            } else if (collection) {
                hideEverything();
                selectedCollectionID = collection;
                viewAlbum();
            } else {
                hideEverything();
                renderAlbumView();
                if (mode === "edit") {
                    if (!$("#collections_header h1", $rootel).hasClass("editable")) {
                        $("#collections_header div a#configure_widget", $rootel).trigger("click");
                    } else {
                        showAddAlbum();
                    }
                }
            }

            if (sakai_global.show.canEdit()) {
                $(".configure", $rootel).show();
            }
            renderGlobals();
            if (firstRender) {
                firstRender = false;
            }
        };

        var deleteItem = function(itemID) {
            var newCategoryItemData = [];
            for (var i = 0; i < currentCategoryData.items.length; i++) {
                if (currentCategoryData.items[i].id != itemID) {
                    newCategoryItemData.push(currentCategoryData.items[i]);
                }
            }
            currentItemData = {};
            currentCategoryData.items = newCategoryItemData;
            saveCategoryData();
        };

        var deleteCategory = function(cid) {
            var newCollectionData = [];
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                if (currentCollectionData.categories[i].id != cid) {
                    newCollectionData.push(currentCollectionData.categories[i]);
                }
            }
            currentCategoryData = {};
            currentCollectionData.categories = newCollectionData;
            saveWidgetData();
        };

        var deleteCollection = function(cid) {
            var newCollectionData = [];
            for (var i = 0; i < collectionData.collections.length; i++) {
                if (collectionData.collections[i].id != cid) {
                    newCollectionData.push(collectionData.collections[i]);
                }
            }
            currentCollectionData = {};
            collectionData.collections = newCollectionData;
            saveWidgetData();
        };

        var setCollectionData = function() {
            if (!currentCollectionData || !currentCollectionData.categories || currentCollectionData.categories.length === 0) {
                for (var i in collectionData.collections) {
                    if (collectionData.collections[i].id == selectedCollectionID) {
                        currentCollectionData = collectionData.collections[i];
                        break;
                    }
                }
            }
        };

        var hideEverything = function() {
            $(".mapView", $rootel).hide();
            $(".albumView", $rootel).hide();
        };

        var renderGlobals = function() {
            if (sakai_global.show.canEdit() && firstRender) {
                $("#collections_header div", $rootel).show();
                if (!$("#collections_header h1", $rootel).hasClass("editable")) {
                    $("#collections_header div a#configure_widget", $rootel).trigger("click");
                }
            }
        };

        /**
         * New TinyMCE Functions
         */
        var mceConfig = {
            mode: "textareas",
            theme: "simple",
            content_css: '/devwidgets/collections/css/collections.css'
        };

        var initInlineMCE = function() {
            tinyMCE.init(mceConfig);
        };

        $.editable.addInputType('mce', {
            element: function(settings, original) {
                var textarea = $('<textarea id="' + $(original).attr("id") + '_mce"/>');
                if (settings.rows) {
                    textarea.attr('rows', settings.rows);
                } else {
                    textarea.height(settings.height);
                }
                if (settings.cols) {
                    textarea.attr('cols', settings.cols);
                } else {
                    textarea.width(settings.width);
                }
                $(this).append(textarea);
                return (textarea);
            },
            plugin: function(settings, original) {
                tinyMCE.execCommand("mceAddControl", false, $(original).attr("id") + '_mce');
                $(window).bind("click", function(e) {
                    // i know, this gets bound every time, and causes tons of events to pile up - let me know if you have a better way to do this
                    if (!$(e.target).parents(".inlineEditBtn").length) {
                        tinyMCE.execCommand("mceRemoveControl", false, $(original).attr("id") + '_mce');
                        original.reset();
                    }
                });
            },
            submit: function(settings, original) {
                tinyMCE.triggerSave();
                tinyMCE.execCommand("mceRemoveControl", false, $(original).attr("id") + '_mce');
            },
            reset: function(settings, original) {
                tinyMCE.execCommand("mceRemoveControl", false, $(original).attr("id") + '_mce');
                original.reset();
            }
        });

        /**
         * Universal event bindings
         */

        $("#collections_header h1", $rootel).die("click");
        $("#collections_header h1", $rootel).live("click", function() {
            if (!$(this).hasClass("editable")) {
                $.bbq.removeState('item', 'category', 'collection', 'fromShow', 'mode', 'pos');
            }
        });

        $("#collections_header div a#configure_widget", $rootel).die("click");
        $("#collections_header div a#configure_widget", $rootel).live("click", function() {
            //$("#collections_header div", $rootel).toggleClass("expanded");
            //$("#collections_header div span#choose_layout", $rootel).toggle();
            if (sakai_global.show.canEdit()) {
                toggleTitleEditable();
                if (settings.displayStyle == "albumView" && !$(".addAlbum", $rootel).is(":visible")) {
                    showAddAlbum();
                } else {
                    hideAddAlbum();
                }
            }
        });

        $("#collections_header div span#choose_layout", $rootel).die("click");
        $("#collections_header div span#choose_layout", $rootel).live("click", function() {
            $("#collections_header_select_layout", $rootel).toggle();
        });

        $("#collections_header_select_layout li", $rootel).die("click");
        $("#collections_header_select_layout li", $rootel).live("click", function() {
            hideEverything();
            $("#collections_header_select_layout li", $rootel).removeClass("selected");
            $(this).addClass("selected");
            if ($(this).attr("id") == "albumView") {
                $("#collections_header div span#choose_layout a span#chosen_layout", $rootel).text("Album View");
                settings.displayStyle = "albumView";
                $.bbq.pushState({
                    'view': 'albumView',
                    'mode': 'edit'
                });
            } else if ($(this).attr("id") == "mapView") {
                if (collectionData.collections.length > 10) {
                    alert("You cannot change to this view, you have too many collections");
                    $.bbq.pushState({
                        'view': 'albumView',
                        'mode': 'edit'
                    });
                } else {
                    $("#collections_header div span#choose_layout a span#chosen_layout", $rootel).text("Architectural View");
                    settings.displayStyle = "mapView";
                    $.bbq.pushState({
                        'view': 'mapView',
                        'mode': 'edit'
                    });
                }
            }
            saveWidgetData();
            $("#collections_header_select_layout", $rootel).toggle();
        });

        var thisPage = $(".jstree-clicked").text();
        $("#navigation_tree").bind("select_node.jstree", function() {
            if ($.trim(thisPage) === "") {
                thisPage = $(".jstree-clicked").text();
            }
            if (thisPage !== $(".jstree-clicked").text()) {
                $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");
            }
        });


        // History Mgmt
        $(window).unbind("hashchange." + rootel);
        $(window).bind("hashchange." + rootel, function() {
            if ($rootel.is(":visible")) {
                parseState();
            }
        });


        // Hide the layout dropdown if anywhere else is clicked
        $(document).unbind("click." + rootel);
        $(document).bind("click." + rootel, function(e) {
            if ($rootel.is(":visible")) {
                if ($("#collections_header_select_layout", $rootel).is(":visible")) {
                    var $clicked = $(e.target);
                    if (!$clicked.parents().is("#collections_header_select_layout", $rootel) && !$clicked.parents().is("#choose_layout") && !$clicked.is("#choose_layout") && !$clicked.is("#collections_header_select_layout")) {
                        $("#collections_header_select_layout", $rootel).toggle();
                    }
                }
            }
        });

        /**
         * Album View
         */

        var clickedAlbumPosition = -1;
        var selectedAlbumPosition = -1;
        var categoryImages = [];

        var stripHTML = function(_html) {
            var ret = $('<div>' + _html + '</div>').text().trim();
            return ret;
        };

        var initializeAlbumView = function() {
            sortCollectionByPosition();
            for (var i in collectionData.collections) {
                if (collectionData.collections.hasOwnProperty(i)) {
                    collectionData.collections[i].albumViewPosition = i;
                }
            }
        };

        var renderAlbumView = function() {
            hideAllAlbumView();
            initializeAlbumView();
            $collectionsAlbums.show();
            collectionData.sakai = sakai;
            sakai.api.Util.TemplateRenderer($collectionsAlbumsTemplate, collectionData, $collectionsAlbums);
            if (sakai_global.show.canEdit() &&
                collectionData.collections.length === 0 &&
                $("#collections_header h1", $rootel).hasClass("editable")) {
                    showAddAlbum();
            }

            $(".albumCoverTitle span", $rootel).each(function(elt) {
                $(this).html(stripHTML($(this).html()));
            });
            $(".albumCoverDescription span", $rootel).each(function(elt) {
              var newDesc = stripHTML($(this).html()); // strip the html tags
              newDesc = newDesc.substring(1,newDesc.length);  // remove the " that trimpath is putting in there...
              $(this).html(newDesc);
            });
            $(".albumCoverDescription", $rootel).ThreeDots({max_rows : 6,  allow_dangle:true, whole_word:false});
            $(".albumCoverTitle", $rootel).ThreeDots({max_rows : 2,  allow_dangle:true, whole_word:false});
        };

        var addNewAlbum = function() {
            currentCollectionData = {};
            if (collectionData.collections) {
                currentCollectionData.albumViewPosition = collectionData.collections.length;
            } else {
                currentCollectionData.albumViewPosition = 0;
            }

            var d = new Date();
            currentCollectionData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
            selectedCollectionID = currentCollectionData.id;

            $.bbq.pushState({
                'collection': selectedCollectionID
            });
        };

        var viewAlbum = function() {
            hideAllAlbumView();

            if (currentCollectionData.id !== selectedCollectionID) {
                currentCollectionData = {};
                for (var i in collectionData.collections) {
                    if (collectionData.collections.hasOwnProperty(i)) {
                        if (collectionData.collections[i].id == selectedCollectionID) {
                            currentCollectionData = collectionData.collections[i];
                            break;
                        }
                    }
                }
            }

            // these should never happen
            if (!currentCollectionData.albumViewPosition) {
                currentCollectionData.albumViewPosition = collectionData.collections.length;
            }
            if (!currentCollectionData.id) {
                var d = new Date();
                currentCollectionData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
                selectedCollectionID = currentCollectionData.id;
            }

            $collectionsAlbumsShowAlbum.show();
            sakai.api.Util.TemplateRenderer($collectionsAlbumsShowAlbumTemplate, {
                "album": currentCollectionData, sakai: sakai
            },
            $collectionsAlbumsShowAlbum);
            selectedCollectionID = currentCollectionData.id;

            if ((!currentCollectionData.title || currentCollectionData.title === "") && sakai_global.show.canEdit()) {
                $(".configureAlbum a", $rootel).trigger("click");
            }
            setupCategoryPreviewImages();

            $(".categoryPreviewName span", $rootel).each(function(elt) {
              $(this).html(stripHTML($(this).html()));
            });


            $(".categoryPreviewName", $rootel).ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});
        };

        var showAddAlbum = function() {
            if ($("#collections_header h1", $rootel).hasClass("editable")) {
                $(".addAlbum", $rootel).remove();
                $("#collections_albums", $rootel).append("<div class='albumCover addAlbum' title='Add New Chapter'></div>");
            }
        };

        var hideAddAlbum = function() {
            $(".addAlbum", $rootel).hide();
        };

        var hideAllAlbumView = function() {
            $(".albumView", $rootel).hide();
        };

        var setupCategoryPreviewImages = function() {
            // find all items with mimeType of image/*
            // preload them all, in some intelligent way
            //  - fire up a ton of <img> tags with sequential IDs so that we can just toggle them back and forth based on mousemove position
            for (var i in currentCollectionData.categories) {
                if (currentCollectionData.categories.hasOwnProperty(i)) {
                    var cat = currentCollectionData.categories[i];
                    var setFirstImage = false;
                    for (var j in cat.items) {
                        if (cat.items.hasOwnProperty(j)) {
                            var item = cat.items[j];
                            var itemURL = "";
                            if (item.mimeType && item.mimeType.split("/")[0] === "image") {
                                itemURL = item.url;
                            } else {
                                if (item.mimeType && sakai.config.MimeTypes[item.mimeType]) {
                                    itemURL = sakai.config.MimeTypes[item.mimeType].URL;
                                } else {
                                    itemURL = sakai.config.MimeTypes["other"].URL;
                                }
                            }
                            $("<img/>")[0].src = itemURL;
                            // load/cache the image
                            if (!setFirstImage) {
                                setFirstImage = true;
                                $("#category_" + cat.id + " div img", $rootel).attr("src", itemURL).show();
                                categoryImages[cat.id] = {};
                                categoryImages[cat.id].currentImage = 0;
                                categoryImages[cat.id].images = [];
                            }
                            categoryImages[cat.id].images.push(itemURL);
                        }
                    }
                    if (!categoryImages[cat.id]) {
                        $("#category_" + cat.id + " div img", $rootel).attr("src", "/dev/_images/mimetypes/empty.png").show();
                    }
                }
            }
        };

        var isNewCategory = false;

        var addNewCategory = function() {
            currentCategoryData = {};
            if (currentCollectionData.categories) {
                currentCategoryData.position = currentCollectionData.categories.length;
            } else {
                currentCategoryData.position = 0;
            }

            var d = new Date();
            currentCategoryData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
            selectedCategoryID = currentCategoryData.id;
            currentCategoryData.items = [];
            $.bbq.pushState({
                'category': selectedCategoryID
            });
            isNewCategory = true;
        };

        var viewCategory = function() {
            hideAllAlbumView();

            for (var y in currentCollectionData.categories) {
                if (currentCollectionData.categories[y].id == selectedCategoryID) {
                    currentCategoryData = currentCollectionData.categories[y];
                    break;
                }
            }

            $collectionsAlbumShowCategory.show();
            var catHTML = sakai.api.Util.TemplateRenderer($collectionsAlbumShowCategoryTemplate, {
                "category": currentCategoryData,
                "album": currentCollectionData, 
                sakai: sakai
            });
            $collectionsAlbumShowCategory.html(catHTML);
            sizeItemScrollbar();

            if (isNewCategory && sakai_global.show.canEdit()) {
                $(".configureCategory a", $rootel).trigger("click");
                isNewCategory = false;
            }

            $(".itemPreviewTitle span", $rootel).each(function(elt) {
               $(this).html(stripHTML($(this).html()));
            });
            $(".itemPreviewTitle", $rootel).ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});

        };

        var addNewItem = function() {
            currentItemData = {};

            var d = new Date();
            currentItemData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
            selectedItemID = currentItemData.id;

            currentItemData.mimeType = "";

            $.bbq.pushState({
                'item': selectedItemID
            });
        };

        var showAddItem = function() {
            if ($(".configureCategory", $rootel).hasClass("expanded")) {
                if ($(".addItem", $rootel).length === 0) {
                    $(".scroll-content", $rootel).prepend("<div class='scroll-content-item addItem' title='Add New Item'><div class='scrollItemContainer'></div></div>");
                } else {
                    $(".addItem", $rootel).show();
                }
            }
        };

        var hideAddItem = function() {
            $(".addItem", $rootel).hide();
        };

        var sizeItemScrollbar = function() {
            var numChildren = $(".scroll-content", $rootel).children().length;
            var childWidth = $(".scroll-content", $rootel).children().outerWidth(true);
            var totalChildWidth = childWidth * numChildren;
            var scrollContentWidth = totalChildWidth > 560 ? totalChildWidth : 560;
            $(".scroll-content", $rootel).css({
                "width": scrollContentWidth + "px"
            });
        };

        var showItem = function() {
            $("#item_" + selectedItemID, $rootel).addClass("selected");
            if (currentItemData.id != selectedItemID) {
                for (var i in currentCategoryData.items) {
                    if (currentCategoryData.items[i].id == selectedItemID) {
                        currentItemData = currentCategoryData.items[i];
                        break;
                    }
                }
            }
            $collectionsAlbumsShowItem.show();
            sakai.api.Util.TemplateRenderer($collectionsAlbumsShowItemTemplate, {"item": currentItemData, sakai: sakai}, $collectionsAlbumsShowItem);
            if ((!currentItemData.title || currentItemData.title === "") && sakai_global.show.canEdit()) {
                $(".configureItem a", $rootel).trigger("click");
            }

        };

        var toggleTitleEditable = function() {
            if (!$("#collections_header h1.isEditable", $rootel).hasClass("editable")) {
                $("#collections_header h1.isEditable", $rootel).editable(function(value, _settings) {
                    settings.widgetTitle = value;
                    saveWidgetData();
                    return (value);
                },
                {
                    type: 'text',
                    submit: 'OK',
                    tooltip: 'Click to change title',
                    cssclass: 'inlineEditBtn'
                });
                $("#collections_header h1.isEditable", $rootel).addClass("editable");
            } else {
                $("#collections_header h1.isEditable", $rootel).editable("destroy");
                $("#collections_header h1.isEditable", $rootel).removeClass("editable");
                $("#collections_header h1.isEditable", $rootel).attr("title", "");
            }

        };

        var toggleAlbumEditable = function() {
            $(".albumView .isEditable", $rootel).each(function(elt) {
                if ($(this).hasClass("editable")) {
                    //tinyMCE.execCommand("mceRemoveControl", false, $(this).attr("id")+'_mce');
                    $(this).editable("disable");
                    if ($(this).text() == "Click to edit") {
                        $(this).text('');
                    }
                } else {
                    initInlineMCE();
                    if ($(this).hasClass("albumDesc")) {
                        $('.albumDesc', $rootel).editable(function(value, settings) {
                            currentCollectionData.description = value;
                            saveCollectionData();
                            return (value);
                        },
                        {
                            type: 'mce',
                            submit: 'OK',
                            tooltip: 'Click to add a description of this chapter',
                            onblur: 'ignore',
                            cssclass: 'inlineEditBtn'
                        });
                    } else if ($(this).hasClass("albumTitle")) {
                        $('.albumTitle', $rootel).editable(function(value, settings) {
                            currentCollectionData.title = value;
                            saveCollectionData();
                            return (value);
                        },
                        {
                            type: 'text',
                            submit: 'OK',
                            tooltip: 'Click to add the chapter title',
                            cssclass: 'inlineEditBtn'
                        });
                    } /*else if ($(this).hasClass("albumImage")) {

                    }*/
                    if ($(this).find(".clickToEditText", $rootel).length && $(this).hasClass("albumImage") && $(this).find("img").attr("src") === "") {
                        $(this).find(".clickToEditText", $rootel).text("Click to add content");
                    }
                    $(this).editable("enable");
                }
                $(this).toggleClass("editable");
            });
        };

        var toggleCategoryEditable = function() {
            $(".categoryData.isEditable", $rootel).each(function(elt) {
                if ($(this).hasClass("editable")) {
                    $(this).editable("disable");
                    $(this).find("input").blur();
                    tinyMCE.execCommand("mceRemoveControl", true, $(this).attr("id") + '_mce');
                    if ($(this).text() == "Click to edit") {
                        $(this).text('');
                    }
                    hideAddItem();
                } else {
                    if ($(this).hasClass("categoryTitle")) {
                        $('.categoryTitle', $rootel).editable(function(value, settings) {
                            currentCategoryData.name = value;
                            saveCategoryData();
                            return (value);
                        },
                        {
                            type: 'text',
                            submit: 'OK',
                            tooltip: 'Click to add the category title',
                            cssclass: 'inlineEditBtn'
                        });
                    }
                    $(this).editable("enable");
                    showAddItem();
                }
                $(this).toggleClass("editable");
            });
        };

        var toggleItemEditable = function() {
            $(".itemData.isEditable", $rootel).each(function(elt) {
                if ($(this).hasClass("editable")) {
                    $(this).editable("disable");
                    $(this).find("input").blur();
                    $(this).find("textarea").blur();
                    tinyMCE.execCommand("mceRemoveControl", true, $(this).attr("id") + '_mce');
                    if ($(this).text() == "Click to edit") {
                        $(this).text('');
                    }
                } else {
                    if ($(this).hasClass("itemDesc")) {
                        initInlineMCE();
                        $('.itemDesc', $rootel).editable(function(value, settings) {
                            currentItemData.description = value;
                            saveItemData();
                            sakai.api.Util.TemplateRenderer($collectionsAlbumShowCategoryTemplate, {
                                "category": currentCategoryData,
                                "album": currentCollectionData,
                                sakai: sakai
                            },
                            $collectionsAlbumShowCategory);
                            if (sakai_global.show.canEdit()) {
                                $(".configure", $rootel).show();
                            }
                            $("#item_" + selectedItemID, $rootel).addClass("selected");
                            sizeItemScrollbar();
                            $(".itemPreviewTitle span", $rootel).each(function(elt) {
                               $(this).html(stripHTML($(this).html()));
                            });
                            $(".itemPreviewTitle", $rootel).ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});
                            return (value);
                        },
                        {
                            type: 'mce',
                            submit: 'OK',
                            tooltip: 'Click to add a description of this item',
                            onblur: 'ignore',
                            cssclass: 'inlineEditBtn'
                        });
                    } else if ($(this).hasClass("itemTitle")) {
                        $('.itemTitle', $rootel).editable(function(value, settings) {
                            currentItemData.title = value;
                            saveItemData();
                            sakai.api.Util.TemplateRenderer($collectionsAlbumShowCategoryTemplate, {
                                "category": currentCategoryData,
                                "album": currentCollectionData,
                                sakai: sakai
                            },
                            $collectionsAlbumShowCategory);
                            if (sakai_global.show.canEdit()) {
                                $(".configure", $rootel).show();
                            }
                            $("#item_" + selectedItemID, $rootel).addClass("selected");
                            sizeItemScrollbar();
                            $(".itemPreviewTitle span", $rootel).each(function(elt) {
                               $(this).html(stripHTML($(this).html()));
                            });
                            $(".itemPreviewTitle", $rootel).ThreeDots({max_rows : 1,  allow_dangle:true, whole_word:false});
                            return (value);
                        },
                        {
                            type: 'text',
                            submit: 'OK',
                            tooltip: 'Click to add the item title',
                            cssclass: 'inlineEditBtn'
                        });
                    } /*else if ($(this).hasClass("itemImage")) {

                    }*/
                    if ($(this).find(".clickToEditText").length && $(this).hasClass("itemImage") && $(this).find("img").attr("src") === "") {
                        $(this).find(".clickToEditText").text("Click to add content");
                    }
                    $(this).editable("enable");
                }
                $(this).toggleClass("editable");
            });
        };

        var addAlbumImage = function(url) {
            currentCollectionData.image = url;
            $(".albumImage img", $rootel).attr("src", url).show();
            $(".clickToEditText", $rootel).text('');
            saveCollectionData();
        };

        var addItemFile = function(url, mimeType) {
            currentItemData.url = url;
            currentItemData.mimeType = mimeType;
            if (mimeType.split("/")[0] == "image") {
                $(".itemImage img", $rootel).attr("src", url).show();
            } else if (sakai.config.MimeTypes[mimeType]) {
                $(".itemImage img", $rootel).attr("src", sakai.config.MimeTypes[mimeType].URL).show();
            } else {
                $(".itemImage img", $rootel).attr("src", sakai.config.MimeTypes["other"].URL).show();
            }
            $(".clickToEditText", $rootel).text('');
            if (mimeType === "x-sakai/link") {
                url = "http://" + url.split("http://")[1];
            }
            $("a.itemLink", $rootel).attr("href", url);
            saveItemData();
            sakai.api.Util.TemplateRenderer($collectionsAlbumShowCategoryTemplate, {
                "category": currentCategoryData,
                "album": currentCollectionData,
                sakai: sakai
            },
            $collectionsAlbumShowCategory);
            if (sakai_global.show.canEdit()) {
                $(".configure", $rootel).show();
            }
        };

        /**
         * Album View Events
         */

        $(".addItem", $rootel).die("click");
        $(".addItem", $rootel).live("click", function() {
            addNewItem();
        });

        $(".categoryHeader span a", $rootel).die("click");
        $(".categoryHeader span a", $rootel).live("click", function() {
            addNewCategory();
        });

        $(".configureCategory button", $rootel).die("click");
        $(".configureCategory button", $rootel).live("click", function() {
            deleteCategory(currentCategoryData.id);
            $.bbq.removeState("category", "fromShow", "pos", "mode");
        });

        $(".configureAlbum button", $rootel).die("click");
        $(".configureAlbum button", $rootel).live("click", function() {
            deleteCollection(currentCollectionData.id);
            $.bbq.removeState("collection", "fromShow", "pos", "mode");
        });

        $(".configureItem button", $rootel).die("click");
        $(".configureItem button", $rootel).live("click", function() {
            deleteItem(currentItemData.id);
            $.bbq.removeState("item", "fromShow", "pos", "mode");
        });

        $(".configureAlbum a", $rootel).die("click");
        $(".configureAlbum a", $rootel).live("click", function() {
            $(".configureAlbum").toggleClass("expanded");
            $(".configureAlbum button").toggle();
            $(".categoryHeader span").toggle();
            toggleAlbumEditable();
        });

        $(".configureCategory a", $rootel).die("click");
        $(".configureCategory a", $rootel).live("click", function() {
            $(".configureCategory").toggleClass("expanded");
            $(".configureCategory button").toggle();
            toggleCategoryEditable();
            return false;
        });

        $(".configureItem a", $rootel).die("click");
        $(".configureItem a", $rootel).live("click", function() {
            $(".configureItem").toggleClass("expanded");
            $(".configureItem button").toggle();
            toggleItemEditable();
            return false;
        });

        $("#collections_albums_show_category h1", $rootel).die("click");
        $("#collections_albums_show_category h1", $rootel).live("click", function() {
            $.bbq.removeState('item', 'category', "fromShow", "pos", "mode");
        });

        $(".scroll-content-item", $rootel).die("mouseenter");
        $(".scroll-content-item", $rootel).live("mouseenter", function() {
            if (clickedItemID == -1) {
                $(this).addClass("hovered");
            }
            if ($(this).attr("id").split("item_")[1] == clickedItemID) {
                $(this).addClass("clicked");
            }
        });

        $(".scroll-content-item", $rootel).die("mouseleave");
        $(".scroll-content-item", $rootel).live("mouseleave", function() {
            $(this).removeClass("hovered");
            $(this).removeClass("clicked");
        });

        $(".scroll-content-item", $rootel).die("mousedown");
        $(".scroll-content-item", $rootel).live("mousedown", function() {
            $(this).addClass("clicked");
            clickedItemID = $(this).attr("id").split("item_")[1];
        });

        $(".scroll-content-item", $rootel).die("mouseup");
        $(".scroll-content-item", $rootel).live("mouseup", function() {
          $(this).removeClass("clicked");
            var itemid = $(this).attr("id").split("item_")[1];
              if (itemid == clickedItemID) {
                $(".scroll-content-item").removeClass("selected");
                $(this).addClass("selected");
                selectedItemID = itemid;
                clickedItemID = -1;
                $.bbq.pushState({
                    "item": selectedItemID
                });
            }
        });

        var timeOfLastImageChange = 0;

        $(".categoryPreview div img", $rootel).die("mousemove");
        $(".categoryPreview div img", $rootel).live("mousemove", function(e) {
            var catid = $(this).parents(".categoryPreview").attr("id").split("category_")[1];
            if (categoryImages[catid]) {
                // if there are any images at all here
                var d = new Date();
                var currentTime = d.getTime();
                if (currentTime - timeOfLastImageChange > 100) {
                    // throttle it so its not crazy
                    timeOfLastImageChange = currentTime;
                    if (categoryImages[catid].currentImage + 1 >= categoryImages[catid].images.length) {
                        categoryImages[catid].currentImage = 0;
                    } else {
                        categoryImages[catid].currentImage++;
                    }
                    $(this).attr("src", categoryImages[catid].images[categoryImages[catid].currentImage]);
                }
            }
        });

        $(".categoryPreview", $rootel).die("mouseup");
        $(".categoryPreview", $rootel).live("mouseup", function() {
          $(this).removeClass("clicked");
          var catid = $(this).attr("id").split("category_")[1];
            if (catid == clickedCategoryID) {
              selectedCategoryID = catid;
              clickedCategoryID = -1;
              $.bbq.pushState({
                  "category": selectedCategoryID
              });
          }
        });

        $(".categoryPreview", $rootel).die("mouseenter");
        $(".categoryPreview", $rootel).live("mouseenter", function() {
            if (clickedCategoryID == -1) {
                $(this).addClass("hovered");
            }
            if ($(this).attr("id").split("category_")[1] == clickedCategoryID) {
                $(this).addClass("clicked");
            }
        });

        $(".categoryPreview", $rootel).die("mouseleave");
        $(".categoryPreview", $rootel).live("mouseleave", function() {
          $(this).removeClass("clicked");
          $(this).removeClass("hovered");
        });

        $(".categoryPreview", $rootel).die("mousedown");
        $(".categoryPreview", $rootel).live("mousedown", function() {
          $(this).addClass("clicked");
          clickedCategoryID = $(this).attr("id").split("category_")[1];
        });

        $(".albumCover", $rootel).die("mousedown");
        $(".albumCover", $rootel).live("mousedown", function() {
            $(this).addClass("clicked");
            clickedCollectionID = $(this).attr("id").split("_")[1];
        });

        $(".albumCover", $rootel).die("mouseleave");
        $(".albumCover", $rootel).live("mouseleave", function() {
          $(this).removeClass("clicked");
          $(this).removeClass("hovered");
        });

        $(".albumCover", $rootel).die("mouseenter");
        $(".albumCover", $rootel).live("mouseenter", function() {
          if (clickedCollectionID == -1) {
            $(this).addClass("hovered");
        }
            if ($(this).attr("id").split("_")[1] == clickedCollectionID) {
                $(this).addClass("clicked");
            }
        });

        $(".albumCover", $rootel).die("mouseup");
        $(".albumCover", $rootel).live("mouseup", function() {
            $(this).removeClass("clicked");
            if ($(this).attr("id").split("_")[1] == clickedCollectionID) {
                if ($(this).hasClass("addAlbum")) {
                    addNewAlbum();
                } else {
                    selectedCollectionID = clickedCollectionID;
                    clickedCollectionID = -1;
                    $.bbq.pushState({
                        'collection': selectedCollectionID
                    });
                }
            }
        });

        $(document).bind("mouseup", function(e) {
            if ($(e.target).attr("id")) {
                if ($(e.target).attr("id").split("_")[0] != "album") {
                    clickedCollectionID = -1;
                }
                if ($(e.target).attr("id").split("_")[0] != "category") {
                  clickedCategoryID = -1;
                }
                if ($(e.target).attr("id").split("_")[0] != "item") {
                  clickedItemID = -1;
                }
            }
        });

        /**
         * Map View
         */


        /**
         * Edit the collectionData object to get ready for a POST
         */

        var saveCurrentContentData = function() {
            var isNew = true;
            if (currentContentItemData.id) {
                isNew = false;
                var curID = currentContentItemData.id;
                selectedItemID = curID;
            }
            currentContentItemData.title = $("#content_title", $rootel).val();
            currentContentItemData.url = $("#content_url", $rootel).val();
            currentContentItemData.description = $("#content_description", $rootel).val();
            currentContentItemData.mimeType = $("#content_mimetype", $rootel).val();
            for (var i = 0; i < currentCollectionData.categories.length; i++) {
                if (currentCollectionData.categories[i].name == $("#category_dropdown select option:selected", $rootel).val()) {
                    if (!isNew) {
                        // replace current one
                        for (var j = 0; j < currentCollectionData.categories[i].items.length; j++) {
                            if (currentCollectionData.categories[i].items[j].id == currentContentItemData.id) {
                                currentCollectionData.categories[i].items[j] = currentContentItemData;
                            }
                        }
                    } else {
                        // just add it in
                        var d = new Date();
                        currentContentItemData.id = d.getTime() + "" + Math.floor(Math.random() * 101);
                        currentCollectionData.categories[i].items.push(currentContentItemData);
                        selectedItemID = currentContentItemData.id;
                    }
                }
            }
        };


        // embed content bindings

        var bindToContentPicker = function() {
            $(".itemImage.editable", $rootel).die("click");
            $(".itemImage.editable", $rootel).live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Item", "mode": "picker", "limit": 1, "filter": false});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addItemFile(fileList.items[0].link, fileList.items[0].mimetype);
                    }
                });
                return false;
            });
            $(".albumImage.editable", $rootel).die("click");
            $(".albumImage.editable", $rootel).live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Album", "mode": "picker", "limit": 1, "filter": "image"});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addAlbumImage(fileList.items[0].link);
                    }
                });
                return false;
            });
            $browseForFilesButton.die("click");
            $browseForFilesButton.live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Album", "mode": "picker", "limit": 1, "filter": "image"});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addRoomImage(fileList.items[0].link);
                    }
                });
                return false;
            });
            $browseForContentFileButton.die("click");
            $browseForContentFileButton.live("click", function() {
                $(window).trigger('init.contentpicker.sakai', {"name":"Album", "mode": "picker", "limit": 1, "filter": false});
                $(window).unbind("finished.contentpicker.sakai");
                $(window).bind("finished.contentpicker.sakai", function(e, fileList) {
                    if (fileList.items.length) {
                        addItemContent(fileList.items[0].link);
                        addContentMimetype(fileList.items[0].mimetype);
                    }
                });
                return false;
            });
        };

        $collectionsSettingsSubmit.die("click");
        $collectionsSettingsSubmit.live("click", function() {
            saveWidgetSettings();
            return false;
        });

        $collectionsSettingsCancel.die("click");
        $collectionsSettingsCancel.live("click", function() {
            sakai.api.Widgets.Container.informCancel(tuid, "collections");
            return false;
        });

        var resetState = function() {
            removedEverything = true;
            $.bbq.removeState("item", "collection", "category", "fromShow", "pos", "mode");            
        };

        $("#edit_page, #delete_confirm, #createpage_save").die("click", resetState);
        $("#edit_page, #delete_confirm, #createpage_save").live("click", resetState);

        /**
         * Startup
         */
        var doInit = function() {
            getWidgetData();
            if (showSettings) {
                $collections_settings.show();
                $collections_main_container.hide();
            } else {
                $collections_settings.hide();
                $collections_main_container.show();
            }
            if (sakai.contentpicker) {
                bindToContentPicker();
            } else {
                $(window).bind("ready.contentpicker.sakai", function(e) {
                    bindToContentPicker();
                });
                sakai.api.Widgets.widgetLoader.insertWidgets(tuid);
            }
        };
        doInit();

    };

    sakai.api.Widgets.widgetLoader.informOnLoad("collectionsalbumview");

});
