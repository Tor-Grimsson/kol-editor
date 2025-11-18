import js from "@eslint/js"

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**"
    ]
  },
  js.configs.recommended
]
