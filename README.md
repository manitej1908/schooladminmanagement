# School Administration Management System

A full-stack web application designed to simplify school administration and academic management through a centralized platform.

## 1. Project Overview

The School Administration Management System provides a digital platform for managing essential school operations. It offers separate interfaces for administrators, teachers, and students, allowing users to access functionality according to their roles.

The application helps organize student records, teacher information, classes, subjects, attendance, notices, and complaints.

## 2. Key Features

### Admin Module
- Administrator registration and login
- Student management
- Teacher management
- Class management
- Subject management
- Notice management
- Complaint management
- Administration dashboard

### Teacher Module
- Teacher login
- Access assigned classes and subjects
- Manage student attendance
- View relevant student information

### Student Module
- Student login
- Access personal academic information
- View attendance records
- Access available notices and information

### Other Modules
- Class Management
- Subject Management
- Attendance Management
- Notice Management
- Complaint Management

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Material UI | UI components and styling |
| Redux Toolkit | Frontend state management |
| Node.js | Backend runtime environment |
| Express.js | Backend API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modelling |
| bcrypt | Password hashing |
| Git and GitHub | Version control and source hosting |
| Render | Backend deployment |
| Vercel | Frontend deployment |

## 4. Project Architecture

The application follows a client-server architecture.

- **Frontend:** React handles the user interface and user interactions.
- **Backend:** Node.js and Express process requests and execute application logic.
- **Database:** MongoDB stores application data.
- **Communication:** The frontend communicates with the backend through HTTP API requests.

## 5. Project Structure

```text
schooladminmanagement/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── index.js
│   ├── seed.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── redux/
│   └── package.json
│
├── .gitignore
└── README.md
```

## 6. Database

The application uses MongoDB Atlas as its cloud database.

The database manages records related to:

- Administrators
- Teachers
- Students
- Classes
- Subjects
- Attendance
- Notices
- Complaints

Mongoose schemas define the structure of the stored data and the relationships between relevant collections.

## 7. Authentication and Security

The application provides separate login functionality for administrators, teachers, and students.

Password hashing is implemented using bcrypt. Backend controllers handle authentication and application requests.

Sensitive configuration values are maintained through environment variables rather than being included in source code.

## 8. Installation and Setup

### Prerequisites

- Node.js
- npm
- Git
- MongoDB Atlas account

### Clone the Repository

```bash
git clone https://github.com/manitej1908/schooladminmanagement.git

cd schooladminmanagement
```

### Backend Installation

Navigate to the backend directory:

```bash
cd backend
npm install
```

Configure the backend environment variables in a `.env` file:

```env
MONGO_URL=your_mongodb_connection_string
SECRET_KEY=your_secret_key
PORT=5000
```

Start the backend:

```bash
npm start
```

### Frontend Installation

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

For local development, configure the frontend API URL:

```env
REACT_APP_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

The frontend normally runs at:

`http://localhost:3000`

## 9. Database Configuration

The application uses MongoDB Atlas for cloud database storage.

To configure the database:

1. Create a MongoDB Atlas cluster.
2. Configure database access credentials.
3. Allow the backend server to connect to the cluster.
4. Add the MongoDB connection string to the backend `.env` file.
5. Start the backend server and verify the database connection.

## 10. Deployment

The project is deployed using the following services:

| Service | Responsibility |
|---|---|
| GitHub | Source code repository |
| Render | Backend hosting |
| Vercel | Frontend hosting |
| MongoDB Atlas | Cloud database hosting |

### Deployment Workflow

1. Source code is maintained in GitHub.
2. The backend is deployed through Render.
3. The frontend is deployed through Vercel.
4. The frontend connects to the deployed backend using the `REACT_APP_BASE_URL` environment variable.
5. The backend communicates with MongoDB Atlas to retrieve and store application data.

## 11. Future Enhancements

Potential improvements include:

- Online fee management
- Examination and result management
- Advanced attendance analytics
- Parent and guardian portal
- Automated notifications
- Improved reporting and data visualization
- Enhanced role-based permissions

These are proposed enhancements, not claims about currently implemented functionality.

## 12. Conclusion

The School Administration Management System demonstrates the development of a full-stack web application using the MERN technology stack.

By combining React, Node.js, Express, and MongoDB, the application provides a centralized platform for managing essential school activities. Its deployment through cloud services demonstrates the integration of frontend hosting, backend hosting, and cloud database infrastructure.

## 13. Project Repository

**GitHub:** https://github.com/manitej1908/schooladminmanagement

**Frontend:** Deployed on Vercel.

**Backend:** Deployed on Render.

**Database:** Hosted on MongoDB Atlas.