import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
// import tailwindcss from 'eslint-plugin-tailwindcss'; // TODO: Uncomment when plugin supports Tailwind CSS v4

const eslintConfig = defineConfig([
  globalIgnores([
    '**/fixtures/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
  ]),
  ...nextVitals,
  ...nextTypeScript,
  {
    // plugins: {
    //   tailwindcss,
    // },
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      // 'tailwindcss/no-custom-classname': 'off',
      // 'tailwindcss/classnames-order': 'error',
    },
    // settings: {
    //   tailwindcss: {
    //     callees: ['cn', 'cva'],
    //     config: null, // Tailwind CSS v4 uses CSS-based config
    //   },
    //   next: {
    //     rootDir: ['./'],
    //   },
    // },
    settings: {
      next: {
        rootDir: ['./'],
      },
    },
  },
]);

export default eslintConfig;
