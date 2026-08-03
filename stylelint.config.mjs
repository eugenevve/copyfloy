/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order"],
  rules: {
    "order/properties-order": [
      [
        "position",
        "top",
        "right",
        "bottom",
        "left",

        "display",
        "flex",
        "flex-direction",
        "justify-content",
        "align-items",

        "width",
        "height",

        "margin",
        "padding",

        "border",
        "border-radius",

        "background",

        "color",

        "font-size",
        "font-weight",
        "line-height",

        "transition",
        "transform",
      ],
    ],
    "selector-class-pattern": null,
  },
};
