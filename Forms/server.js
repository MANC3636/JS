const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const formSchema = new mongoose.Schema({
    name: String,
    email: String
});

const Form = mongoose.model('Form', formSchema);

app.post('/submit-form', (req, res) => {
    const newForm = new Form({
        name: req.body.name,
        email: req.body.email
    });

    newForm.save((err) => {
        if (err) {
            res.json({ message: 'Error saving form data' });
        } else {
            res.json({ message: 'Form data saved successfully' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
