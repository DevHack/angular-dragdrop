/**
 * Created by debayan.das on 1/18/2016.
 */
/**
 * <b>Description<b>: Provides "data-draggable" directive to any element draggable.
 * <b>Usage<b>: Add as an attribute to any DOM element to make it draggable
 * ************************************************************************************
 * It has the following configurable attributes:
 * data-drag-id : <String> : required : Unique identifier for the draggable. Duplicate is not allowed.
 * data-drag-class : <String> : optional : the class will be added to the draggable while dragging. Defaults to "".
 * data-drop-col-id : <String> : optional : defines specific drop area ids where this draggable can be dropped. To use multiple
 *                      destination we need a comma separated string of Ids. defaults to "".
 * data-containment : <String> : optional : defines the containment. defaults to "";
 * data-clone-drop : <Number> : optional : no of clones can be made from a draggable. defaults to 1.
 * data-drag-active : <Boolean> : optional : if set to false , element can not be draggable. Defaults to true
 * data-single-drop : <Boolean> : optional : if set to true, element can not be dragged any more
 * data-drag-clone : <Boolean> : optional : if set to true, element is cloned while dragging
 * ******************************************************************************************
 */
(function (module) {
    module.directive("draggable", [
        function () {
            return {
                restrict: "A",
                replace: false,
                scope: {},
                link: function (scope, elm, attr) {
                    scope.init = function (event, arg) {
                        scope.dragId = attr["dragId"];
                        if (arg && arg.dragIds && arg.dragIds.length && arg.dragIds.indexOf(scope.dragId) === -1) {
                            logger.info("This drag is not getting reset as it doesn't match with the id", 'draggable', 'init');
                            return;
                        }
                        scope.isDropped = false;
                        scope.cloneDrop = parseInt(attr["cloneDrop"] || "1", 10);
                        elm.attr("data-clone-drop", scope.cloneDrop);
                        elm.attr("data-max-clone-drop", scope.cloneDrop);
                        //@todo: validate duplicate data id
                        if (scope.dragId === undefined || scope.dragId === null) {
                            throw new Error("required field 'data-drag-id' not found");
                        }
                        scope._attachDropListener();
                        scope._createDraggable();
                    };
                    scope._attachDropListener = function () {
                        if (scope.dropListener && typeof scope.dropListener === "function") {
                            scope.dropListener();
                        }
                        scope.dropListener = scope.$on("elementDropped", scope._dropListener);
                    };
                    scope._createDraggable = function () {
                        if (attr["dragActive"] === "false") {
                            elm.addClass("drag-disable");
                            if (elm.draggable()) {
                                elm.draggable("destroy");
                            }
                            return;
                        }
                        elm.draggable({
                            revert: scope._isRevert,
                            containment: scope._getContainment(),
                            cursor: "move",
                            helper: "clone",
                            start: scope._dragStart,
                            stop: scope._dragStop
                        });
                    };
                    scope._getHelperOpacity = function () {
                        return attr["dragClone"] === "true" ? 0.5 : 0;
                    };
                    scope._dragStart = function (e, ui) {
                        scope.isDropped = false;
                        angular.element(ui.helper).addClass(attr["dragClass"] || "");
                        elm.css("opacity", String(scope._getHelperOpacity()));
                        if (scope.$parent.totalDrop) {
                            scope.$parent.totalDrop--;
                        }
                    };
                    scope._dragStop = function (e, ui) {
                        elm.css("opacity", "1");
                    };

                    scope._getContainment = function () {
                        return attr["containment"] || "body";
                    };

                    scope._dropListener = function (e, data) {
                        if (data.dragId === scope.dragId) {
                            scope._performAfterDrop();
                            scope._validateSingleDrop();
                        }
                    };
                    scope._validateSingleDrop = function () {
                        var isSingleDrop = attr["singleDrop"] === "true";
                        if (isSingleDrop) {
                            elm.draggable("destroy");
                        }
                    };
                    scope._performAfterDrop = function () {
                        scope.isDropped = true;
                        elm.attr("data-clone-drop", scope.cloneDrop === 1 ? scope.cloneDrop : --scope.cloneDrop);
                    };

                    scope.getCloneDrop = function () {
                        return scope.cloneDrop;
                    };

                    scope._isRevert = function () {
                        return !scope.isDropped;
                    };
                    scope.$on("initializeDraggables", scope.init);
                }
            };
        }]);
}(angular.module("angularDragDrop")));