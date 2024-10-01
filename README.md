# Pottypal 🚻
PottyPal is a mobile application designed to help users locate, review, and rate public restrooms based on cleanliness, amenities, and overall experience. Whether you're traveling, in a city, or simply need a restroom nearby, PottyPal provides a user-friendly platform to help you find the best spots.

# Features ✨
- Location-Based Restroom Search: Quickly find nearby restrooms using GPS location.
- Detailed Restroom Information: Access details about restrooms, including cleanliness, accessibility, amenities, and photos.
- User Reviews & Ratings: Submit and view ratings for cleanliness, amenities (e.g., baby changing stations, wheelchair access), and overall quality.
- Favorites: Save your favorite restrooms for future visits.
- Issue Reporting: Report problems with restrooms such as cleanliness or closure.
- Real-Time Updates: See real-time updates on restroom availability and user reviews.

# Technologies Used 💻
- React Native for cross-platform mobile app development (iOS & Android)
- Firebase for backend services including:
    - Authentication (email, Google, Facebook login)
    - Firestore for real-time database
    - Cloud Storage for user-uploaded photos
- Google Maps API or Mapbox for map integration
- Redux Toolkit for state management

# Getting Started 🚀
**Prerequisites**
- Node.js and npm installed. You can download them from nodejs.org.
- React Native CLI installed
    - npm install -g react-native-cli
- Firebase Project: Create a Firebase project and configure the necessary services (Authentication, Firestore, and Cloud Storage).

**Installation**
- Clone the Repository:
  - git clone https://github.com/your-username/pottypal.git
  - cd pottypal
- Install Dependencies
  - npm install
- Set Up Firebase:
  - Follow the Firebase setup guide by downloading the configuration files (google-services.json for Android, GoogleService-Info.plist for iOS) and placing them in the appropriate directories
- Run the App:
  - For Android: npx react-native run-android
  - For iOS: npx react-native run-ios

# API Integration
PottyPal integrates with the following APIs for enhanced functionality:
- Google Places API: To locate public restrooms and get details.
- Refuge Restrooms API: To help users find safe restrooms for the transgender and non-binary community.
- OpenStreetMap (Overpass API): For additional public restroom location data.

# Contributing 🤝
We welcome contributions! Please follow these steps to contribute:
- Fork the repository
- Create a new branch (git checkout -b feature-branch)
- Make your changes and commit them (git commit -m 'Add feature')
- Push to the branch (git push origin feature-branch)
- Create a pull request and describe your changes

#License and Usage Restrictions ⚖️
PottyPal is a proprietary software application. You are not permitted to copy, distribute, modify, or reverse-engineer the software without explicit permission from PottyPal.
For licensing inquiries, commercial use, or redistribution rights, please contact PottyPal at jceballos@pottypal.co

# Acknowledgements 🙏
React Native
Firebase
Google Maps API
Redux Toolkit

