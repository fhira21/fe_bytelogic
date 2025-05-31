# Frontend Employee Evaluation & Project Management System

## 📌 Overview
This is the frontend repository for the **Employee Evaluation & Project Management System** built with React.js. It provides an intuitive interface for managers, employees, and clients to interact with the system's features.

## ✨ Features
- **Role-based Dashboard Views**
  - Manager Dashboard
  - Employee Dashboard
  - Client Dashboard
- **Project Management**
  - Project creation and assignment
  - Progress tracking
  - Deadline management
- **Employee Evaluation**
  - Performance review system
  - Rating submission
  - Evaluation history
- **Responsive Design**
  - Optimized for desktop and tablet devices

## 🛠️ Technologies Used
- **React.js** (v18+)
- **React Router** (v6) for navigation
- **Axios** for API communication
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **React Icons** for iconography

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm (v8+)
- Backend server running (see backend README)

### Installation
1. **Clone the repository**
   ```sh
   git clone https://github.com/fhira21/fe_bytelogic.git
   cd fe_bytelogic
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_ENV=development
   ```

4. **Run the development server**
   ```sh
   npm start
   ```
   The app will be available at `http://localhost:3000`

## 📂 Project Structure
```
src/
├── assets/            # Static assets
├── components/        # Reusable components
├── pages/             # Page components
├── routes/            # Application routes
├── services/          # API services
├── styles/            # Global styles
├── utils/             # Utility functions
├── App.js             # Main application component
└── index.js           # Application entry point
```

## 🔐 Authentication Flow
1. Users login with credentials
2. JWT token is stored in localStorage
3. Token is sent with each API request
4. Protected routes verify token validity

## 🎨 UI Components
- **Dashboard Cards**: Summary statistics
- **Data Tables**: Project and employee lists
- **Evaluation Forms**: Rating input with validation
- **Progress Bars**: Visual project tracking

## 🌐 API Integration
The frontend communicates with these main API endpoints:
- `/api/auth` - Authentication
- `/api/projects` - Project management
- `/api/evaluations` - Employee evaluations
- `/api/karyawan` - Employee data

## 📝 Available Scripts
- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run lint`: Runs ESLint for code quality

## 🐛 Troubleshooting
If you encounter issues:
1. Verify the backend server is running
2. Check browser console for errors
3. Ensure environment variables are properly set
4. Clear browser cache if experiencing stale data

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📜 License
This project is licensed under the MIT License.

## 📧 Contact
For questions or support, please contact:
- Fhira Triana Maulani - fhira@example.com
- Nur Wahyu Suci Rahayu - wahyu@example.com

---

**Happy Coding!** 🚀
