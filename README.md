# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


### Backend (`Python 3.12`)
- `Django 5.2.4`
- `Django REST Framework`
- `Channels 4.2.2` + `Daphne`
- `SimpleJWT` для авторизации
- `PostgreSQL` (через `psycopg2-binary`)
- `WebSockets` (подписки на карты, движение фигур)
- `Autobahn`, `Twisted` для стабильности соединения

### Frontend (SPA)
- `React 19 + react-konva` — визуальный канвас
- `Zustand` — глобальное состояние
- `Framer-motion` — анимации
- `React-Router 7`
- `Bootstrap 5 + bootstrap-icons`
- `Socket.IO-client`
- `Simplex-noise` для генерации хаоса/эффектов



# === Django и базовый стек ===
Django==5.2.4
djangorestframework==3.16.0
django-filter==25.1
django-cors-headers==4.7.0
djangorestframework-simplejwt==5.5.0

# === WebSockets (ASGI + Channels) ===
asgiref==3.9.1
channels==4.2.2
daphne==4.2.1

# === PostgreSQL ===
psycopg2-binary==2.9.10

# === Безопасность и токены ===
PyJWT==2.9.0
cryptography==45.0.5
pyOpenSSL==25.1.0

# === Twisted stack (для channels) ===
Twisted==25.5.0
autobahn==24.4.2
Automat==25.4.16
attrs==25.3.0
cffi==1.17.1
constantly==23.10.4
hyperlink==21.0.0
incremental==24.7.2
pyasn1==0.6.1
pyasn1-modules==0.4.2
service-identity==24.2.0
txaio==25.6.1
zope.interface==7.2

# === Утилиты и сопутствующие пакеты ===
sqlparse==0.5.3
setuptools==80.9.0
tzdata==2025.2
typing_extensions==4.14.1
