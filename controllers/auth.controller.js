const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const secretKey = 'your_secret_key';


const login = async (req, res) => {
   const { email, password } = req.body;
   const user = await User.findOne({where: { email } });
   if(!user) {
       return res.status(400).json({ error: 'Invalid email or password' });
   }
   const isPasswordValid = bcrypt.compareSync(password, user.password);
   if(!isPasswordValid){
         return res.status(400).json({ error: 'Invalid email or password' });
   }
   const token = jwt.sign({ id: user.id, name: user.name }, secretKey, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });


}

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const isExist = await User.findOne({ where: { email } });
    console.log("is exist : ", isExist);
    if(isExist) {
        return res.status(400).json({ error: 'Email already exists' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user });
}

module.exports = {
    login,
    register
}