/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                // 'noonnu'라는 이름으로 폰트를 등록합니다.
                noonnu: ['NoonnuBasicGothic', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
