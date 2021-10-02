const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// ! menambah satu data
// const contact1 = new contact({
//     nama: 'Pahrurozi',
//     nohp: '085338043144',
//     email: 'pahrurozi17@gmail.com'
// });

// const save = contact1.save().then(contact => {
//     console.log(contact);
// });