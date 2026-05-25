# User Authentication Implementation

## Packages Installed

```bash
npm install bcrypt jsonwebtoken
```

- **bcrypt**: For secure password hashing
- **jsonwebtoken**: For JWT token generation and verification

---

## 1. Sequelize CLI Model Generation

### Command Used

```bash
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string
```

This command generates both a migration file and a model file for the User entity.

### Migration File

**File:** `migrations/20260524144131-create-user.js`

```javascript
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
```

**Description:**
- Creates a `Users` table with auto-incrementing primary key
- Columns: `id`, `name`, `email`, `password`, `createdAt`, `updatedAt`
- `down()` method reverts the migration by dropping the table

### Model File

**File:** `models/user.js`

```javascript
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
```

**Description:**
- Defines the `User` model class extending Sequelize's `Model`
- Attributes: `name`, `email`, `password` (all STRING type)
- `associate()` method reserved for defining model relationships
- Exported as a factory function that receives `sequelize` and `DataTypes` instances

---

## 2. Authentication Controller

**File:** `controllers/auth.controller.js`

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = 'your_jwt_secret_key'; // Change this to environment variable in production

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            message: 'User logged in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

const logout = (req, res) => {
    // User is authenticated (verified by middleware)
    res.json({ message: 'User logged out successfully' });
};

module.exports = { register, login, logout };
```

**Description:**
- **register**: Validates email, hashes password with bcrypt, creates user, returns JWT token
- **login**: Validates credentials, compares password, returns JWT token
- **logout**: Simple logout handler for authenticated users

---

## 3. Authentication Middleware

**File:** `middlewares/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key'; // Should match the secret in auth.controller.js

// Middleware to verify token and check authentication
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Invalid authorization format' });
        }

        // Verify token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }

            // Attach user data to request
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Token verification failed', error: error.message });
    }
};

module.exports = { verifyToken };
```

**Description:**
- Middleware to verify JWT tokens on protected routes
- Extracts token from `Authorization: Bearer <token>` header
- Attaches decoded user data to `req.user`
- Returns 401 error for missing or invalid tokens

---

## 4. Authentication Routes

**File:** `routes/auth.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout); // Token verification required for logout

module.exports = router;
```

**Description:**
- `/register` - Public route for user registration
- `/login` - Public route for user login
- `/logout` - Protected route requiring valid JWT token

---

## 5. Main App File Integration

**File:** `index.js`

```javascript
const express = require('express')
const app = express()
const port = 3000
const productRoutes = require('./routes/products.routes');
const authRoutes = require('./routes/auth.routes');

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```

---

## 6. API Usage Examples

### Register a New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Logout User
```bash
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "User logged out successfully"
}
```

---

## 7. Using Authentication Middleware on Other Routes

To protect other routes, use the `verifyToken` middleware:

```javascript
const { verifyToken } = require('../middlewares/auth.middleware');

// Example protected route
router.get('/profile', verifyToken, (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user
    });
});
```
