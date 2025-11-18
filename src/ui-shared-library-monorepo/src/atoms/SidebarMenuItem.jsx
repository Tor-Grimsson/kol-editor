import { NavLink, useInRouterContext } from "react-router-dom";
import Icon from "./icons/Icon.jsx";

/**
 * SidebarMenuItem - Flexible menu item for sidebar navigation
 *
 * Handles both button groups (with children) and direct links
 *
 * @param {Object} props
 * @param {string} props.label - Menu item label text
 * @param {string} props.icon - Icon name for left side
 * @param {boolean} [props.isCollapsed=false] - Whether sidebar is collapsed
 * @param {boolean} [props.hasChildren=false] - Whether this is a group with children
 * @param {boolean} [props.isExpanded=false] - Whether group is expanded (for hasChildren)
 * @param {Function} [props.onClick] - Click handler (for buttons/groups)
 * @param {string} [props.to] - Route path (for NavLink)
 * @param {Array} [props.children] - Array of child menu items for dropdown (for hasChildren)
 * @param {string} [props.className] - Additional classes
 */
const SidebarMenuItem = ({
   label,
   icon,
   isCollapsed = false,
   hasChildren = false,
   isExpanded = false,
   isActive = false,
   onClick,
   to,
   children = [],
   className = "",
}) => {
   const hasRouter = typeof useInRouterContext === 'function' ? useInRouterContext() : false
   // Base classes - using unique sidebar-menu-item class
   const baseClasses = `sidebar-menu-item
    ${
      isCollapsed
         ? "flex h-10 w-10 items-center justify-center"
         : "inline-flex w-full items-center justify-between px-4 py-2 text-sm normal-case"
   }`;

   // Add rounded-full for non-group items when collapsed
   const variantClasses = hasChildren ? "" : isCollapsed ? "rounded-full" : "";

   // Combined className
   const combinedClassName =
      `${baseClasses} ${variantClasses} ${isActive ? "is-active" : ""} ${className}`.trim();

   // Add data-expanded attribute for groups
   const dataAttributes =
      hasChildren && isExpanded ? { "data-expanded": "true" } : {};

   // Icon and label content
   const content = (
      <span className="flex items-center gap-3">
         <Icon name={icon} size={16} />
         {!isCollapsed && (
            <span className="kol-mono-text text-[14px]">{label}</span>
         )}
      </span>
   );

   if (hasChildren) {
      // Group with children - render as button with child menu items

      return (
         <div key={label} className="relative">
            <button
               type="button"
               onClick={onClick}
               className={combinedClassName}
               {...dataAttributes}
            >
               {/* PLUS MINUS ICONS */}
               {content}
               {!isCollapsed && (
                  <div className="w-4 h-4 flex items-center justify-center gap-3">
                     <Icon
                        name={isExpanded ? "12px-minus" : "12px-plus"}
                        size={12}
                     />
                  </div>
               )}
            </button>

            {/* PARENT OF CHILD LIST */}
            {isExpanded && (
               <div
                  className={
                     isCollapsed
                        ? "absolute left-[calc(100%+12px)] z-20 flex flex-col w-full gap-2 rounded-full p-3"
                        : "mt-2 pl-4"
                  }
               >
                  <ul className="flex flex-col gap-2">
                    {children.map((child) => (
                       <li key={child.id}>
                           {hasRouter ? (
                              <NavLink
                                 to={child.path}
                                 className={({ isActive }) => {
                                    const baseClasses = isCollapsed
                                       ? "sidebar-menu-item inline-flex items-center gap-3 px-4 py-2 kol-mono-text text-[14px]"
                                       : "sidebar-menu-item inline-flex items-center gap-3 px-4 py-2 kol-mono-text text-[14px]";

                                    return `${baseClasses} ${isActive ? "is-active" : ""}`.trim();
                                 }}
                              >
                                 {child.icon && <Icon name={child.icon} size={16} />}
                                 <span>{child.label}</span>
                              </NavLink>
                           ) : (
                              <a
                                 href={child.path}
                                 className="sidebar-menu-item inline-flex items-center gap-3 px-4 py-2 kol-mono-text text-[14px]"
                              >
                                 {child.icon && <Icon name={child.icon} size={16} />}
                                 <span>{child.label}</span>
                              </a>
                           )}
                       </li>
                    ))}
                 </ul>
               </div>
            )}
         </div>
      );
   }

   // Direct link - render as NavLink
   if (!hasRouter) {
      return (
         <a
            href={to}
            className={combinedClassName}
            aria-label={isCollapsed ? label : undefined}
            title={isCollapsed ? label : undefined}
         >
            {content}
         </a>
      )
   }

   return (
      <NavLink
         to={to}
         end={!to || to === "."}
         className={({ isActive: navIsActive }) =>
            `${combinedClassName} ${navIsActive ? "is-active" : ""}`.trim()
         }
         aria-label={isCollapsed ? label : undefined}
         title={isCollapsed ? label : undefined}
      >
         {content}
      </NavLink>
   );
};

export default SidebarMenuItem;
