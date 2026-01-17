import { r as reactExports, R as React, u as useLayoutEffect2, a as useCallbackRef$1, b as useComposedRefs, j as jsxRuntimeExports, P as Primitive, c as ReactDOM, d as createContextScope, e as composeEventHandlers, f as Presence, g as createSlot, D as DismissableLayer, h as createContext2, i as useSize, y, S as Slot$1, k as Root$3, l as R$1, H, m as clientExports } from "./theme-DWd5l5yA.js";
var useInsertionEffect = React[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  },
  caller
}) {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  {
    const isControlledRef = reactExports.useRef(prop !== void 0);
    reactExports.useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? "controlled" : "uncontrolled";
        const to = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }
  const setValue = reactExports.useCallback(
    (nextValue) => {
      if (isControlled) {
        const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value2 !== prop) {
          onChangeRef.current?.(value2);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, onChangeRef]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const [value, setValue] = reactExports.useState(defaultProp);
  const prevValueRef = reactExports.useRef(value);
  const onChangeRef = reactExports.useRef(onChange);
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  reactExports.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef]);
  return [value, setValue, onChangeRef];
}
function isFunction(value) {
  return typeof value === "function";
}
var useReactId = React[" useId ".trim().toString()] || (() => void 0);
var count$1 = 0;
function useId(deterministicId) {
  const [id, setId] = reactExports.useState(useReactId());
  useLayoutEffect2(() => {
    setId((reactId) => reactId ?? String(count$1++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var FOCUS_SCOPE_NAME = "FocusScope";
var FocusScope = reactExports.forwardRef((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props;
  const [container, setContainer] = reactExports.useState(null);
  const onMountAutoFocus = useCallbackRef$1(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef$1(onUnmountAutoFocusProp);
  const lastFocusedElementRef = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));
  const focusScope = reactExports.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  reactExports.useEffect(() => {
    if (trapped) {
      let handleFocusIn2 = function(event) {
        if (focusScope.paused || !container) return;
        const target = event.target;
        if (container.contains(target)) {
          lastFocusedElementRef.current = target;
        } else {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleFocusOut2 = function(event) {
        if (focusScope.paused || !container) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container.contains(relatedTarget)) {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleMutations2 = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focus(container);
        }
      };
      document.addEventListener("focusin", handleFocusIn2);
      document.addEventListener("focusout", handleFocusOut2);
      const mutationObserver = new MutationObserver(handleMutations2);
      if (container) mutationObserver.observe(container, { childList: true, subtree: true });
      return () => {
        document.removeEventListener("focusin", handleFocusIn2);
        document.removeEventListener("focusout", handleFocusOut2);
        mutationObserver.disconnect();
      };
    }
  }, [trapped, container, focusScope.paused]);
  reactExports.useEffect(() => {
    if (container) {
      focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === previouslyFocusedElement) {
            focus(container);
          }
        }
      }
      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) {
            focus(previouslyFocusedElement ?? document.body, { select: true });
          }
          container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
  const handleKeyDown = reactExports.useCallback(
    (event) => {
      if (!loop && !trapped) return;
      if (focusScope.paused) return;
      const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement;
      if (isTabKey && focusedElement) {
        const container2 = event.currentTarget;
        const [first, last] = getTabbableEdges(container2);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
          if (focusedElement === container2) event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { select: true });
          }
        }
      }
    },
    [loop, trapped, focusScope.paused]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
});
FocusScope.displayName = FOCUS_SCOPE_NAME;
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function findVisible(elements, container) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    }
  };
}
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}
var PORTAL_NAME$1 = "Portal";
var Portal$1 = reactExports.forwardRef((props, forwardedRef) => {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = reactExports.useState(false);
  useLayoutEffect2(() => setMounted(true), []);
  const container = containerProp || mounted && globalThis?.document?.body;
  return container ? ReactDOM.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
});
Portal$1.displayName = PORTAL_NAME$1;
var count = 0;
function useFocusGuards() {
  reactExports.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
    document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
    count++;
    return () => {
      if (count === 1) {
        document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
      }
      count--;
    };
  }, []);
}
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t2) {
    for (var s2, i2 = 1, n2 = arguments.length; i2 < n2; i2++) {
      s2 = arguments[i2];
      for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2)) t2[p2] = s2[p2];
    }
    return t2;
  };
  return __assign.apply(this, arguments);
};
function __rest(s2, e2) {
  var t2 = {};
  for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0)
    t2[p2] = s2[p2];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
      if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2]))
        t2[p2[i2]] = s2[p2[i2]];
    }
  return t2;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i2 = 0, l2 = from.length, ar; i2 < l2; i2++) {
    if (ar || !(i2 in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i2);
      ar[i2] = from[i2];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e2 = new Error(message);
  return e2.name = "SuppressedError", e2.error = error, e2.suppressed = suppressed, e2;
};
var zeroRightClassName = "right-scroll-bar-position";
var fullWidthClassName = "width-before-scroll-bar";
var noScrollbarsClassName = "with-scroll-bars-hidden";
var removedBarSizeVariable = "--removed-body-scroll-bar-size";
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
  return ref;
}
function useCallbackRef(initialValue, callback) {
  var ref = reactExports.useState(function() {
    return {
      // value
      value: initialValue,
      // last callback
      callback,
      // "memoized" public interface
      facade: {
        get current() {
          return ref.value;
        },
        set current(value) {
          var last = ref.value;
          if (last !== value) {
            ref.value = value;
            ref.callback(value, last);
          }
        }
      }
    };
  })[0];
  ref.callback = callback;
  return ref.facade;
}
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
var currentValues = /* @__PURE__ */ new WeakMap();
function useMergeRefs(refs, defaultValue) {
  var callbackRef = useCallbackRef(null, function(newValue) {
    return refs.forEach(function(ref) {
      return assignRef(ref, newValue);
    });
  });
  useIsomorphicLayoutEffect(function() {
    var oldValue = currentValues.get(callbackRef);
    if (oldValue) {
      var prevRefs_1 = new Set(oldValue);
      var nextRefs_1 = new Set(refs);
      var current_1 = callbackRef.current;
      prevRefs_1.forEach(function(ref) {
        if (!nextRefs_1.has(ref)) {
          assignRef(ref, null);
        }
      });
      nextRefs_1.forEach(function(ref) {
        if (!prevRefs_1.has(ref)) {
          assignRef(ref, current_1);
        }
      });
    }
    currentValues.set(callbackRef, refs);
  }, [refs]);
  return callbackRef;
}
function ItoI(a2) {
  return a2;
}
function innerCreateMedium(defaults, middleware) {
  if (middleware === void 0) {
    middleware = ItoI;
  }
  var buffer = [];
  var assigned = false;
  var medium = {
    read: function() {
      if (assigned) {
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      }
      if (buffer.length) {
        return buffer[buffer.length - 1];
      }
      return defaults;
    },
    useMedium: function(data) {
      var item = middleware(data, assigned);
      buffer.push(item);
      return function() {
        buffer = buffer.filter(function(x) {
          return x !== item;
        });
      };
    },
    assignSyncMedium: function(cb) {
      assigned = true;
      while (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
      }
      buffer = {
        push: function(x) {
          return cb(x);
        },
        filter: function() {
          return buffer;
        }
      };
    },
    assignMedium: function(cb) {
      assigned = true;
      var pendingQueue = [];
      if (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
        pendingQueue = buffer;
      }
      var executeQueue = function() {
        var cbs2 = pendingQueue;
        pendingQueue = [];
        cbs2.forEach(cb);
      };
      var cycle = function() {
        return Promise.resolve().then(executeQueue);
      };
      cycle();
      buffer = {
        push: function(x) {
          pendingQueue.push(x);
          cycle();
        },
        filter: function(filter) {
          pendingQueue = pendingQueue.filter(filter);
          return buffer;
        }
      };
    }
  };
  return medium;
}
function createSidecarMedium(options) {
  if (options === void 0) {
    options = {};
  }
  var medium = innerCreateMedium(null);
  medium.options = __assign({ async: true, ssr: false }, options);
  return medium;
}
var SideCar$1 = function(_a) {
  var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
  if (!sideCar) {
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  }
  var Target = sideCar.read();
  if (!Target) {
    throw new Error("Sidecar medium not found");
  }
  return reactExports.createElement(Target, __assign({}, rest));
};
SideCar$1.isSideCarExport = true;
function exportSidecar(medium, exported) {
  medium.useMedium(exported);
  return SideCar$1;
}
var effectCar = createSidecarMedium();
var nothing = function() {
  return;
};
var RemoveScroll = reactExports.forwardRef(function(props, parentRef) {
  var ref = reactExports.useRef(null);
  var _a = reactExports.useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    enabled && reactExports.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noRelative, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
    forwardProps ? reactExports.cloneElement(reactExports.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : reactExports.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};
var getNonce = function() {
  if (typeof __webpack_nonce__ !== "undefined") {
    return __webpack_nonce__;
  }
  return void 0;
};
function makeStyleTag() {
  if (!document)
    return null;
  var tag = document.createElement("style");
  tag.type = "text/css";
  var nonce = getNonce();
  if (nonce) {
    tag.setAttribute("nonce", nonce);
  }
  return tag;
}
function injectStyles(tag, css) {
  if (tag.styleSheet) {
    tag.styleSheet.cssText = css;
  } else {
    tag.appendChild(document.createTextNode(css));
  }
}
function insertStyleTag(tag) {
  var head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(tag);
}
var stylesheetSingleton = function() {
  var counter = 0;
  var stylesheet = null;
  return {
    add: function(style) {
      if (counter == 0) {
        if (stylesheet = makeStyleTag()) {
          injectStyles(stylesheet, style);
          insertStyleTag(stylesheet);
        }
      }
      counter++;
    },
    remove: function() {
      counter--;
      if (!counter && stylesheet) {
        stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
        stylesheet = null;
      }
    }
  };
};
var styleHookSingleton = function() {
  var sheet = stylesheetSingleton();
  return function(styles, isDynamic) {
    reactExports.useEffect(function() {
      sheet.add(styles);
      return function() {
        sheet.remove();
      };
    }, [styles && isDynamic]);
  };
};
var styleSingleton = function() {
  var useStyle = styleHookSingleton();
  var Sheet = function(_a) {
    var styles = _a.styles, dynamic = _a.dynamic;
    useStyle(styles, dynamic);
    return null;
  };
  return Sheet;
};
var zeroGap = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
};
var parse = function(x) {
  return parseInt(x || "", 10) || 0;
};
var getOffset = function(gapMode) {
  var cs = window.getComputedStyle(document.body);
  var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
  var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
  return [parse(left), parse(top), parse(right)];
};
var getGapWidth = function(gapMode) {
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  if (typeof window === "undefined") {
    return zeroGap;
  }
  var offsets = getOffset(gapMode);
  var documentWidth = document.documentElement.clientWidth;
  var windowWidth = window.innerWidth;
  return {
    left: offsets[0],
    top: offsets[1],
    right: offsets[2],
    gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
  };
};
var Style = styleSingleton();
var lockAttribute = "data-scroll-locked";
var getStyles = function(_a, allowRelative, gapMode, important) {
  var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
    allowRelative && "position: relative ".concat(important, ";"),
    gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
    gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
  ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
};
var getCurrentUseCounter = function() {
  var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
  return isFinite(counter) ? counter : 0;
};
var useLockAttribute = function() {
  reactExports.useEffect(function() {
    document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
    return function() {
      var newCounter = getCurrentUseCounter() - 1;
      if (newCounter <= 0) {
        document.body.removeAttribute(lockAttribute);
      } else {
        document.body.setAttribute(lockAttribute, newCounter.toString());
      }
    };
  }, []);
};
var RemoveScrollBar = function(_a) {
  var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
  useLockAttribute();
  var gap = reactExports.useMemo(function() {
    return getGapWidth(gapMode);
  }, [gapMode]);
  return reactExports.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
};
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    var options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var nonPassive = passiveSupported ? { passive: false } : false;
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  if (!(node instanceof Element)) {
    return false;
  }
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var ownerDocument = node.ownerDocument;
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    if (!target) {
      break;
    }
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    var parent_1 = target.parentNode;
    target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (Math.abs(availableScroll) < 1 || false)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (Math.abs(availableScrollTop) < 1 || false)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x, y2) {
  return x[0] === y2[0] && x[1] === y2[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = reactExports.useRef([]);
  var touchStartRef = reactExports.useRef([0, 0]);
  var activeAxis = reactExports.useRef();
  var id = reactExports.useState(idCounter++)[0];
  var Style2 = reactExports.useState(styleSingleton)[0];
  var lastProps = reactExports.useRef(props);
  reactExports.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  reactExports.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = reactExports.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var selection = window.getSelection();
    var anchorNode = selection && selection.anchorNode;
    var isTouchingSelection = anchorNode ? anchorNode === target || anchorNode.contains(target) : false;
    if (isTouchingSelection) {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY);
  }, []);
  var shouldPrevent = reactExports.useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e2) {
      return e2.name === event.type && (e2.target === event.target || event.target === e2.shadowParent) && deltaCompare(e2.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = reactExports.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e2) {
        return e2 !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = reactExports.useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = reactExports.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  reactExports.useEffect(function() {
    lockStack.push(Style2);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style2;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return reactExports.createElement(
    reactExports.Fragment,
    null,
    inert ? reactExports.createElement(Style2, { styles: generateStyle(id) }) : null,
    removeScrollBar ? reactExports.createElement(RemoveScrollBar, { noRelative: props.noRelative, gapMode: props.gapMode }) : null
  );
}
function getOutermostShadowParent(node) {
  var shadowParent = null;
  while (node !== null) {
    if (node instanceof ShadowRoot) {
      shadowParent = node.host;
      node = node.host;
    }
    node = node.parentNode;
  }
  return shadowParent;
}
const SideCar = exportSidecar(effectCar, RemoveScrollSideCar);
var ReactRemoveScroll = reactExports.forwardRef(function(props, ref) {
  return reactExports.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: SideCar }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
var getDefaultParent = function(originalTarget) {
  if (typeof document === "undefined") {
    return null;
  }
  var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return sampleTarget.ownerDocument.body;
};
var counterMap = /* @__PURE__ */ new WeakMap();
var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
var markerMap = {};
var lockCount = 0;
var unwrapHost = function(node) {
  return node && (node.host || unwrapHost(node.parentNode));
};
var correctTargets = function(parent, targets) {
  return targets.map(function(target) {
    if (parent.contains(target)) {
      return target;
    }
    var correctedTarget = unwrapHost(target);
    if (correctedTarget && parent.contains(correctedTarget)) {
      return correctedTarget;
    }
    console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
    return null;
  }).filter(function(x) {
    return Boolean(x);
  });
};
var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
  var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  if (!markerMap[markerName]) {
    markerMap[markerName] = /* @__PURE__ */ new WeakMap();
  }
  var markerCounter = markerMap[markerName];
  var hiddenNodes = [];
  var elementsToKeep = /* @__PURE__ */ new Set();
  var elementsToStop = new Set(targets);
  var keep = function(el) {
    if (!el || elementsToKeep.has(el)) {
      return;
    }
    elementsToKeep.add(el);
    keep(el.parentNode);
  };
  targets.forEach(keep);
  var deep = function(parent) {
    if (!parent || elementsToStop.has(parent)) {
      return;
    }
    Array.prototype.forEach.call(parent.children, function(node) {
      if (elementsToKeep.has(node)) {
        deep(node);
      } else {
        try {
          var attr = node.getAttribute(controlAttribute);
          var alreadyHidden = attr !== null && attr !== "false";
          var counterValue = (counterMap.get(node) || 0) + 1;
          var markerValue = (markerCounter.get(node) || 0) + 1;
          counterMap.set(node, counterValue);
          markerCounter.set(node, markerValue);
          hiddenNodes.push(node);
          if (counterValue === 1 && alreadyHidden) {
            uncontrolledNodes.set(node, true);
          }
          if (markerValue === 1) {
            node.setAttribute(markerName, "true");
          }
          if (!alreadyHidden) {
            node.setAttribute(controlAttribute, "true");
          }
        } catch (e2) {
          console.error("aria-hidden: cannot operate on ", node, e2);
        }
      }
    });
  };
  deep(parentNode);
  elementsToKeep.clear();
  lockCount++;
  return function() {
    hiddenNodes.forEach(function(node) {
      var counterValue = counterMap.get(node) - 1;
      var markerValue = markerCounter.get(node) - 1;
      counterMap.set(node, counterValue);
      markerCounter.set(node, markerValue);
      if (!counterValue) {
        if (!uncontrolledNodes.has(node)) {
          node.removeAttribute(controlAttribute);
        }
        uncontrolledNodes.delete(node);
      }
      if (!markerValue) {
        node.removeAttribute(markerName);
      }
    });
    lockCount--;
    if (!lockCount) {
      counterMap = /* @__PURE__ */ new WeakMap();
      counterMap = /* @__PURE__ */ new WeakMap();
      uncontrolledNodes = /* @__PURE__ */ new WeakMap();
      markerMap = {};
    }
  };
};
var hideOthers = function(originalTarget, parentNode, markerName) {
  if (markerName === void 0) {
    markerName = "data-aria-hidden";
  }
  var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  var activeParentNode = getDefaultParent(originalTarget);
  if (!activeParentNode) {
    return function() {
      return null;
    };
  }
  targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
  return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
};
var DIALOG_NAME = "Dialog";
var [createDialogContext] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger";
var DialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState$1(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
  forceMount: void 0
});
var DialogPortal = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: reactExports.Children.map(children, (child) => /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { asChild: true, container, children: child }) })) });
};
DialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay.displayName = OVERLAY_NAME;
var Slot = createSlot("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-state": getState$1(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME = "DialogContent";
var DialogContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent.displayName = CONTENT_NAME;
var DialogContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    reactExports.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    const hasPointerDownOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var DialogContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState$1(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
DialogClose.displayName = CLOSE_NAME;
function getState$1(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  reactExports.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  reactExports.useEffect(() => {
    const describedById = contentRef.current?.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
var Root$2 = Dialog;
var Trigger = DialogTrigger;
var Portal = DialogPortal;
var Overlay = DialogOverlay;
var Content = DialogContent;
var Title = DialogTitle;
var Description = DialogDescription;
var Close = DialogClose;
function usePrevious(value) {
  const ref = reactExports.useRef({ value, previous: value });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext] = createContextScope(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress.displayName = PROGRESS_NAME;
var INDICATOR_NAME = "ProgressIndicator";
var ProgressIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root$1 = Progress;
var Indicator = ProgressIndicator;
var SWITCH_NAME = "Switch";
var [createSwitchContext] = createContextScope(SWITCH_NAME);
var [SwitchProvider, useSwitchContext] = createSwitchContext(SWITCH_NAME);
var Switch = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSwitch,
      name,
      checked: checkedProp,
      defaultChecked,
      required,
      disabled,
      value = "on",
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    const [button, setButton] = reactExports.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setButton(node));
    const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
    const isFormControl = button ? form || !!button.closest("form") : true;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(SwitchProvider, { scope: __scopeSwitch, checked, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": checked,
          "aria-required": required,
          "data-state": getState(checked),
          "data-disabled": disabled ? "" : void 0,
          disabled,
          value,
          ...switchProps,
          ref: composedRefs,
          onClick: composeEventHandlers(props.onClick, (event) => {
            setChecked((prevChecked) => !prevChecked);
            if (isFormControl) {
              hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
              if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
            }
          })
        }
      ),
      isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        SwitchBubbleInput,
        {
          control: button,
          bubbles: !hasConsumerStoppedPropagationRef.current,
          name,
          value,
          checked,
          required,
          disabled,
          form,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
Switch.displayName = SWITCH_NAME;
var THUMB_NAME = "SwitchThumb";
var SwitchThumb = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...thumbProps,
        ref: forwardedRef
      }
    );
  }
);
SwitchThumb.displayName = THUMB_NAME;
var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
var SwitchBubbleInput = reactExports.forwardRef(
  ({
    __scopeSwitch,
    control,
    checked,
    bubbles = true,
    ...props
  }, forwardedRef) => {
    const ref = reactExports.useRef(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = ref.current;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [prevChecked, checked, bubbles]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: checked,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
SwitchBubbleInput.displayName = BUBBLE_INPUT_NAME;
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var Root = Switch;
var Thumb = SwitchThumb;
const o$8 = { asChild: { type: "boolean" } };
const t$7 = { width: { type: "string", className: "rt-r-w", customProperties: ["--width"], responsive: true }, minWidth: { type: "string", className: "rt-r-min-w", customProperties: ["--min-width"], responsive: true }, maxWidth: { type: "string", className: "rt-r-max-w", customProperties: ["--max-width"], responsive: true } };
const e$g = { height: { type: "string", className: "rt-r-h", customProperties: ["--height"], responsive: true }, minHeight: { type: "string", className: "rt-r-min-h", customProperties: ["--min-height"], responsive: true }, maxHeight: { type: "string", className: "rt-r-max-h", customProperties: ["--max-height"], responsive: true } };
const r$9 = ["1", "2", "3", "4"], s$6 = { ...o$8, align: { type: "enum", className: "rt-r-align", values: ["start", "center"], default: "center" }, size: { type: "enum", className: "rt-r-size", values: r$9, default: "3", responsive: true }, width: t$7.width, minWidth: t$7.minWidth, maxWidth: { ...t$7.maxWidth, default: "600px" }, ...e$g };
const o$7 = ["gray", "gold", "bronze", "brown", "yellow", "amber", "orange", "tomato", "red", "ruby", "crimson", "pink", "plum", "purple", "violet", "iris", "indigo", "blue", "cyan", "teal", "jade", "green", "grass", "lime", "mint", "sky"], r$8 = { color: { type: "enum", values: o$7, default: void 0 } }, s$5 = { color: { type: "enum", values: o$7, default: "" } };
const o$6 = { highContrast: { type: "boolean", className: "rt-high-contrast", default: void 0 } };
const e$f = ["normal", "start", "end", "both"], r$7 = { trim: { type: "enum", className: "rt-r-lt", values: e$f, responsive: true } };
const e$e = ["left", "center", "right"], t$6 = { align: { type: "enum", className: "rt-r-ta", values: e$e, responsive: true } };
const e$d = ["wrap", "nowrap", "pretty", "balance"], r$6 = { wrap: { type: "enum", className: "rt-r-tw", values: e$d, responsive: true } };
const e$c = { truncate: { type: "boolean", className: "rt-truncate" } };
const e$b = ["light", "regular", "medium", "bold"], t$5 = { weight: { type: "enum", className: "rt-r-weight", values: e$b, responsive: true } };
const m$3 = ["h1", "h2", "h3", "h4", "h5", "h6"], a$8 = ["1", "2", "3", "4", "5", "6", "7", "8", "9"], n$5 = { as: { type: "enum", values: m$3, default: "h1" }, ...o$8, size: { type: "enum", className: "rt-r-size", values: a$8, default: "6", responsive: true }, ...t$5, ...t$6, ...r$7, ...e$c, ...r$6, ...r$8, ...o$6 };
const e$a = ["initial", "xs", "sm", "md", "lg", "xl"];
function e$9(n2, r2) {
  return Object.prototype.hasOwnProperty.call(n2, r2);
}
function i$3(e2) {
  return typeof e2 == "object" && Object.keys(e2).some((s2) => e$a.includes(s2));
}
function R({ className: r2, customProperties: n2, ...t2 }) {
  const p2 = g$1({ allowArbitraryValues: true, className: r2, ...t2 }), e2 = m$2({ customProperties: n2, ...t2 });
  return [p2, e2];
}
function g$1({ allowArbitraryValues: r2, value: n2, className: t2, propValues: p2, parseValue: e2 = (s2) => s2 }) {
  const s2 = [];
  if (n2) {
    if (typeof n2 == "string" && p2.includes(n2)) return l$2(t2, n2, e2);
    if (i$3(n2)) {
      const i2 = n2;
      for (const o2 in i2) {
        if (!e$9(i2, o2) || !e$a.includes(o2)) continue;
        const u2 = i2[o2];
        if (u2 !== void 0) {
          if (p2.includes(u2)) {
            const f2 = l$2(t2, u2, e2), v2 = o2 === "initial" ? f2 : `${o2}:${f2}`;
            s2.push(v2);
          } else if (r2) {
            const f2 = o2 === "initial" ? t2 : `${o2}:${t2}`;
            s2.push(f2);
          }
        }
      }
      return s2.join(" ");
    }
    if (r2) return t2;
  }
}
function l$2(r2, n2, t2) {
  const p2 = r2 ? "-" : "", e2 = t2(n2), s2 = e2?.startsWith("-"), i2 = s2 ? "-" : "", o2 = s2 ? e2?.substring(1) : e2;
  return `${i2}${r2}${p2}${o2}`;
}
function m$2({ customProperties: r2, value: n2, propValues: t2, parseValue: p2 = (e2) => e2 }) {
  let e2 = {};
  if (!(!n2 || typeof n2 == "string" && t2.includes(n2))) {
    if (typeof n2 == "string" && (e2 = Object.fromEntries(r2.map((s2) => [s2, n2]))), i$3(n2)) {
      const s2 = n2;
      for (const i2 in s2) {
        if (!e$9(s2, i2) || !e$a.includes(i2)) continue;
        const o2 = s2[i2];
        if (!t2.includes(o2)) for (const u2 of r2) e2 = { [i2 === "initial" ? u2 : `${u2}-${i2}`]: o2, ...e2 };
      }
    }
    for (const s2 in e2) {
      const i2 = e2[s2];
      i2 !== void 0 && (e2[s2] = p2(i2));
    }
    return e2;
  }
}
function l$1(...t2) {
  let e2 = {};
  for (const n2 of t2) n2 && (e2 = { ...e2, ...n2 });
  return Object.keys(e2).length ? e2 : void 0;
}
function N(...r2) {
  return Object.assign({}, ...r2);
}
function v(r2, ...m2) {
  let t2, l2;
  const a2 = { ...r2 }, f2 = N(...m2);
  for (const n2 in f2) {
    let s2 = a2[n2];
    const e2 = f2[n2];
    if (e2.default !== void 0 && s2 === void 0 && (s2 = e2.default), e2.type === "enum" && ![e2.default, ...e2.values].includes(s2) && !i$3(s2) && (s2 = e2.default), a2[n2] = s2, "className" in e2 && e2.className) {
      delete a2[n2];
      const u2 = "responsive" in e2;
      if (!s2 || i$3(s2) && !u2) continue;
      if (i$3(s2) && (e2.default !== void 0 && s2.initial === void 0 && (s2.initial = e2.default), e2.type === "enum" && ([e2.default, ...e2.values].includes(s2.initial) || (s2.initial = e2.default))), e2.type === "enum") {
        const i2 = g$1({ allowArbitraryValues: false, value: s2, className: e2.className, propValues: e2.values, parseValue: e2.parseValue });
        t2 = y(t2, i2);
        continue;
      }
      if (e2.type === "string" || e2.type === "enum | string") {
        const i2 = e2.type === "string" ? [] : e2.values, [d2, y$1] = R({ className: e2.className, customProperties: e2.customProperties, propValues: i2, parseValue: e2.parseValue, value: s2 });
        l2 = l$1(l2, y$1), t2 = y(t2, d2);
        continue;
      }
      if (e2.type === "boolean" && s2) {
        t2 = y(t2, e2.className);
        continue;
      }
    }
  }
  return a2.className = y(t2, r2.className), a2.style = l$1(l2, r2.style), a2;
}
const e$8 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"], r$5 = { m: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-m", customProperties: ["--m"] }, mx: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-mx", customProperties: ["--ml", "--mr"] }, my: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-my", customProperties: ["--mt", "--mb"] }, mt: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-mt", customProperties: ["--mt"] }, mr: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-mr", customProperties: ["--mr"] }, mb: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-mb", customProperties: ["--mb"] }, ml: { type: "enum | string", values: e$8, responsive: true, className: "rt-r-ml", customProperties: ["--ml"] } };
const r$4 = reactExports.forwardRef((p2, t2) => {
  const { children: e2, className: s2, asChild: a2, as: n2 = "h1", color: i2, ...m2 } = v(p2, n$5, r$5);
  return reactExports.createElement(Slot$1, { "data-accent-color": i2, ...m2, ref: t2, className: y("rt-Heading", s2) }, a2 ? e2 : reactExports.createElement(n2, null, e2));
});
r$4.displayName = "Heading";
const m$1 = ["span", "div", "label", "p"], a$7 = ["1", "2", "3", "4", "5", "6", "7", "8", "9"], n$4 = { as: { type: "enum", values: m$1, default: "span" }, ...o$8, size: { type: "enum", className: "rt-r-size", values: a$7, responsive: true }, ...t$5, ...t$6, ...r$7, ...e$c, ...r$6, ...r$8, ...o$6 };
const p$7 = reactExports.forwardRef((t2, r2) => {
  const { children: e2, className: s2, asChild: m2, as: a2 = "span", color: n2, ...P } = v(t2, n$4, r$5);
  return reactExports.createElement(Slot$1, { "data-accent-color": n2, ...P, ref: r2, className: y("rt-Text", s2) }, m2 ? e2 : reactExports.createElement(a2, null, e2));
});
p$7.displayName = "Text";
const e$7 = ["none", "small", "medium", "large", "full"], r$3 = { radius: { type: "enum", values: e$7, default: void 0 } };
const a$6 = (t2) => {
  if (!reactExports.isValidElement(t2)) throw Error(`Expected a single React Element child, but got: ${reactExports.Children.toArray(t2).map((e2) => typeof e2 == "object" && "type" in e2 && typeof e2.type == "string" ? e2.type : typeof e2).join(", ")}`);
  return t2;
};
const t$4 = ["1", "2", "3"], a$5 = ["solid", "soft", "surface", "outline"], p$6 = { ...o$8, size: { type: "enum", className: "rt-r-size", values: t$4, default: "1", responsive: true }, variant: { type: "enum", className: "rt-variant", values: a$5, default: "soft" }, ...s$5, ...o$6, ...r$3 };
const e$6 = reactExports.forwardRef((r2, p2) => {
  const { asChild: t2, className: s2, color: a2, radius: m2, ...n2 } = v(r2, p$6, r$5), d2 = t2 ? Slot$1 : "span";
  return reactExports.createElement(d2, { "data-accent-color": a2, "data-radius": m2, ...n2, ref: p2, className: y("rt-reset", "rt-Badge", s2) });
});
e$6.displayName = "Badge";
const e$5 = Slot$1;
const e$4 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], p$5 = { p: { type: "enum | string", className: "rt-r-p", customProperties: ["--p"], values: e$4, responsive: true }, px: { type: "enum | string", className: "rt-r-px", customProperties: ["--pl", "--pr"], values: e$4, responsive: true }, py: { type: "enum | string", className: "rt-r-py", customProperties: ["--pt", "--pb"], values: e$4, responsive: true }, pt: { type: "enum | string", className: "rt-r-pt", customProperties: ["--pt"], values: e$4, responsive: true }, pr: { type: "enum | string", className: "rt-r-pr", customProperties: ["--pr"], values: e$4, responsive: true }, pb: { type: "enum | string", className: "rt-r-pb", customProperties: ["--pb"], values: e$4, responsive: true }, pl: { type: "enum | string", className: "rt-r-pl", customProperties: ["--pl"], values: e$4, responsive: true } };
const r$2 = ["visible", "hidden", "clip", "scroll", "auto"], i$2 = ["static", "relative", "absolute", "fixed", "sticky"], e$3 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9"], p$4 = ["0", "1"], n$3 = ["0", "1"], u$1 = { ...p$5, ...t$7, ...e$g, position: { type: "enum", className: "rt-r-position", values: i$2, responsive: true }, inset: { type: "enum | string", className: "rt-r-inset", customProperties: ["--inset"], values: e$3, responsive: true }, top: { type: "enum | string", className: "rt-r-top", customProperties: ["--top"], values: e$3, responsive: true }, right: { type: "enum | string", className: "rt-r-right", customProperties: ["--right"], values: e$3, responsive: true }, bottom: { type: "enum | string", className: "rt-r-bottom", customProperties: ["--bottom"], values: e$3, responsive: true }, left: { type: "enum | string", className: "rt-r-left", customProperties: ["--left"], values: e$3, responsive: true }, overflow: { type: "enum", className: "rt-r-overflow", values: r$2, responsive: true }, overflowX: { type: "enum", className: "rt-r-ox", values: r$2, responsive: true }, overflowY: { type: "enum", className: "rt-r-oy", values: r$2, responsive: true }, flexBasis: { type: "string", className: "rt-r-fb", customProperties: ["--flex-basis"], responsive: true }, flexShrink: { type: "enum | string", className: "rt-r-fs", customProperties: ["--flex-shrink"], values: p$4, responsive: true }, flexGrow: { type: "enum | string", className: "rt-r-fg", customProperties: ["--flex-grow"], values: n$3, responsive: true }, gridArea: { type: "string", className: "rt-r-ga", customProperties: ["--grid-area"], responsive: true }, gridColumn: { type: "string", className: "rt-r-gc", customProperties: ["--grid-column"], responsive: true }, gridColumnStart: { type: "string", className: "rt-r-gcs", customProperties: ["--grid-column-start"], responsive: true }, gridColumnEnd: { type: "string", className: "rt-r-gce", customProperties: ["--grid-column-end"], responsive: true }, gridRow: { type: "string", className: "rt-r-gr", customProperties: ["--grid-row"], responsive: true }, gridRowStart: { type: "string", className: "rt-r-grs", customProperties: ["--grid-row-start"], responsive: true }, gridRowEnd: { type: "string", className: "rt-r-gre", customProperties: ["--grid-row-end"], responsive: true } };
const t$3 = ["1", "2", "3", "4"], a$4 = ["classic", "solid", "soft", "surface", "outline", "ghost"], i$1 = { ...o$8, size: { type: "enum", className: "rt-r-size", values: t$3, default: "2", responsive: true }, variant: { type: "enum", className: "rt-variant", values: a$4, default: "solid" }, ...s$5, ...o$6, ...r$3, loading: { type: "boolean", className: "rt-loading", default: false } };
const e$2 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], p$3 = { gap: { type: "enum | string", className: "rt-r-gap", customProperties: ["--gap"], values: e$2, responsive: true }, gapX: { type: "enum | string", className: "rt-r-cg", customProperties: ["--column-gap"], values: e$2, responsive: true }, gapY: { type: "enum | string", className: "rt-r-rg", customProperties: ["--row-gap"], values: e$2, responsive: true } };
const t$2 = ["div", "span"], p$2 = ["none", "inline-flex", "flex"], a$3 = ["row", "column", "row-reverse", "column-reverse"], o$5 = ["start", "center", "end", "baseline", "stretch"], n$2 = ["start", "center", "end", "between"], l = ["nowrap", "wrap", "wrap-reverse"], u = { as: { type: "enum", values: t$2, default: "div" }, ...o$8, display: { type: "enum", className: "rt-r-display", values: p$2, responsive: true }, direction: { type: "enum", className: "rt-r-fd", values: a$3, responsive: true }, align: { type: "enum", className: "rt-r-ai", values: o$5, responsive: true }, justify: { type: "enum", className: "rt-r-jc", values: n$2, parseValue: f, responsive: true }, wrap: { type: "enum", className: "rt-r-fw", values: l, responsive: true }, ...p$3 };
function f(e2) {
  return e2 === "between" ? "space-between" : e2;
}
const p$1 = reactExports.forwardRef((r2, e2) => {
  const { className: s2, asChild: t2, as: m2 = "div", ...l2 } = v(r2, u, u$1, r$5);
  return reactExports.createElement(t2 ? e$5 : m2, { ...l2, ref: e2, className: y("rt-Flex", s2) });
});
p$1.displayName = "Flex";
const e$1 = ["1", "2", "3"], s$4 = { size: { type: "enum", className: "rt-r-size", values: e$1, default: "2", responsive: true }, loading: { type: "boolean", default: true } };
const s$3 = reactExports.forwardRef((i2, o2) => {
  const { className: a2, children: e2, loading: t2, ...m2 } = v(i2, s$4, r$5);
  if (!t2) return e2;
  const r2 = reactExports.createElement("span", { ...m2, ref: o2, className: y("rt-Spinner", a2) }, reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }), reactExports.createElement("span", { className: "rt-SpinnerLeaf" }));
  return e2 === void 0 ? r2 : reactExports.createElement(p$1, { asChild: true, position: "relative", align: "center", justify: "center" }, reactExports.createElement("span", null, reactExports.createElement("span", { "aria-hidden": true, style: { display: "contents", visibility: "hidden" }, inert: void 0 }, e2), reactExports.createElement(p$1, { asChild: true, align: "center", justify: "center", position: "absolute", inset: "0" }, reactExports.createElement("span", null, r2))));
});
s$3.displayName = "Spinner";
const d = Root$3;
function s$2(e2, t2) {
  if (e2 !== void 0) return typeof e2 == "string" ? t2(e2) : Object.fromEntries(Object.entries(e2).map(([n2, o2]) => [n2, t2(o2)]));
}
function r$1(e2) {
  switch (e2) {
    case "1":
      return "1";
    case "2":
    case "3":
      return "2";
    case "4":
      return "3";
  }
}
const n$1 = reactExports.forwardRef((t2, p2) => {
  const { size: i2 = i$1.size.default } = t2, { className: a2, children: e2, asChild: m2, color: d$1, radius: l2, disabled: s2 = t2.loading, ...u2 } = v(t2, i$1, r$5), f2 = m2 ? Slot$1 : "button";
  return reactExports.createElement(f2, { "data-disabled": s2 || void 0, "data-accent-color": d$1, "data-radius": l2, ...u2, ref: p2, className: y("rt-reset", "rt-BaseButton", a2), disabled: s2 }, t2.loading ? reactExports.createElement(reactExports.Fragment, null, reactExports.createElement("span", { style: { display: "contents", visibility: "hidden" }, "aria-hidden": true }, e2), reactExports.createElement(d, null, e2), reactExports.createElement(p$1, { asChild: true, align: "center", justify: "center", position: "absolute", inset: "0" }, reactExports.createElement("span", null, reactExports.createElement(s$3, { size: s$2(i2, r$1) })))) : e2);
});
n$1.displayName = "BaseButton";
const o$4 = reactExports.forwardRef(({ className: e2, ...n2 }, r2) => reactExports.createElement(n$1, { ...n2, ref: r2, className: y("rt-Button", e2) }));
o$4.displayName = "Button";
const e = ["1", "2", "3", "4", "5"], r = ["surface", "classic", "ghost"], a$2 = { ...o$8, size: { type: "enum", className: "rt-r-size", values: e, default: "1", responsive: true }, variant: { type: "enum", className: "rt-variant", values: r, default: "surface" } };
const o$3 = reactExports.forwardRef((p2, e2) => {
  const { asChild: t2, className: s2, ...a2 } = v(p2, a$2, r$5), m2 = t2 ? Slot$1 : "div";
  return reactExports.createElement(m2, { ref: e2, ...a2, className: y("rt-reset", "rt-BaseCard", "rt-Card", s2) });
});
o$3.displayName = "Card";
const s$1 = (e2) => reactExports.createElement(Root$2, { ...e2, modal: true });
s$1.displayName = "Dialog.Root";
const n = reactExports.forwardRef(({ children: e2, ...i2 }, r2) => reactExports.createElement(Trigger, { ...i2, ref: r2, asChild: true }, a$6(e2)));
n.displayName = "Dialog.Trigger";
const p = reactExports.forwardRef(({ align: e2, ...i2 }, r2) => {
  const { align: P, ...f2 } = s$6, { className: C } = v({ align: e2 }, { align: P }), { className: d2, forceMount: c, container: y$1, ...T } = v(i2, f2);
  return reactExports.createElement(Portal, { container: y$1, forceMount: c }, reactExports.createElement(R$1, { asChild: true }, reactExports.createElement(Overlay, { className: "rt-BaseDialogOverlay rt-DialogOverlay" }, reactExports.createElement("div", { className: "rt-BaseDialogScroll rt-DialogScroll" }, reactExports.createElement("div", { className: `rt-BaseDialogScrollPadding rt-DialogScrollPadding ${C}` }, reactExports.createElement(Content, { ...T, ref: r2, className: y("rt-BaseDialogContent", "rt-DialogContent", d2) }))))));
});
p.displayName = "Dialog.Content";
const g = reactExports.forwardRef((e2, i2) => reactExports.createElement(Title, { asChild: true }, reactExports.createElement(r$4, { size: "5", mb: "3", trim: "start", ...e2, asChild: false, ref: i2 })));
g.displayName = "Dialog.Title";
const m = reactExports.forwardRef((e2, i2) => reactExports.createElement(Description, { asChild: true }, reactExports.createElement(p$7, { as: "p", size: "3", ...e2, asChild: false, ref: i2 })));
m.displayName = "Dialog.Description";
const D = reactExports.forwardRef(({ children: e2, ...i2 }, r2) => reactExports.createElement(Close, { ...i2, ref: r2, asChild: true }, a$6(e2)));
D.displayName = "Dialog.Close";
const o$2 = reactExports.forwardRef(({ className: e2, ...n2 }, r2) => reactExports.createElement(n$1, { ...n2, ref: r2, className: y("rt-IconButton", e2) }));
o$2.displayName = "IconButton";
const o$1 = ["1", "2", "3"], t$1 = ["classic", "surface", "soft"], a$1 = { size: { type: "enum", className: "rt-r-size", values: o$1, default: "2", responsive: true }, variant: { type: "enum", className: "rt-variant", values: t$1, default: "surface" }, ...r$8, ...o$6, ...r$3, duration: { type: "string" } };
const s = reactExports.forwardRef((p2, t2) => {
  const { className: m2, style: i2, color: a2, radius: n2, duration: P, ...r2 } = v(p2, a$1, r$5);
  return reactExports.createElement(Root$1, { "data-accent-color": a2, "data-radius": n2, ref: t2, className: y("rt-ProgressRoot", m2), style: l$1({ "--progress-duration": "value" in r2 ? void 0 : P, "--progress-value": "value" in r2 ? r2.value : void 0, "--progress-max": "max" in r2 ? r2.max : void 0 }, i2), ...r2, asChild: false }, reactExports.createElement(Indicator, { className: "rt-ProgressIndicator" }));
});
s.displayName = "Progress";
const o = ["1", "2", "3"], t = ["classic", "surface", "soft"], a = { size: { type: "enum", className: "rt-r-size", values: o, default: "2", responsive: true }, variant: { type: "enum", className: "rt-variant", values: t, default: "surface" }, ...r$8, ...o$6, ...r$3 };
const i = reactExports.forwardRef((o2, p2) => {
  const { className: s2, color: m2, radius: c, ...a$12 } = v(o2, a, r$5);
  return reactExports.createElement(Root, { "data-accent-color": m2, "data-radius": c, ...a$12, asChild: false, ref: p2, className: y("rt-reset", "rt-SwitchRoot", s2) }, reactExports.createElement(Thumb, { className: y("rt-SwitchThumb", { "rt-high-contrast": o2.highContrast }) }));
});
i.displayName = "Switch";
const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
};
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const Icon = reactExports.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports.forwardRef(
    ({ className, ...props }, ref) => reactExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
const __iconNode$5 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$5);
const __iconNode$4 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  [
    "path",
    {
      d: "M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z",
      key: "1tzo1f"
    }
  ]
];
const FilePlay = createLucideIcon("file-play", __iconNode$4);
const __iconNode$3 = [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
];
const Folder = createLucideIcon("folder", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
      key: "10ikf1"
    }
  ]
];
const Play = createLucideIcon("play", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M14 17H5", key: "gfn3mx" }],
  ["path", { d: "M19 7h-9", key: "6i9tg" }],
  ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }],
  ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]
];
const Settings2 = createLucideIcon("settings-2", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 19h8", key: "baeox8" }],
  ["path", { d: "m4 17 6-6-6-6", key: "1yngyt" }]
];
const Terminal = createLucideIcon("terminal", __iconNode);
function ChefHatIcon({ size, color }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      height: size,
      viewBox: "0 -960 960 960",
      width: size,
      fill: color,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M360-400h80v-200h-80v200Zm-160-60q-46-23-73-66.5T100-621q0-75 51.5-127T278-800q12 0 24.5 2t24.5 5q25-41 65-64t88-23q48 0 88 23t65 64q12-3 24-5t25-2q75 0 126.5 52T860-621q0 51-27 94.5T760-460v220H200v-220Zm320 60h80v-200h-80v200Zm-240 80h400v-189l44-22q26-13 41-36.5t15-52.5q0-42-28.5-71T682-720q-11 0-20 2t-19 5l-47 13-31-52q-14-23-36.5-35.5T480-800q-26 0-48.5 12.5T395-752l-31 52-48-13q-10-2-19.5-4.5T277-720q-41 0-69 29t-28 71q0 29 15 52.5t41 36.5l44 22v189Zm-80 80h80v80h400v-80h80v160H200v-160Zm280-80Z" })
    }
  );
}
function Logo() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChefHatIcon, { size: 40, color: "#e3e3e3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl pt-3", children: [
        "HLS ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[#FF5733]", children: "Cooker" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { size: "2", color: "gray", children: "Batch process your media files" })
  ] });
}
function Logs() {
  const [logs, setLogs] = reactExports.useState([]);
  const theme = H();
  const ref = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.rendererReady();
    const onLog = (msg) => {
      setLogs((prev) => prev.includes(msg) ? prev : [...prev, msg]);
    };
    window.electronAPI.onLog(onLog);
    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners("log");
      }
    };
  }, []);
  reactExports.useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [logs]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(o$3, { size: "2", className: "bg-slate-900 border-none shadow-inner", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `flex items-center justify-between gap-2 mb-2 ${theme.appearance === "dark" ? "text-slate-400" : "text-slate-600"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { size: 18 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { size: "1", weight: "bold", className: "uppercase tracking-widest", children: "System Logs" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            o$4,
            {
              size: "1",
              color: "gray",
              className: "uppercase tracking-widest",
              onClick: () => {
                setLogs([]);
              },
              children: "Clear"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-32 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col pt-2", children: [
      logs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        p$7,
        {
          color: "gray",
          className: `italic opacity-50 ${theme.appearance === "dark" ? "text-slate-400" : "text-slate-600"}`,
          children: "No logs yet..."
        }
      ),
      logs.map((l2, i2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          ref: i2 === logs.length - 1 ? ref : null,
          className: l2.toLowerCase().includes("error") ? theme.appearance === "dark" ? "text-red-400" : "text-red-800" : theme.appearance === "dark" ? "text-green-400" : "text-green-800",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-50 mr-2 text-slate-500", children: [
              "[",
              (/* @__PURE__ */ new Date()).toLocaleTimeString(),
              "]"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2 opacity-70", children: "$" }),
            l2
          ]
        },
        i2
      ))
    ] })
  ] });
}
function useLoading({ setLoading, progress, files }) {
  reactExports.useEffect(() => {
    if (files.length === 0) {
      setLoading(false);
      return;
    }
    const isEncoding = files.some((_, idx) => {
      const p2 = progress[idx];
      return p2 && !p2.done;
    });
    setLoading(isEncoding);
  }, [progress, files]);
}
function useElectron({
  setProgress
}) {
  reactExports.useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.rendererReady();
    const onProgress = (data) => {
      setProgress((prev) => ({
        ...prev,
        [data.idx]: { perc: data.perc, eta: data.eta, done: false }
      }));
    };
    const onDone = (idx) => {
      setProgress((prev) => ({
        ...prev,
        [idx]: { perc: 100, done: true }
      }));
    };
    window.electronAPI.onUpdateProgress(onProgress);
    window.electronAPI.onDoneFile(onDone);
    return () => {
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.removeAllListeners("update-progress");
        window.electron.ipcRenderer.removeAllListeners("done-file");
      }
    };
  }, []);
}
function Configuration({
  setFiles,
  setProgress,
  files,
  outputDir
}) {
  const selectFiles = async () => {
    const selected = await window.electronAPI.selectFiles();
    if (selected?.length) {
      setFiles(selected);
      setProgress({});
    }
  };
  const openOutputDir = async () => {
    if (outputDir) {
      await window.electronAPI.openInExplorer(outputDir);
    } else {
      alert("You are using the source folder as output folder.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(o$3, { size: "3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { as: "div", size: "3", weight: "bold", mb: "3", children: "Configuration" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(o$4, { onClick: selectFiles, variant: "soft", className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilePlay, { size: 16 }),
        " Select Source Videos"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        o$4,
        {
          onClick: openOutputDir,
          variant: "soft",
          color: "gray",
          className: "cursor-pointer w-full max-w-75",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Folder, { size: 16, className: "shrink-0" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { as: "div", size: "2", className: "truncate min-w-0 flex-1", children: outputDir ?? "Source folder" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col mt-2 p-3 rounded-md gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { as: "div", size: "1", weight: "bold", color: "gray", className: "uppercase mb-1", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FilePlay, { size: 18 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(p$7, { as: "div", size: "2", className: "truncate", children: [
            files.length,
            " files selected"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function EncodingQueue({
  files,
  progress,
  cancelFile
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(o$3, { size: "3", className: "flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { as: "div", size: "3", weight: "bold", mb: "4", children: "Encoding Queue" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 max-h-75 overflow-y-auto pr-2", children: [
      files.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-10 text-center border-2 border-dashed rounded-xl border-orange-200 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FilePlay, { size: 48, color: "gray" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { color: "gray", children: "Queue is empty. Select files to begin." })
      ] }),
      files.map((f2, i2) => {
        const p2 = progress[i2];
        const fileName = f2.split(/[\\/]/).pop();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-300 rounded-lg p-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { size: "2", weight: "bold", className: "truncate max-w-[70%]", children: fileName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              p2?.done ? /* @__PURE__ */ jsxRuntimeExports.jsx(e$6, { color: "green", children: "Done" }) : p2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(e$6, { color: "blue", children: "Processing" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(e$6, { color: "gray", children: "Waiting" }),
              !p2?.done && /* @__PURE__ */ jsxRuntimeExports.jsx(
                o$2,
                {
                  size: "1",
                  variant: "ghost",
                  color: "red",
                  radius: "full",
                  onClick: () => cancelFile(i2),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { size: 16 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(s, { value: p2?.perc ?? 0, color: p2?.done ? "green" : "blue", size: "2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { size: "1", color: "gray", children: p2 ? `${p2.perc.toFixed(1)}%` : "0%" }),
            p2?.eta && !p2.done && /* @__PURE__ */ jsxRuntimeExports.jsxs(p$7, { size: "1", color: "gray", children: [
              "ETA: ",
              p2.eta
            ] })
          ] })
        ] }, i2);
      })
    ] })
  ] });
}
const RESOLUTIONS = ["240p", "360p", "480p", "720p", "1080p"];
function ResolutionSelector({ toggles, setToggles }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(o$3, { size: "3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { as: "div", size: "3", weight: "bold", mb: "3", children: "Target Resolutions" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-4", children: RESOLUTIONS.map((res, i$12) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2  p-2 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(p$7, { size: "2", weight: "medium", children: res }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        i,
        {
          checked: toggles[i$12],
          onCheckedChange: () => setToggles((prev) => prev.map((v2, idx) => idx === i$12 ? !v2 : v2))
        }
      )
    ] }, res)) })
  ] });
}
const ThemeContext = reactExports.createContext({
  theme: "dark",
  // eslint-disable-next-line
  setTheme: (_t) => {
  }
});
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = reactExports.useState(
    localStorage.getItem("app-theme") || "dark"
  );
  reactExports.useEffect(() => {
    localStorage.setItem("app-theme", theme);
  }, [theme]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeContext.Provider, { value: { theme, setTheme }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(R$1, { appearance: theme, accentColor: "orange", children }) });
};
const useAppTheme = () => reactExports.useContext(ThemeContext);
function Settings({
  outputDir,
  setOutputDir
}) {
  const { theme, setTheme } = useAppTheme();
  const selectOutputDir = async () => {
    const dir = await window.electronAPI.selectOutputDir();
    if (dir) {
      localStorage.setItem("outputDir", dir);
      setOutputDir(dir);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(s$1, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(n, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(o$2, { variant: "ghost", color: "gray", radius: "full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings2, { size: 20 }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(p, { maxWidth: "450px", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(g, { children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(m, { size: "2", mb: "4", children: "Manage your application preferences and output destinations." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-slate-11", children: "Output Directory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-3 py-1.5 bg-slate-3 border border-slate-6 rounded-md text-sm truncate", children: outputDir ?? "Source Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(o$4, { variant: "outline", onClick: selectOutputDir, children: "Browse" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-slate-12", children: "Dark Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-11", children: "Adjust the appearance of the interface" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            i,
            {
              checked: theme === "dark",
              onCheckedChange: (checked) => setTheme(checked ? "dark" : "light")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-8 flex justify-end gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(D, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(o$4, { variant: "soft", color: "gray", children: "Close" }) }) })
    ] })
  ] });
}
function App() {
  const [files, setFiles] = reactExports.useState([]);
  const [outputDir, setOutputDir] = reactExports.useState(() => localStorage.getItem("outputDir"));
  const [toggles, setToggles] = reactExports.useState([true, true, true, true, true]);
  const [progress, setProgress] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  useElectron({ setProgress });
  useLoading({ setLoading, progress, files });
  const startEncode = () => {
    setLoading(true);
    if (!files.length) {
      alert("Please select files first");
      return;
    }
    const choices = toggles.map((v2) => v2 ? "y" : "n");
    window.electronAPI.runEncode({ files, choices, outputDir });
  };
  const cancelFile = (idx) => {
    window.electronAPI.cancelFile(idx);
    setProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[idx];
      return newProgress;
    });
    setLoading(false);
    setFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(idx, 1);
      return newFiles;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 flex flex-col gap-6 font-sans w-full h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { outputDir, setOutputDir })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-1 flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Configuration,
          {
            setFiles,
            setProgress,
            files,
            outputDir
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResolutionSelector, { toggles, setToggles }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          o$4,
          {
            size: "4",
            loading,
            onClick: startEncode,
            disabled: files.length === 0 || toggles.every((t2) => !t2) || loading,
            className: "w-full cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 18, fill: "currentColor" }),
              " START ENCODING"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2 flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(EncodingQueue, { files, progress, cancelFile }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logs, {})
      ] })
    ] })
  ] });
}
clientExports.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) })
);
