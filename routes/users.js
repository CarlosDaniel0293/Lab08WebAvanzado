const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const router = express.Router();
const { body, validationResult } = require('express-validator');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users, errors: null }); 
});

router.post('/', 
  [
    body('name')
      .notEmpty().withMessage('El nombre es requerido')
      .matches(/^[a-zA-Z\s]*$/).withMessage('El nombre no debe contener caracteres especiales'),
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const users = await User.find(); 
      return res.status(400).render('index', { users, errors: errors.array() }); 
    }

    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/users');
  }
);

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
