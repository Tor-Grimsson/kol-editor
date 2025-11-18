import {
  AccessibilitySystem,
  DOMPipe,
  EventSystem,
  FederatedContainer,
  accessibilityTarget
} from "./chunk-7JGELBM5.js";
import "./chunk-LRBJIAYH.js";
import "./chunk-MMWKNZUD.js";
import "./chunk-VOPLUIIP.js";
import {
  Container,
  extensions
} from "./chunk-KAPQV3DN.js";
import "./chunk-5WRI5ZAA.js";

// node_modules/pixi.js/lib/accessibility/init.mjs
extensions.add(AccessibilitySystem);
extensions.mixin(Container, accessibilityTarget);

// node_modules/pixi.js/lib/events/init.mjs
extensions.add(EventSystem);
extensions.mixin(Container, FederatedContainer);

// node_modules/pixi.js/lib/dom/init.mjs
extensions.add(DOMPipe);
//# sourceMappingURL=browserAll-SICNR5YL.js.map
