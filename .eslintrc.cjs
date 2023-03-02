module.exports = {
    extends: ['airbnb-base', 'airbnb-typescript/base', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    parserOptions: {
        project: './tsconfig.json'
    },
    rules: {
        'import/prefer-default-export': 'off',
    }
};
