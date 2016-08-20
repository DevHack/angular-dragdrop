/**
 * Created by debayan.das on 1/18/2016.
 */
/**
 * <b>Description<b>: Provides "data-droppable" directive to create droppable area.
 * <b>Usage<b>: add "data-droppable" to any container element to make it droppable area.
 * ************************************************************************************
 * It has the following configurable attributes:
 * data-drop-id : <String> : required : Unique identifier for the drop area. Duplicate is not allowed.
 * data-drop-hover-class : <String> : optional : the class will be added to the droppable while an acceptable
 *                     draggable is being hovered over the droppable. Defaults to "".
 * data-drop-function : <Function> : optional : Additional drop validation. Can be any function on scope
 * data-prevent-append : <Boolean> : optional : prevent DOM append on droppable. Defaults to false.
 * data-max-drop-allow : <Number> : optional : no of element can be dropped in a drop area. Defaults to -1.
 * ******************************************************************************************
 */
(function (module) {
    module.directive("droppable", [
        "$rootScope",
        "$parse",
        "$compile",
        function ($rootScope, $parse, $compile) {
            return {
                restrict: "A",
                replace: "false",
                scope: {
                    dropFunction: "="
                },
                link: function (scope, elm, attr) {
                    scope.init = function (event, arg) {
                        scope.dropId = attr["dropId"];
                        scope.preventAppend = Boolean(attr["preventAppend"]) || false;
                        scope.maxDropAllow = parseInt(attr["maxDropAllow"], 10) || -1;
                        if (arg && arg.dropIds && arg.dropIds.length && arg.dropIds.indexOf(scope.dropId) === -1) {
                            logger.info("This drop is not getting reset as it doesn't match with the id", 'droppable', 'init');
                            return;
                        }
                        scope.totalDrop = 0;
                        if (scope.dropId === undefined || scope.dropId === null) {
                            throw new Error("required field 'data-drop-id' not found");
                        }
                        scope._createDroppable();
                    };

                    scope._createDroppable = function () {
                        elm.droppable({
                            accept: scope._getAcceptedElement,
                            hoverClass: scope._getHoverClass(),
                            drop: scope._dropActions
                        });
                    };

                    scope._getAcceptedElement = function (droppedElm) {
                        var dropId = droppedElm.attr("data-drop-col-id");
                        return !(dropId && dropId.split(",").indexOf(scope.dropId) === -1)
                            && scope.maxDropAllow !== scope.totalDrop;
                    };
                    scope._dropActions = function (event, ui) {
                        if (!scope.preventAppend) {
                            var dropElm = scope._getDropElem(ui);
                            elm.append(dropElm);
                        }
                        scope.totalDrop++;
                        $rootScope.$broadcast("elementDropped", {
                            dragId: ui.draggable.attr("data-drag-id"),
                            dropId: scope.dropId
                        });
                        $parse(scope.dropFunction)();
                    };

                    scope._getDropElem = function (origDrop) {
                        var dropElm,
                            originalDraggableElm = origDrop.draggable;
                        if (parseInt(originalDraggableElm.attr("data-clone-drop"), 10) !== 1) {
                            dropElm = originalDraggableElm.clone()
                                .css("opacity", "1")
                                .removeAttr("data-clone-drop")
                                .attr("data-drag-id", scope._getCloneDragId(originalDraggableElm));
                            $compile(dropElm)($rootScope);
                        } else {
                            dropElm = originalDraggableElm;
                        }
                        return dropElm.addClass(dropElm.attr("data-drop-class") || "");
                    };
                    scope._getCloneDragId = function (originalDraggableElm) {
                        return originalDraggableElm.attr("data-drag-id")
                            + "_"
                            + (parseInt(originalDraggableElm.attr("data-max-clone-drop"), 10)
                            - parseInt(originalDraggableElm.attr("data-clone-drop"), 10) + 1)
                    };
                    scope._getHoverClass = function () {
                        return attr["dropHoverClass"] || "";
                    };
                    scope.$on("initializeDroppables", scope.init);
                }
            }
        }]);
}(angular.module("angularDragDrop")));