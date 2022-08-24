# chat-app

Not as famous as Whatsapp or Telegram, chat-app is a modest Mobile chatting application.

## Key Features

- In it's start page, users can:
  - _Enter their Name_
  - _Select their a preferred background color to be used in the Chat-room page_
  - _Enter a single chat-room page_
- In the Chat-room page, users will be able to:
  - _View their history chat even if they are offline_
  - _Write and send new messages when online_
  - _Take a picture or select one from the library to send in the chat_
  - _share their current geolocation_

## This project was developed using:

- **React-Native:** A cross-platform JavaScript framework for native mobile applications. It's UI Components map native components in IOS and Android, making it almost as performant as Native Applications but, with the advantage of using a single Codebase.
- **Expo:** A Software Development Kit (SDK) used to develop and test the Mobile Application.
- **VS Code:** A free source-code editor developed by Microsoft (for Windows, Linux and macOS).
- **Android Studio:** with its Android emulator to test the App in Android Virtual Devices.
- **Expo Go:** A Mobile App to test the application in your smartphone device.
- **Firebase:** An app development platform backed by Google.
- **Firestore:** Google's cloud-hosted NoSQL Database that listens for real-time updates.

### Third-party packages

- GiftedChat
- React Native AsyncStorage
- NetInfo
- Expo's API (for Native Phone Capabilities)
- Babel

## User Stories

- As a new user, I want to be able to easily enter a chat room so I can quickly start talking to my friends and family.
- As a user, I want to be able to send messages to my friends and family members to exchange the latest news.
- As a user, I want to send images to my friends to show them what I’m currently doing.
- As a user, I want to share my location with my friends to show them where I am.
- As a user, I want to be able to read my messages offline so I can re-read conversations at any time.
- As a user with a visual impairment, I want to use a chat app that is compatible with a screen reader so that I can engage with a chat interface.

## How to run and test the project

1. Download and install the latest LTS version from Node.js: https://nodejs.org/en/
2. Install Expo CLI as a global npm package in your terminal: npm install --global expo-cli
3. To run the app on your phone install the 'Expo Go' app (from Google Play Store or the App Store).
4. Clone repository:
   git clone https://github.com/alelubos/chat-app.git

5. Situated in the project's folder, install all of its dependecies using in terminal:
   npm install
6. Start the Metro Bundler and serve the project from Terminal with:
   expo start
7. On your smartphone phone, open 'Expo Go' and either Scan the QR Code presented in your Terminal or manually type the address where the project is served.

## To implement your own DB with Firebase

### Follow the steps to use the chat-app using your own Firestore Database:

Go to Google Firebase and login with your Google account or create a new account.
Go to the Firebase console and create a new project.
Click on Develop on the menu and select Cloud Firestore and then Create Database
Follow the instructions to create a new database. (You can choose to start in test mode.)
Create a new collection called "messages".
Got to Project settings, you’ll find a section called Your apps. Click the Firestore for Web button (it may be shown as the </> icon).
A new screen opens asking you to register your web application to connect to the Cloud Firestore database you just created. Enter a name for your chat application and then click Register to generate the configuration code. Copy the contents of the firebaseConfig object and paste this configuration info into the firebaseConfig within the 'components/Chat.js' file.
